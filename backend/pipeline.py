import asyncio
import json
import uuid
from agents.invest.agent1_location import Agent1Location
from agents.invest.agent2_demand import Agent2Demand
from agents.invest.agent3_matching import Agent3Matching
from agents.invest.agent4_admin import Agent4Admin
from agents.invest.agent5_predictor import Agent5Predictor

INVEST_AGENTS = [
    Agent1Location(),
    Agent2Demand(),
    Agent3Matching(),
    Agent4Admin(),
    Agent5Predictor(),
]

# job_id → asyncio.Queue of SSE event dicts
_jobs: dict[str, asyncio.Queue] = {}

def create_job() -> str:
    job_id = str(uuid.uuid4())
    _jobs[job_id] = asyncio.Queue()
    return job_id

def assemble_scenario(context: dict) -> dict:
    """Map agent context keys to the SCENARIOS shape the frontend Dashboard expects."""
    scores = context.get("scores", {})
    top = scores.get("top_recommendation", {})
    return {
        "kind": "particulier",
        "user": {
            "name": context.get("neighborhood", "Utilisateur"),
            "profile": context.get("profile", "mre"),
            "profileLabel": context.get("profile", "MRE").upper(),
            "city": context.get("city", "Berkane"),
            "neighborhood": context.get("neighborhood", ""),
            "budget": 0,
            "budgetId": context.get("budget", ""),
            "budgetBand": context.get("budget", ""),
        },
        "neighborhood": context.get("location", {}),
        "competitors": context.get("location", {}).get("competitors", []),
        "topRecommendation": top,
        "matches": context.get("matches", []),
        "admin_steps": context.get("admin_steps", []),
        "radarBoost": scores.get("radar_boost"),
        "location": context.get("location", {}),
        "demand": context.get("demand", {}),
    }

async def run_invest_pipeline(job_id: str, form: dict):
    queue = _jobs[job_id]
    context = form.copy()

    try:
        for i, agent in enumerate(INVEST_AGENTS, start=1):
            await queue.put({"type": "agent_start", "agent": i, "label": agent.label})
            result = await agent.run(context)
            context.update(result)
            await queue.put({"type": "agent_done", "agent": i, "data": result})

        await queue.put({"type": "complete", "scenario": assemble_scenario(context)})
    except Exception as e:
        print(f"[pipeline] unexpected error: {e}")
        await queue.put({"type": "error", "message": str(e)})
    finally:
        await queue.put(None)  # sentinel — always sent so the stream never hangs

async def stream_job(job_id: str):
    if job_id not in _jobs:
        yield f"event: error\ndata: {json.dumps({'message': 'job not found'})}\n\n"
        return

    queue = _jobs[job_id]
    try:
        while True:
            event = await asyncio.wait_for(queue.get(), timeout=120.0)
            if event is None:
                break
            yield f"event: {event['type']}\ndata: {json.dumps(event)}\n\n"
    except asyncio.TimeoutError:
        yield f"event: error\ndata: {json.dumps({'message': 'timeout'})}\n\n"
    finally:
        _jobs.pop(job_id, None)
