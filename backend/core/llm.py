"""Provider-flexible async LLM client (OpenAI-compatible chat completions).

Uses NVIDIA's hosted API when a valid `nvapi-` key is set, otherwise falls back
to OpenRouter. Both speak the same OpenAI schema, so callers don't change."""
import asyncio
import json
import httpx
from core.config import settings

NVIDIA_URL   = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_MODEL = "meta/llama-3.3-70b-instruct"

OPENROUTER_URL   = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "google/gemma-4-31b-it:free"
OPENROUTER_HEADERS = {
    "HTTP-Referer": "https://github.com/investmap-maroc",
    "X-Title": "InvestMap Maroc",
}


def _provider() -> tuple[str, str, str, dict]:
    """Return (url, model, api_key, extra_headers) for the active provider."""
    key = settings.nvidia_api_key or ""
    if key.startswith("nvapi-"):
        return (NVIDIA_URL, NVIDIA_MODEL, key, {})
    return (OPENROUTER_URL, OPENROUTER_MODEL, settings.openrouter_api_key, OPENROUTER_HEADERS)


async def chat(
    messages: list[dict],
    temperature: float = 0.3,
    max_tokens: int = 1024,
    _retries: int = 3,
) -> str:
    """Send a chat request, return the assistant message content.
    Retries on 429 with exponential backoff."""
    url, model, key, extra = _provider()
    headers = {**extra, "Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {"model": model, "messages": messages, "temperature": temperature, "max_tokens": max_tokens}
    for attempt in range(_retries + 1):
        async with httpx.AsyncClient(timeout=180.0) as client:
            r = await client.post(url, headers=headers, json=payload)
            if r.status_code == 429 and attempt < _retries:
                wait = 5 * (attempt + 1)
                print(f"[LLM] 429 rate limit, retrying in {wait}s (attempt {attempt+1}/{_retries})")
                await asyncio.sleep(wait)
                continue
            r.raise_for_status()
            return r.json()["choices"][0]["message"]["content"]
    raise RuntimeError("LLM: max retries exceeded")


async def chat_json(messages: list[dict], **kwargs) -> dict:
    """Like chat() but parses JSON, stripping ```json fences if present."""
    text = (await chat(messages, **kwargs)).strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
        text = text.rsplit("```", 1)[0]
    text = text.strip()
    # Tolerate prose around the JSON object/array (common with chat models).
    if text and text[0] not in "{[":
        starts = [i for i in (text.find("{"), text.find("[")) if i != -1]
        ends = [i for i in (text.rfind("}"), text.rfind("]")) if i != -1]
        if starts and ends:
            text = text[min(starts):max(ends) + 1]
    return json.loads(text)
