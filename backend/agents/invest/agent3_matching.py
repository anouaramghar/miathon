import json
from agents.base import BaseAgent
from core.openrouter import chat_json

_SYSTEM = """Tu es un expert en analyse de marché et investissement au Maroc.
Tu réponds UNIQUEMENT en JSON valide, sans texte avant ou après.
Tous les textes dans ta réponse sont en français."""

_PROMPT = """Contexte investisseur :
- Profil : {profile}
- Ville : {city}, quartier : {neighborhood}
- Budget : {budget} DH

Données terrain (OpenStreetMap) :
- Manques commerciaux détectés : {gaps}
- Concurrents existants : {competitors}
- Signal de demande : {demand_signal} (volume estimé : {search_volume})

Identifie les 3 meilleures opportunités d'investissement pour ce profil.

Réponds avec ce JSON exact :
{{
  "matches": [
    {{
      "business": "nom du commerce",
      "score": 85,
      "verdict": "Forte opportunité"
    }},
    {{
      "business": "nom du commerce",
      "score": 65,
      "verdict": "Bonne opportunité"
    }},
    {{
      "business": "nom du commerce",
      "score": 35,
      "verdict": "Risqué"
    }}
  ]
}}

Ordonne par score décroissant. Score de 0 à 100."""


class Agent3Matching(BaseAgent):
    label = "Identification des meilleures opportunités..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "matches": [
                {"business": "Pharmacie",        "score": 78, "verdict": "Forte opportunité"},
                {"business": "Papeterie",         "score": 71, "verdict": "Bonne opportunité"},
                {"business": "Magasin vêtements", "score": 29, "verdict": "Risqué"},
            ]
        }

    async def _run_live(self, context: dict) -> dict:
        location = context.get("location", {})
        demand   = context.get("demand", {})

        prompt = _PROMPT.format(
            profile=context.get("profile", "mre"),
            city=context.get("city", "Berkane"),
            neighborhood=context.get("neighborhood", ""),
            budget=context.get("budget", "30-150"),
            gaps=", ".join(location.get("commercial_gaps", [])) or "aucun",
            competitors=", ".join(
                f"{c['type']} ({c['count']})" for c in location.get("competitors", [])
            ) or "aucun",
            demand_signal=demand.get("demand_signal", "inconnue"),
            search_volume=demand.get("search_volume", "?"),
        )

        try:
            result = await chat_json([
                {"role": "system", "content": _SYSTEM},
                {"role": "user",   "content": prompt},
            ])
            if "matches" in result:
                return {"matches": result["matches"]}
        except Exception as e:
            print(f"[Agent3] OpenRouter failed ({e}), falling back to mock")

        return await self._run_mock(context)
