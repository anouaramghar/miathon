import asyncio
import httpx
from core.llm import chat_json

# The 7 sector keys and 12 regions the frontend knows how to render. The LLM is
# constrained to these so colors, filters, and the map keep working.
SECTORS = ["infrastructure", "energie", "industrie", "tourisme", "agriculture", "immobilier", "tech"]
REGIONS = [
    "Tanger-Tétouan-Al Hoceïma", "Oriental", "Fès-Meknès", "Rabat-Salé-Kénitra",
    "Béni Mellal-Khénifra", "Casablanca-Settat", "Marrakech-Safi", "Drâa-Tafilalet",
    "Souss-Massa", "Guelmim-Oued Noun", "Laâyoune-Sakia El Hamra", "Dakhla-Oued Ed-Dahab",
]

# Region centroids (geographic facts) — reliable fallback when a project's exact
# city can't be geocoded.
REGION_CENTROIDS = {
    "Tanger-Tétouan-Al Hoceïma": [35.58, -5.37], "Oriental": [34.68, -2.30],
    "Fès-Meknès": [34.04, -4.80], "Rabat-Salé-Kénitra": [34.02, -6.50],
    "Béni Mellal-Khénifra": [32.34, -6.35], "Casablanca-Settat": [33.50, -7.50],
    "Marrakech-Safi": [31.63, -8.00], "Drâa-Tafilalet": [31.30, -5.50],
    "Souss-Massa": [30.42, -9.20], "Guelmim-Oued Noun": [28.99, -10.06],
    "Laâyoune-Sakia El Hamra": [27.15, -13.20], "Dakhla-Oued Ed-Dahab": [23.72, -15.94],
}

NOMINATIM = "https://nominatim.openstreetmap.org/search"
NOMINATIM_HEADERS = {"User-Agent": "InvestMap-Maroc/1.0 hackathon@eniad.ma"}

import unicodedata

# Generic words that shouldn't drive duplicate detection.
_STOPWORDS = {
    "de", "du", "des", "la", "le", "les", "et", "a", "au", "aux", "el", "the", "of",
    "projet", "project", "hotel", "mine", "port", "aeroport", "airport", "usine",
    "developpement", "amenagement", "expansion", "extension", "parc", "centrale",
    "edition", "limited", "phase", "maroc", "morocco", "new", "nouveau", "nouvelle",
}


