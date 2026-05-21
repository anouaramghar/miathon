from agents.base import BaseAgent

class Agent3Matching(BaseAgent):
    label = "Identification des meilleures opportunités..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "matches": [
                {"business": "Pharmacie",         "score": 78, "verdict": "Forte opportunité"},
                {"business": "Papeterie",          "score": 71, "verdict": "Bonne opportunité"},
                {"business": "Magasin vêtements",  "score": 29, "verdict": "Risqué"},
            ]
        }
