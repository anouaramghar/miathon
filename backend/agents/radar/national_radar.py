"""National Radar pipeline: Tavily search -> LLM extraction -> geocoding, with
a JSON cache that doubles as the demo-day safety net (real data, never static)."""
import json
import time
from pathlib import Path
from agents.radar.agent6_collector import Agent6Collector
from agents.radar.agent7_analyzer import Agent7Analyzer

_CACHE = Path(__file__).resolve().parents[2] / "data" / "national_projects_cache.json"

_collector = Agent6Collector()
_analyzer = Agent7Analyzer()


def load_cache() -> dict | None:
    if _CACHE.exists():
        try:
            return json.loads(_CACHE.read_text(encoding="utf-8"))
        except Exception:
            return None
    return None


def _save_cache(projects: list[dict]) -> None:
    _CACHE.parent.mkdir(parents=True, exist_ok=True)
    payload = {"generated_at": int(time.time()), "count": len(projects), "projects": projects}
    _CACHE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


async def build_projects() -> dict:
    """Run the live pipeline and refresh the cache. Returns the cache payload.
    Raises nothing destructive — on failure the previous cache is left intact."""
    articles = await _collector.collect()
    projects = await _analyzer.analyze(articles)
    if projects:
        _save_cache(projects)
        return {"generated_at": int(time.time()), "count": len(projects),
                "projects": projects, "source": "live"}
    # Live run produced nothing — keep whatever real data we already cached.
    cached = load_cache()
    if cached:
        cached["source"] = "cache"
        return cached
    return {"generated_at": int(time.time()), "count": 0, "projects": [], "source": "empty"}