def _name_tokens(name: str) -> set[str]:
    s = unicodedata.normalize("NFKD", name.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return {t for t in "".join(c if c.isalnum() else " " for c in s).split()
            if len(t) > 2 and t not in _STOPWORDS}


def _is_dup(toks: set[str], seen: list[set[str]]) -> bool:
    """Duplicate if the significant tokens are a subset of, or heavily overlap
    (Jaccard >= 0.6), an already-seen project name."""
    for prev in seen:
        if not toks or not prev:
            continue
        if toks <= prev or prev <= toks:
            return True
        inter = len(toks & prev)
        if inter and inter / len(toks | prev) >= 0.6:
            return True
    return False

_SYSTEM = """Tu es un analyste qui extrait des projets d'investissement réels au Maroc
à partir d'articles de presse. Tu réponds UNIQUEMENT en JSON valide, sans texte
avant ou après. N'invente AUCUN projet : extrais seulement ceux explicitement
mentionnés dans les articles fournis."""

_PROMPT = """À partir des extraits d'articles ci-dessous, extrais les projets
d'investissement réels au Maroc (grands projets : industrie, énergie,
infrastructure, tourisme, immobilier, agriculture, tech).

ARTICLES :
{articles}

Réponds avec ce JSON exact :
{{
  "projects": [
    {{
      "name": "nom du projet",
      "sector": "un parmi: {sectors}",
      "region": "une parmi: {regions}",
      "city": "ville ou localité précise si mentionnée, sinon ''",
      "amount": 1000,
      "promoter": "porteur du projet si mentionné, sinon ''",
      "phase": "en_cours ou planifie",
      "progress": 30,
      "jobs": 1500,
      "launch": "année prévue ex 2027",
      "source_url": "l'URL de l'article d'où vient ce projet"
    }}
  ]
}}

Règles :
- "amount" en MILLIONS de dirhams (ex: 10 milliards DH = 10000). Mets 0 si non précisé.
- "sector" et "region" DOIVENT être exactement une des valeurs listées (déduis la région depuis la ville/le lieu mentionné).
- "progress" : pourcentage d'avancement 0-100 si connu, sinon 0.
- "jobs" : nombre d'emplois si mentionné, sinon null.
- "source_url" : OBLIGATOIRE, l'URL exacte de l'article source.
- Extrais TOUS les projets distincts réellement présents dans ces articles (industrie,
  énergie, infrastructure, tourisme, immobilier, agriculture, tech), même si le montant
  n'est pas précisé. N'INVENTE RIEN et ne force aucun nombre — uniquement ce qui est cité."""


class Agent7Analyzer:
    """LLM-extracts structured projects from articles, then geocodes them."""

    BATCH_SIZE = 12

    async def analyze(self, articles: list[dict]) -> list[dict]:
        """Extract projects in small batches (thorough per-call), then merge,
        dedup by name, geocode."""
        if not articles:
            return []

        batches = [articles[i:i + self.BATCH_SIZE] for i in range(0, len(articles), self.BATCH_SIZE)]
        merged, seen_tokens = [], []
        for bi, batch in enumerate(batches):
            raw = await self._extract_batch(batch)
            print(f"[Agent7] batch {bi+1}/{len(batches)}: {len(raw)} projects")
            for p in raw:
                toks = _name_tokens(p.get("name") or "")
                if toks and not _is_dup(toks, seen_tokens):
                    seen_tokens.append(toks)
                    merged.append(p)

        # Prioritize by amount, cap for a clean map.
        merged.sort(key=lambda p: p.get("amount") or 0, reverse=True)
        projects = []
        for i, p in enumerate(merged[:28], start=1):
            cleaned = self._clean(p, i)
            if cleaned:
                projects.append(cleaned)

        await self._geocode_all(projects)
        return projects

    async def _extract_batch(self, batch: list[dict]) -> list[dict]:
        blob = "\n\n".join(
            f"[{i+1}] {a['title']}\nURL: {a['url']}\n{(a['content'] or '')[:2500]}"
            for i, a in enumerate(batch)
        )
        prompt = _PROMPT.format(articles=blob, sectors=", ".join(SECTORS), regions=", ".join(REGIONS))
        try:
            result = await chat_json(
                [{"role": "system", "content": _SYSTEM},
                 {"role": "user", "content": prompt}],
                max_tokens=4096,
            )
            return result.get("projects", []) if isinstance(result, dict) else []
        except Exception as e:
            print(f"[Agent7] batch extraction failed: {e}")
            return []

    def _clean(self, p: dict, idx: int) -> dict | None:
        name = (p.get("name") or "").strip()
        sector = p.get("sector") if p.get("sector") in SECTORS else "infrastructure"
        region = p.get("region") if p.get("region") in REGIONS else None
        if not name or not region:
            return None
        try:
            amount = int(float(p.get("amount") or 0))
        except (TypeError, ValueError):
            amount = 0
        phase = "en_cours" if p.get("phase") == "en_cours" else "planifie"
        try:
            progress = max(0, min(100, int(p.get("progress") or 0)))
        except (TypeError, ValueError):
            progress = 0
        jobs = p.get("jobs")
        try:
            jobs = int(jobs) if jobs not in (None, "", "null") else None
        except (TypeError, ValueError):
            jobs = None
        return {
            "id": idx,
            "name": name,
            "sector": sector,
            "region": region,
            "city": (p.get("city") or "").strip(),
            "amount": amount,
            "promoter": (p.get("promoter") or "").strip(),
            "phase": phase,
            "progress": progress,
            "jobs": jobs,
            "launch": str(p.get("launch") or "").strip(),
            "source": (p.get("source_url") or "").strip(),
            "featured": amount >= 5000,
        }

    async def _geocode_all(self, projects: list[dict]) -> None:
        """Fill lat/lng for each project. Geocode the city via Nominatim when
        present (sequential, ~1 req/s), else fall back to the region centroid."""
        async with httpx.AsyncClient(timeout=20.0, headers=NOMINATIM_HEADERS) as client:
            for p in projects:
                lat = lng = None
                if p["city"]:
                    try:
                        r = await client.get(NOMINATIM, params={
                            "q": f"{p['city']}, Maroc", "format": "json", "limit": 1})
                        data = r.json()
                        if data:
                            lat, lng = float(data[0]["lat"]), float(data[0]["lon"])
                    except Exception:
                        pass
                    await asyncio.sleep(1.1)  # respect Nominatim usage policy (always)
                if lat is None:
                    lat, lng = REGION_CENTROIDS.get(p["region"], [31.79, -7.09])
                    p["geo"] = "region"   # approximate — region centroid
                else:
                    p["geo"] = "city"     # precise — geocoded city
                p["lat"], p["lng"] = lat, lng
