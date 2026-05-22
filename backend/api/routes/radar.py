from fastapi import APIRouter, Query
from typing import Optional
from agents.radar.national_radar import load_cache, build_projects

router = APIRouter()


@router.get("/projects")
async def get_projects(region: Optional[str] = Query(None)):
    """Serve real national projects from the cached real run. Empty until the
    pipeline has been run at least once (POST /api/projects/refresh)."""
    cached = load_cache()
    projects = cached.get("projects", []) if cached else []
    if region:
        projects = [p for p in projects if p.get("region") == region]
    return {
        "generated_at": cached.get("generated_at") if cached else None,
        "count": len(projects),
        "projects": projects,
    }


@router.post("/projects/refresh")
async def refresh_projects():
    """Run the live Tavily + LLM + geocoding pipeline and refresh the cache."""
    result = await build_projects()
    return {"generated_at": result["generated_at"], "count": result["count"],
            "source": result["source"]}
