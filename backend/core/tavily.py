"""Thin async wrapper around the Tavily search API (LLM-grounding search)."""
import httpx
from core.config import settings

TAVILY_URL = "https://api.tavily.com/search"


async def search(query: str, max_results: int = 6, days: int = 365, topic: str = "news") -> list[dict]:
    """Run a Tavily search and return [{title, url, content}].

    Fetches full page content (include_raw_content) so the extractor sees the
    figures buried in article bodies, not just the snippet. `topic` is "news"
    (recent press, bounded by `days`) or "general" (official/structured pages)."""
    payload = {
        "api_key": settings.tavily_api_key,
        "query": query,
        "search_depth": "advanced",
        "topic": topic,
        "max_results": max_results,
        "include_answer": False,
        "include_raw_content": True,
    }
    if topic == "news":
        payload["days"] = days
    async with httpx.AsyncClient(timeout=40.0) as client:
        r = await client.post(TAVILY_URL, json=payload)
        r.raise_for_status()
        data = r.json()
    return [
        {
            "title": x.get("title", ""),
            "url": x.get("url", ""),
            "content": x.get("raw_content") or x.get("content", ""),
        }
        for x in data.get("results", [])
    ]
