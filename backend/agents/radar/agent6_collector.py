from agents.base import BaseAgent
from core.tavily import search

# Thematic queries covering the main investment sectors nationwide. Kept small
# to stay within the Tavily free tier while giving broad national coverage.
_QUERIES = [
    "grands projets investissement Maroc milliards dirhams 2025 2026",
    "nouveaux projets industriels usine Maroc investissement 2026",
    "projets énergie renouvelable solaire éolien hydrogène Maroc 2026",
    "projets infrastructure port autoroute TGV aéroport Maroc 2026",
    "projets touristiques immobiliers zones industrielles Maroc 2026",
]


class Agent6Collector(BaseAgent):
    label = "Vérification des grands projets nationaux..."

    async def _run_mock(self, context: dict) -> dict:
        return {"collected": 0}

    async def collect(self) -> list[dict]:
        """Run all thematic searches and return a deduplicated list of articles."""
        seen, articles = set(), []
        for q in _QUERIES:
            try:
                results = await search(q, max_results=6)
            except Exception as e:
                print(f"[Agent6] Tavily search failed for '{q}': {e}")
                continue
            for r in results:
                url = r.get("url", "")
                if url and url not in seen:
                    seen.add(url)
                    articles.append(r)
        return articles
