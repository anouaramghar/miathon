from agents.base import BaseAgent

class Agent6Collector(BaseAgent):
    label = "Vérification des grands projets nationaux..."

    async def _run_mock(self, context: dict) -> dict:
        # Radar projects are pre-loaded in DB via seed.py.
        # Agent6 runs on APScheduler every 24h in live mode.
        return {"collected": 0}
