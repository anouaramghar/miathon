from agents.base import BaseAgent
from core.llm import chat_json

_SYSTEM = """Tu es un analyste financier et expert en investissement au Maroc.
Tu réponds UNIQUEMENT en JSON valide, sans texte avant ou après.
Tous les textes sont en français."""

_PROMPT = """Analyse complète de l'opportunité d'investissement :

Investisseur : profil {profile}, ville {city}, budget {budget} DH
Recommandation principale : {business} (score initial {score}/100)
Manques commerciaux terrain : {gaps}
Concurrents existants : {competitors}
Signal de demande : {demand_signal}

Calcule le score final de succès et génère l'analyse détaillée.

Réponds avec ce JSON exact :
{{
  "scores": {{
    "top_recommendation": {{
      "business": "{business}",
      "score": 82,
      "verdict": "Forte opportunité",
      "positives": [
        {{"label": "point fort", "weight": "+20", "detail": "explication"}},
        {{"label": "point fort", "weight": "+15", "detail": "explication"}},
        {{"label": "point fort", "weight": "+10", "detail": "explication"}}
      ],
      "risks": [
        {{"label": "risque", "weight": "-8", "detail": "explication"}},
        {{"label": "risque", "weight": "-5", "detail": "explication"}}
      ],
      "finance": {{
        "investment": {{"low": 80000, "high": 150000}},
        "monthlyNet":  {{"low": 12000, "high": 20000}},
        "roiMonths":   {{"low": 12, "high": 18}}
      }}
    }},
    "radar_boost": null
  }}
}}

Adapte les montants financiers au budget de l'investisseur et au marché marocain réaliste.
Score de 0 à 100 basé sur les données terrain réelles."""


class Agent5Predictor(BaseAgent):
    label = "Calcul de la probabilité de succès..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "scores": {
                "top_recommendation": {
                    "business": "Pharmacie",
                    "score": 78,
                    "verdict": "Forte opportunité",
                    "positives": [
                        {"label": "0 pharmacie dans 1.2 km",       "weight": "+25", "detail": "vide commercial confirmé"},
                        {"label": "340 recherches/mois sur Google", "weight": "+15", "detail": "demande active non satisfaite"},
                        {"label": "Revenu moyen 4 800 DH",         "weight": "+10", "detail": "pouvoir d'achat correct"},
                        {"label": "Nador West Med à 60 km",        "weight": "+5",  "detail": "bonus Radar — flux démographique attendu"},
                    ],
                    "risks": [
                        {"label": "Grande pharmacie à 1.8 km",       "weight": "-8", "detail": "concurrence indirecte"},
                        {"label": "Licence Santé : délai 8 semaines","weight": "—",  "detail": "lent mais prévisible"},
                    ],
                    "finance": {
                        "investment": {"low": 130000, "high": 160000},
                        "monthlyNet":  {"low": 15000,  "high": 22000},
                        "roiMonths":   {"low": 14,      "high": 18},
                    },
                },
                "radar_boost": None,
            }
        }

    async def _run_live(self, context: dict) -> dict:
        import asyncio
        await asyncio.sleep(10)  # space out requests to stay under free-tier rate limit
        location = context.get("location", {})
        demand   = context.get("demand", {})
        matches  = context.get("matches", [])
        top      = matches[0] if matches else {"business": "commerce", "score": 60}

        prompt = _PROMPT.format(
            profile=context.get("profile", "mre"),
            city=context.get("city", "Berkane"),
            budget=context.get("budget", "30-150"),
            business=top["business"],
            score=top.get("score", 60),
            gaps=", ".join(location.get("commercial_gaps", [])) or "aucun",
            competitors=", ".join(
                f"{c['type']} ({c['count']})" for c in location.get("competitors", [])
            ) or "aucun",
            demand_signal=demand.get("demand_signal", "modérée"),
        )

        try:
            result = await chat_json([
                {"role": "system", "content": _SYSTEM},
                {"role": "user",   "content": prompt},
            ])
            if "scores" in result:
                return {"scores": result["scores"]}
        except Exception as e:
            print(f"[Agent5] OpenRouter failed ({e}), falling back to mock")

        return await self._run_mock(context)
