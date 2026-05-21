from agents.base import BaseAgent

class Agent7Analyzer(BaseAgent):
    label = "Extraction structurée des projets..."

    async def _run_mock(self, context: dict) -> dict:
        # LLM extraction runs in live mode only.
        return {"analyzed": 0}
