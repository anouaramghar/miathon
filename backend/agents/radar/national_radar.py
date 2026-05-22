"""National Radar pipeline: Tavily search -> LLM extraction -> geocoding, with
a JSON cache that doubles as the demo-day safety net (real data, never static)."""
import json
import math
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


def _haversine_km(lat1, lng1, lat2, lng2) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lng2 - lng1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))


def nearest_project(lat: float, lng: float, max_km: float = 150.0) -> dict | None:
    """Real micro↔macro link: from the cached national projects, return the
    most significant one within `max_km` of the investor (by amount), annotated
    with its real distance. None if nothing is close enough."""
    cached = load_cache()
    if not cached:
        return None
    candidates = []
    for p in cached.get("projects", []):
        # Only city-geocoded projects have reliable coordinates; region-centroid
        # ones would give meaningless distances.
        if p.get("geo") != "city" or p.get("lat") is None:
            continue
        d = _haversine_km(lat, lng, p["lat"], p["lng"])
        if d <= max_km:
            candidates.append((d, p))
    if not candidates:
        return None
    # Prefer the biggest project nearby; distance breaks ties.
    best = max(candidates, key=lambda dp: (dp[1].get("amount") or 0, -dp[0]))
    dist, proj = best
    return {**proj, "distance_km": round(dist)}


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
