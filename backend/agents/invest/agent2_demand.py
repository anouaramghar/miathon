from agents.base import BaseAgent

class Agent2Demand(BaseAgent):
    label = "Mesure de la demande locale..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "demand": {
                "pharmacie_search_volume": 340,
                "demand_signal": "forte",
                "seasonality": ["hiver", "ramadan"],
                "top_complaints": ["trop loin", "pas dans ce quartier"],
            }
        }
