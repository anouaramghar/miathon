"""Thin async wrapper around OpenRouter's OpenAI-compatible chat completions API."""
import asyncio
import json
import httpx
from core.config import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
# Free model with good instruction-following and JSON output
DEFAULT_MODEL  = "google/gemma-4-31b-it:free"
HEADERS = {
    "HTTP-Referer": "https://github.com/investmap-maroc",
    "X-Title": "InvestMap Maroc",
}


async def chat(
    messages: list[dict],
    model: str = DEFAULT_MODEL,
    temperature: float = 0.3,
    max_tokens: int = 1024,
    _retries: int = 3,
) -> str:
    """Send a chat request and return the assistant message content as a string.
    Retries up to _retries times on 429 with exponential backoff."""
    headers = {
        **HEADERS,
        "Authorization": f"Bearer {settings.openrouter_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    for attempt in range(_retries + 1):
        async with httpx.AsyncClient(timeout=40.0) as client:
            r = await client.post(OPENROUTER_URL, headers=headers, json=payload)
            if r.status_code == 429 and attempt < _retries:
                wait = 5 * (attempt + 1)
                print(f"[OpenRouter] 429 rate limit, retrying in {wait}s (attempt {attempt+1}/{_retries})")
                await asyncio.sleep(wait)
                continue
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
    raise RuntimeError("OpenRouter: max retries exceeded")


async def chat_json(messages: list[dict], **kwargs) -> dict:
    """Like chat() but parses the response as JSON. Strips markdown fences if present."""
    text = await chat(messages, **kwargs)
    # Strip ```json ... ``` fences that some models wrap around JSON
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    return json.loads(text.strip())
