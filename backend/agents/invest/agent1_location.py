from agents.base import BaseAgent

class Agent1Location(BaseAgent):
    label = "Analyse des commerces de ton quartier..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "location": {
                "pharmacies_1km": 0,
                "population_radius": 12400,
                "avg_income": 4800,
                "commercial_gaps": ["pharmacie", "papeterie", "lavage_auto"],
                "competitors_1km": 0,
                "competitors": [
                    {"type": "Café", "count": 6},
                    {"type": "Restaurant", "count": 4},
                    {"type": "Boulangerie", "count": 3},
                    {"type": "Magasin vêtements", "count": 2},
                    {"type": "Pharmacie (1.8km)", "count": 1, "far": True},
                ],
            }
        }
