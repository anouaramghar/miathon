from abc import ABC, abstractmethod
from core.config import settings

class BaseAgent(ABC):
    label: str = ""

    @abstractmethod
    async def _run_mock(self, context: dict) -> dict:
        ...

    async def _run_live(self, context: dict) -> dict:
        # Live API calls are implemented in a later spec.
        return await self._run_mock(context)

    async def run(self, context: dict) -> dict:
        if settings.agent_mode == "mock":
            return await self._run_mock(context)
        return await self._run_live(context)
