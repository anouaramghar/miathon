"""Thin async wrapper around the Tavily search API (LLM-grounding search)."""
import httpx
from core.config import settings

TAVILY_URL = "https://api.tavily.com/search"


async def search(query: str, max_results: int = 6, days: int = 365) -> list[dict]:
    """Run a Tavily search and return a list of {title, url, content} results.

    `days` limits results to recent news; raises on transport/auth errors so the
    caller can decide whether to fall back."""
    payload = {
        "api_key": settings.tavily_api_key,
        "query": query,
        "search_depth": "advanced",
        "topic": "news",
        "days": days,
        "max_results": max_results,
        "include_answer": False,
        "include_raw_content": False,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(TAVILY_URL, json=payload)
        r.raise_for_status()
        data = r.json()
    return [
        {"title": x.get("title", ""), "url": x.get("url", ""), "content": x.get("content", "")}
        for x in data.get("results", [])
    ]
