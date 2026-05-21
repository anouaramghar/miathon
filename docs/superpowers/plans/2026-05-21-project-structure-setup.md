# InvestMap Maroc — Project Structure Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the flat-file prototype into a real monorepo with a Vite frontend, FastAPI backend with 5 mock invest agents, SSE streaming pipeline, and Docker Compose stack — all running end-to-end with `AGENT_MODE=mock`.

**Architecture:** React frontend (Vite) proxies API calls to FastAPI backend. User form submission triggers `POST /api/analyze`, which starts a background agent pipeline and returns a `job_id`. The Loading screen opens an SSE connection to `GET /api/stream/{job_id}` and receives real-time agent progress events. All agents have a mock mode that returns hardcoded data matching the existing `data.js` scenarios.

**Tech Stack:** React 18 + Vite 5, FastAPI + uvicorn, asyncio + SSE, pytest + pytest-asyncio, Docker + postgis/postgis:16-3.4 + redis:7-alpine

---

## File Map

### New files (backend)
- `backend/requirements.txt` — Python dependencies
- `backend/main.py` — FastAPI app with CORS + routers
- `backend/core/__init__.py`
- `backend/core/config.py` — pydantic-settings: AGENT_MODE, API keys, DB URL
- `backend/agents/__init__.py`
- `backend/agents/base.py` — BaseAgent abstract class with mock/live dispatch
- `backend/agents/invest/__init__.py`
- `backend/agents/invest/agent1_location.py` — competitor + gap analysis (mock)
- `backend/agents/invest/agent2_demand.py` — search volume + demand signals (mock)
- `backend/agents/invest/agent3_matching.py` — top 3 business matches (mock)
- `backend/agents/invest/agent4_admin.py` — profile-based admin steps (mock)
- `backend/agents/invest/agent5_predictor.py` — success score + radar bonus (mock)
- `backend/agents/radar/__init__.py`
- `backend/agents/radar/agent6_collector.py` — scheduler stub (no-op in mock)
- `backend/agents/radar/agent7_analyzer.py` — LLM extraction stub (no-op in mock)
- `backend/api/__init__.py`
- `backend/api/routes/__init__.py`
- `backend/api/routes/invest.py` — POST /api/analyze, GET /api/stream/{id}
- `backend/api/routes/radar.py` — GET /api/projects, GET /api/projects/{region}
- `backend/pipeline.py` — asyncio.Queue-based SSE pipeline orchestrator
- `backend/db/__init__.py`
- `backend/db/models.py` — SQLAlchemy RadarProject model
- `backend/db/seed.py` — seeds 20 radar projects from NATIONAL_PROJECTS
- `backend/Dockerfile`
- `backend/tests/__init__.py`
- `backend/tests/test_health.py`
- `backend/tests/test_agents.py`
- `backend/tests/test_pipeline.py`
- `backend/tests/test_radar.py`

### New files (frontend)
- `frontend/package.json`
- `frontend/vite.config.js`
- `frontend/index.html`
- `frontend/src/main.jsx`
- `frontend/src/App.jsx` — migrated from `app.jsx`, uses ES imports
- `frontend/src/styles.css` — copied from `styles.css`
- `frontend/src/data/scenarios.js` — migrated from `data.js`, ES module exports
- `frontend/src/personalize.js` — migrated from `personalize.js`, ES exports
- `frontend/src/hooks/useAgentStream.js` — SSE hook: job_id → events, scenario, done
- `frontend/src/hooks/useScenario.js` — scenario state + fallback logic
- `frontend/src/pages/Landing.jsx` — migrated from `landing.jsx`
- `frontend/src/pages/Questionnaire.jsx` — migrated from `questionnaire.jsx`
- `frontend/src/pages/Loading.jsx` — migrated from `loading.jsx`, driven by SSE hook
- `frontend/src/pages/Dashboard.jsx` — migrated from `dashboard.jsx`
- `frontend/src/pages/CRIDashboard.jsx` — migrated from `cri-dashboard.jsx`
- `frontend/src/pages/Results.jsx` — migrated from `results.jsx`
- `frontend/src/components/shared/TweaksPanel.jsx` — migrated from `tweaks-panel.jsx`
- `frontend/src/components/map/Maps.jsx` — migrated from `maps.jsx`
- `frontend/Dockerfile`

### New files (root)
- `docker-compose.yml`
- `.env.example`

### Existing files (untouched)
- All root `.jsx` files stay — they're the working prototype fallback
- `data.js`, `styles.css`, `server.js`, `index.html` at root — untouched

---

## Task 1: Backend skeleton + health check

**Owner:** Anouar
**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/core/__init__.py`
- Create: `backend/core/config.py`
- Create: `backend/api/__init__.py`
- Create: `backend/api/routes/__init__.py`
- Create: `backend/main.py`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/test_health.py`

- [ ] **Step 1: Create backend directory structure**

```bash
mkdir -p backend/core backend/agents/invest backend/agents/radar backend/api/routes backend/db backend/tests
touch backend/__init__.py backend/core/__init__.py backend/agents/__init__.py backend/agents/invest/__init__.py backend/agents/radar/__init__.py backend/api/__init__.py backend/api/routes/__init__.py backend/db/__init__.py backend/tests/__init__.py
```

- [ ] **Step 2: Write `backend/requirements.txt`**

```
fastapi==0.115.0
uvicorn[standard]==0.30.6
pydantic-settings==2.4.0
anthropic==0.34.2
httpx==0.27.2
sqlalchemy==2.0.35
asyncpg==0.29.0
python-dotenv==1.0.1
apscheduler==3.10.4
pytest==8.3.3
pytest-asyncio==0.24.0
```

- [ ] **Step 3: Write `backend/core/config.py`**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    anthropic_api_key: str = ""
    google_maps_api_key: str = ""
    agent_mode: str = "mock"
    database_url: str = "postgresql+asyncpg://investmap:localdev@db:5432/investmap"
    redis_url: str = "redis://redis:6379"

    class Config:
        env_file = ".env"

settings = Settings()
```

- [ ] **Step 4: Write failing test `backend/tests/test_health.py`**

```python
from fastapi.testclient import TestClient
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def test_health_returns_ok():
    from main import app
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 5: Run test — confirm it fails**

```bash
cd backend && pytest tests/test_health.py -v
```

Expected: `ImportError: No module named 'main'`

- [ ] **Step 6: Write `backend/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import invest, radar

app = FastAPI(title="InvestMap Maroc API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(invest.router, prefix="/api")
app.include_router(radar.router, prefix="/api")

@app.get("/health")
async def health():
    return {"status": "ok"}
```

Create minimal route stubs so the import works:

`backend/api/routes/invest.py`:
```python
from fastapi import APIRouter
router = APIRouter()
```

`backend/api/routes/radar.py`:
```python
from fastapi import APIRouter
router = APIRouter()
```

- [ ] **Step 7: Run test — confirm it passes**

```bash
cd backend && pytest tests/test_health.py -v
```

Expected: `PASSED`

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat: fastapi backend skeleton with health check"
```

---

## Task 2: BaseAgent + 5 mock invest agents

**Owner:** Anouar
**Files:**
- Create: `backend/agents/base.py`
- Create: `backend/agents/invest/agent1_location.py`
- Create: `backend/agents/invest/agent2_demand.py`
- Create: `backend/agents/invest/agent3_matching.py`
- Create: `backend/agents/invest/agent4_admin.py`
- Create: `backend/agents/invest/agent5_predictor.py`
- Create: `backend/agents/radar/agent6_collector.py`
- Create: `backend/agents/radar/agent7_analyzer.py`
- Create: `backend/tests/test_agents.py`

- [ ] **Step 1: Write failing tests `backend/tests/test_agents.py`**

```python
import pytest
import os
os.environ.setdefault("AGENT_MODE", "mock")

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

CTX = {"profile": "mre", "city": "Berkane", "neighborhood": "Hay Al Massira", "budget": "150-500"}

@pytest.mark.asyncio
async def test_agent1_returns_location():
    from agents.invest.agent1_location import Agent1Location
    result = await Agent1Location().run(CTX)
    assert "location" in result
    assert "pharmacies_1km" in result["location"]
    assert "competitors_1km" in result["location"]
    assert "commercial_gaps" in result["location"]

@pytest.mark.asyncio
async def test_agent2_returns_demand():
    from agents.invest.agent2_demand import Agent2Demand
    result = await Agent2Demand().run({**CTX, "location": {}})
    assert "demand" in result
    assert "pharmacie_search_volume" in result["demand"]

@pytest.mark.asyncio
async def test_agent3_returns_matches():
    from agents.invest.agent3_matching import Agent3Matching
    result = await Agent3Matching().run({**CTX, "location": {}, "demand": {}})
    assert "matches" in result
    assert len(result["matches"]) >= 3
    assert "business" in result["matches"][0]
    assert "score" in result["matches"][0]

@pytest.mark.asyncio
async def test_agent4_returns_admin_steps():
    from agents.invest.agent4_admin import Agent4Admin
    result = await Agent4Admin().run(CTX)
    assert "admin_steps" in result
    assert len(result["admin_steps"]) >= 1
    assert "step" in result["admin_steps"][0]

@pytest.mark.asyncio
async def test_agent5_returns_scores():
    from agents.invest.agent5_predictor import Agent5Predictor
    result = await Agent5Predictor().run({**CTX, "matches": [{"business": "Pharmacie"}]})
    assert "scores" in result
    assert "top_recommendation" in result["scores"]
    assert "radar_boost" in result["scores"]
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd backend && pytest tests/test_agents.py -v
```

Expected: `ImportError: No module named 'agents.invest.agent1_location'`

- [ ] **Step 3: Write `backend/agents/base.py`**

```python
from abc import ABC, abstractmethod
from core.config import settings

class BaseAgent(ABC):
    label: str = ""

    @abstractmethod
    async def _run_mock(self, context: dict) -> dict:
        ...

    async def _run_live(self, context: dict) -> dict:
        # Live API calls are implemented in the "Agent Implementation" spec.
        return await self._run_mock(context)

    async def run(self, context: dict) -> dict:
        if settings.agent_mode == "mock":
            return await self._run_mock(context)
        return await self._run_live(context)
```

- [ ] **Step 4: Write `backend/agents/invest/agent1_location.py`**

```python
from agents.base import BaseAgent

class Agent1Location(BaseAgent):
    label = "Analyse des commerces de ton quartier..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "location": {
                "pharmacies_1km": 0,
                "population_radius": 12400,
                "avg_income": 4800,
                "commercial_gaps": ["pharmacie", "papeterie", "lavage_auto"],
                "competitors_1km": 0,
                "competitors": [
                    {"type": "Café", "count": 6},
                    {"type": "Restaurant", "count": 4},
                    {"type": "Boulangerie", "count": 3},
                    {"type": "Pharmacie (1.8km)", "count": 1, "far": True},
                ],
            }
        }
```

- [ ] **Step 5: Write `backend/agents/invest/agent2_demand.py`**

```python
from agents.base import BaseAgent

class Agent2Demand(BaseAgent):
    label = "Mesure de la demande locale..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "demand": {
                "pharmacie_search_volume": 340,
                "demand_signal": "forte",
                "seasonality": ["hiver", "ramadan"],
                "top_complaints": ["trop loin", "pas dans ce quartier"],
            }
        }
```

- [ ] **Step 6: Write `backend/agents/invest/agent3_matching.py`**

```python
from agents.base import BaseAgent

class Agent3Matching(BaseAgent):
    label = "Identification des meilleures opportunités..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "matches": [
                {"business": "Pharmacie",         "score": 78, "verdict": "Forte opportunité"},
                {"business": "Papeterie",          "score": 71, "verdict": "Bonne opportunité"},
                {"business": "Magasin vêtements",  "score": 29, "verdict": "Risqué"},
            ]
        }
```

- [ ] **Step 7: Write `backend/agents/invest/agent4_admin.py`**

```python
from agents.base import BaseAgent

ADMIN_STEPS_BY_PROFILE = {
    "mre": [
        {"step": "Déclaration DRI à la banque",       "time": "30 jours",  "note": "obligatoire MRE — Office des Changes"},
        {"step": "RC + Patente (CRI)",                 "time": "2 semaines","note": "peut se faire depuis l'étranger via mandataire"},
        {"step": "Licence Santé (Pharmacie)",          "time": "8 semaines","note": "dossier médecin + local"},
        {"step": "Financement MDM Tamwil (50%)",       "time": "4 semaines","note": "plafond 2 000 000 DH, taux préférentiel"},
    ],
    "diplome": [
        {"step": "Auto-entrepreneur (CRI)",            "time": "1 semaine", "note": "gratuit, en ligne"},
        {"step": "Patente",                            "time": "2 semaines","note": "taxe locale"},
        {"step": "Programme Intelaka",                 "time": "4 semaines","note": "crédit jusqu'à 250k DH, taux 2%"},
    ],
    "femme_entrepreneur": [
        {"step": "RC (CRI)",                           "time": "1 semaine", "note": ""},
        {"step": "Maroc PME — financement",            "time": "4 semaines","note": "programme garantie 70%"},
        {"step": "Programme Moukawalati",              "time": "3 semaines","note": "aide création 10k DH + formation"},
    ],
    "fonctionnaire": [
        {"step": "Déclaration activité secondaire",    "time": "2 semaines","note": "auprès de votre administration"},
        {"step": "Auto-entrepreneur (compatible)",     "time": "1 semaine", "note": "statut compatible avec fonction publique"},
    ],
}

class Agent4Admin(BaseAgent):
    label = "Calcul de tes démarches administratives..."

    async def _run_mock(self, context: dict) -> dict:
        profile = context.get("profile", "mre")
        steps = ADMIN_STEPS_BY_PROFILE.get(profile, ADMIN_STEPS_BY_PROFILE["mre"])
        return {"admin_steps": steps}
```

- [ ] **Step 8: Write `backend/agents/invest/agent5_predictor.py`**

```python
from agents.base import BaseAgent

class Agent5Predictor(BaseAgent):
    label = "Calcul de la probabilité de succès..."

    async def _run_mock(self, context: dict) -> dict:
        return {
            "scores": {
                "top_recommendation": {
                    "business": "Pharmacie",
                    "score": 78,
                    "verdict": "Forte opportunité",
                    "positives": [
                        {"label": "0 pharmacie dans 1.2 km",            "weight": "+25", "detail": "vide commercial confirmé"},
                        {"label": "340 recherches/mois sur Google",      "weight": "+15", "detail": "demande active non satisfaite"},
                        {"label": "Revenu moyen 4 800 DH",              "weight": "+10", "detail": "pouvoir d'achat correct"},
                        {"label": "Nador West Med à 60 km",             "weight": "+5",  "detail": "bonus Radar — flux démographique attendu"},
                    ],
                    "risks": [
                        {"label": "Grande pharmacie à 1.8 km",         "weight": "-8",  "detail": "concurrence indirecte"},
                        {"label": "Licence Santé : délai 8 semaines",  "weight": "—",   "detail": "lent mais prévisible"},
                    ],
                    "finance": {
                        "investment": {"low": 130000, "high": 160000},
                        "monthlyNet": {"low": 15000, "high": 22000},
                        "roiMonths":  {"low": 14, "high": 18},
                    },
                },
                "radar_boost": {
                    "id": 1,
                    "name": "Nador West Med — Phase 2",
                    "shortName": "Nador West Med",
                    "amount": "10 milliards DH",
                    "jobs": "15 000 emplois directs prévus",
                    "distanceToBerkane": 60,
                    "detectedAt": "14 mai 2026 · 09:42",
                    "boostedOpportunities": [
                        {"business": "Station-service route du port", "score": 94, "boost": "+16"},
                        {"business": "Restaurant ouvriers / cantine", "score": 87, "boost": "+12"},
                        {"business": "Entrepôt logistique",           "score": 82, "boost": "+9"},
                    ],
                },
            }
        }
```

- [ ] **Step 9: Write radar agent stubs**

`backend/agents/radar/agent6_collector.py`:
```python
from agents.base import BaseAgent

class Agent6Collector(BaseAgent):
    label = "Vérification des grands projets nationaux..."

    async def _run_mock(self, context: dict) -> dict:
        # Radar projects are pre-loaded in DB via seed.py.
        # Agent6 runs on APScheduler every 24h in live mode.
        return {"collected": 0}
```

`backend/agents/radar/agent7_analyzer.py`:
```python
from agents.base import BaseAgent

class Agent7Analyzer(BaseAgent):
    label = "Extraction structurée des projets..."

    async def _run_mock(self, context: dict) -> dict:
        # LLM extraction runs in live mode only.
        return {"analyzed": 0}
```

- [ ] **Step 10: Run tests — confirm they pass**

```bash
cd backend && pytest tests/test_agents.py -v
```

Expected: All 5 tests `PASSED`

- [ ] **Step 11: Commit**

```bash
git add backend/
git commit -m "feat: BaseAgent pattern + 5 mock invest agents"
```

---

## Task 3: SSE pipeline + /api/analyze + /api/stream

**Owner:** Anouar
**Files:**
- Create: `backend/pipeline.py`
- Modify: `backend/api/routes/invest.py`
- Create: `backend/tests/test_pipeline.py`

- [ ] **Step 1: Write failing tests `backend/tests/test_pipeline.py`**

```python
import pytest
import os, sys
os.environ.setdefault("AGENT_MODE", "mock")
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

FORM = {"profile": "mre", "city": "Berkane", "neighborhood": "Hay Al Massira", "budget": "150-500"}

def test_analyze_returns_job_id():
    r = client.post("/api/analyze", json=FORM)
    assert r.status_code == 200
    data = r.json()
    assert "job_id" in data
    assert len(data["job_id"]) == 36  # UUID length

def test_analyze_rejects_missing_fields():
    r = client.post("/api/analyze", json={"profile": "mre"})
    assert r.status_code == 422

@pytest.mark.asyncio
async def test_stream_emits_complete():
    import httpx, json
    async with httpx.AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.post("/api/analyze", json=FORM)
        job_id = r.json()["job_id"]

        event_types = []
        async with ac.stream("GET", f"/api/stream/{job_id}") as stream:
            async for line in stream.aiter_lines():
                if line.startswith("event:"):
                    event_types.append(line.split(": ", 1)[1].strip())
                if "complete" in event_types:
                    break

    assert "agent_start" in event_types
    assert "complete" in event_types
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd backend && pytest tests/test_pipeline.py -v
```

Expected: `404 Not Found` for `/api/analyze`

- [ ] **Step 3: Write `backend/pipeline.py`**

```python
import asyncio
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

    for i, agent in enumerate(INVEST_AGENTS, start=1):
        await queue.put({"type": "agent_start", "agent": i, "label": agent.label})
        result = await agent.run(context)
        context.update(result)
        await queue.put({"type": "agent_done", "agent": i, "data": result})

    await queue.put({"type": "complete", "scenario": assemble_scenario(context)})
    await queue.put(None)  # sentinel

async def stream_job(job_id: str):
    import json
    if job_id not in _jobs:
        yield f"event: error\ndata: {json.dumps({'message': 'job not found'})}\n\n"
        return

    queue = _jobs[job_id]
    try:
        while True:
            event = await asyncio.wait_for(queue.get(), timeout=30.0)
            if event is None:
                break
            yield f"event: {event['type']}\ndata: {json.dumps(event)}\n\n"
    except asyncio.TimeoutError:
        yield f"event: error\ndata: {json.dumps({'message': 'timeout'})}\n\n"
    finally:
        _jobs.pop(job_id, None)
```

- [ ] **Step 4: Write `backend/api/routes/invest.py`**

```python
from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pipeline import create_job, run_invest_pipeline, stream_job

router = APIRouter()

class AnalyzeRequest(BaseModel):
    profile: str
    city: str
    neighborhood: str = ""
    budget: str

@router.post("/analyze")
async def analyze(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    job_id = create_job()
    background_tasks.add_task(run_invest_pipeline, job_id, request.model_dump())
    return {"job_id": job_id}

@router.get("/stream/{job_id}")
async def stream(job_id: str):
    return StreamingResponse(
        stream_job(job_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
```

- [ ] **Step 5: Run tests — confirm they pass**

```bash
cd backend && pytest tests/test_pipeline.py -v
```

Expected: All 3 tests `PASSED`

- [ ] **Step 6: Smoke test manually**

```bash
cd backend && uvicorn main:app --reload --port 8000
# In another terminal:
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"profile":"mre","city":"Berkane","neighborhood":"Hay Al Massira","budget":"150-500"}'
# Expected: {"job_id": "some-uuid"}

# Then:
curl -N http://localhost:8000/api/stream/<job_id>
# Expected: stream of SSE events ending with event: complete
```

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat: SSE pipeline — POST /api/analyze + GET /api/stream/{id}"
```

---

## Task 4: Radar route + 20 hardcoded projects

**Owner:** Marouane
**Files:**
- Modify: `backend/api/routes/radar.py`
- Create: `backend/tests/test_radar.py`

- [ ] **Step 1: Write failing tests `backend/tests/test_radar.py`**

```python
import os, sys
os.environ.setdefault("AGENT_MODE", "mock")
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_projects_returns_list():
    r = client.get("/api/projects")
    assert r.status_code == 200
    projects = r.json()
    assert isinstance(projects, list)
    assert len(projects) == 20

def test_get_projects_have_required_fields():
    r = client.get("/api/projects")
    p = r.json()[0]
    for field in ["id", "name", "sector", "region", "amount", "phase", "x", "y"]:
        assert field in p, f"missing field: {field}"

def test_get_projects_filter_by_region():
    r = client.get("/api/projects?region=Oriental")
    assert r.status_code == 200
    projects = r.json()
    assert len(projects) > 0
    assert all(p["region"] == "Oriental" for p in projects)

def test_get_projects_unknown_region_returns_empty():
    r = client.get("/api/projects?region=UnknownRegion")
    assert r.status_code == 200
    assert r.json() == []
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
cd backend && pytest tests/test_radar.py -v
```

Expected: `404` for `/api/projects`

- [ ] **Step 3: Write `backend/api/routes/radar.py`**

```python
from fastapi import APIRouter
from typing import Optional

router = APIRouter()

NATIONAL_PROJECTS = [
  {"id": 1,  "name": "Nador West Med — Phase 2",           "sector": "infrastructure", "region": "Oriental",                   "amount": 10000, "promoter": "Agence Nador West Med",      "phase": "en_cours", "progress": 65, "jobs": 15000, "launch": "2026", "x": 78, "y": 14, "featured": True},
  {"id": 2,  "name": "Parc éolien Taza",                   "sector": "energie",        "region": "Fès-Meknès",                 "amount": 800,   "promoter": "MASEN",                      "phase": "planifie", "progress": 15, "jobs": 600,   "launch": "2027", "x": 66, "y": 22},
  {"id": 3,  "name": "TGV Marrakech–Agadir",               "sector": "infrastructure", "region": "Souss-Massa",                "amount": 35000, "promoter": "ONCF",                       "phase": "planifie", "progress": 8,  "jobs": 25000, "launch": "2028", "x": 32, "y": 70},
  {"id": 4,  "name": "Tanger Med — extension",             "sector": "infrastructure", "region": "Tanger-Tétouan-Al Hoceïma", "amount": 12000, "promoter": "TMSA",                       "phase": "en_cours", "progress": 48, "jobs": 9000,  "launch": "2026", "x": 52, "y": 8},
  {"id": 5,  "name": "Méga-station solaire Noor V",        "sector": "energie",        "region": "Drâa-Tafilalet",             "amount": 6500,  "promoter": "MASEN",                      "phase": "en_cours", "progress": 32, "jobs": 2200,  "launch": "2027", "x": 42, "y": 58},
  {"id": 6,  "name": "Renault Tanger — Ligne 3",           "sector": "industrie",      "region": "Tanger-Tétouan-Al Hoceïma", "amount": 2400,  "promoter": "Renault Maroc",              "phase": "en_cours", "progress": 55, "jobs": 3500,  "launch": "2026", "x": 50, "y": 11},
  {"id": 7,  "name": "Stellantis Kénitra — Phase 2",       "sector": "industrie",      "region": "Rabat-Salé-Kénitra",        "amount": 2900,  "promoter": "Stellantis",                 "phase": "en_cours", "progress": 40, "jobs": 2700,  "launch": "2027", "x": 44, "y": 18},
  {"id": 8,  "name": "Smart City Mohammed VI Tanger Tech", "sector": "tech",           "region": "Tanger-Tétouan-Al Hoceïma", "amount": 5800,  "promoter": "BMCE Capital",               "phase": "planifie", "progress": 5,  "jobs": 100000,"launch": "2030", "x": 51, "y": 13},
  {"id": 9,  "name": "Resort Saïdia — extension",          "sector": "tourisme",       "region": "Oriental",                   "amount": 1200,  "promoter": "SDS",                        "phase": "planifie", "progress": 12, "jobs": 800,   "launch": "2027", "x": 82, "y": 12},
  {"id": 10, "name": "Pôle Agroalimentaire Berkane",       "sector": "agriculture",    "region": "Oriental",                   "amount": 450,   "promoter": "ORMVAM",                     "phase": "en_cours", "progress": 35, "jobs": 1200,  "launch": "2026", "x": 75, "y": 15, "near": True},
  {"id": 11, "name": "Marina Casablanca Phase 3",          "sector": "immobilier",     "region": "Casablanca-Settat",          "amount": 4200,  "promoter": "Al Boraq",                   "phase": "en_cours", "progress": 70, "jobs": 5000,  "launch": "2026", "x": 36, "y": 27},
  {"id": 12, "name": "Hub aéronautique Mohammed V",        "sector": "industrie",      "region": "Casablanca-Settat",          "amount": 2100,  "promoter": "AMDIE",                      "phase": "planifie", "progress": 18, "jobs": 4500,  "launch": "2027", "x": 39, "y": 28},
  {"id": 13, "name": "Hôpital Régional Dakhla",            "sector": "infrastructure", "region": "Dakhla-Oued Ed-Dahab",       "amount": 600,   "promoter": "Ministère de la Santé",      "phase": "en_cours", "progress": 50, "jobs": 800,   "launch": "2026", "x": 18, "y": 90},
  {"id": 14, "name": "Hydrogène vert Sud-Massa",           "sector": "energie",        "region": "Souss-Massa",                "amount": 9500,  "promoter": "OCP Green",                  "phase": "planifie", "progress": 6,  "jobs": 3000,  "launch": "2029", "x": 30, "y": 68},
  {"id": 15, "name": "Plateforme logistique Oujda",        "sector": "infrastructure", "region": "Oriental",                   "amount": 380,   "promoter": "SNTL",                       "phase": "en_cours", "progress": 60, "jobs": 700,   "launch": "2026", "x": 80, "y": 18, "near": True},
  {"id": 16, "name": "Parc industriel Béni Mellal",        "sector": "industrie",      "region": "Béni Mellal-Khénifra",       "amount": 1500,  "promoter": "MEDZ",                       "phase": "planifie", "progress": 22, "jobs": 6000,  "launch": "2027", "x": 47, "y": 38},
  {"id": 17, "name": "Resort écotouristique Ifrane",       "sector": "tourisme",       "region": "Fès-Meknès",                 "amount": 850,   "promoter": "CDG Développement",          "phase": "planifie", "progress": 10, "jobs": 1100,  "launch": "2028", "x": 55, "y": 30},
  {"id": 18, "name": "Aéroport Tétouan — modernisation",  "sector": "infrastructure", "region": "Tanger-Tétouan-Al Hoceïma", "amount": 720,   "promoter": "ONDA",                       "phase": "en_cours", "progress": 45, "jobs": 600,   "launch": "2026", "x": 53, "y": 10},
  {"id": 19, "name": "Campus Med-Tech Rabat",              "sector": "tech",           "region": "Rabat-Salé-Kénitra",         "amount": 1800,  "promoter": "UM6P",                       "phase": "en_cours", "progress": 28, "jobs": 2400,  "launch": "2027", "x": 45, "y": 20},
  {"id": 20, "name": "Centrale gaz Mohammedia",            "sector": "energie",        "region": "Casablanca-Settat",          "amount": 3200,  "promoter": "ONEE",                       "phase": "planifie", "progress": 14, "jobs": 1500,  "launch": "2028", "x": 37, "y": 25},
]

@router.get("/projects")
async def get_projects(region: Optional[str] = None):
    if region:
        return [p for p in NATIONAL_PROJECTS if p["region"] == region]
    return NATIONAL_PROJECTS
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
cd backend && pytest tests/test_radar.py -v
```

Expected: All 4 tests `PASSED`

- [ ] **Step 5: Run full test suite**

```bash
cd backend && pytest -v
```

Expected: All tests in `test_health`, `test_agents`, `test_pipeline`, `test_radar` pass.

- [ ] **Step 6: Commit**

```bash
git add backend/
git commit -m "feat: GET /api/projects with 20 hardcoded radar projects"
```

---

## Task 5: Vite frontend scaffold

**Owner:** Aymen
**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`

- [ ] **Step 1: Create frontend directory structure**

```bash
mkdir -p frontend/src/components/map frontend/src/components/dashboard frontend/src/components/cri frontend/src/components/shared frontend/src/pages frontend/src/hooks frontend/src/data
```

- [ ] **Step 2: Write `frontend/package.json`**

```json
{
  "name": "investmap-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.4.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
cd frontend && npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 4: Write `frontend/vite.config.js`**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
```

- [ ] **Step 5: Write `frontend/index.html`**

```html
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>InvestMap Maroc — Connecter le macro au micro</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" crossorigin=""/>
</head>
<body>
  <div id="root"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js" crossorigin=""></script>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 6: Write `frontend/src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
```

- [ ] **Step 7: Write placeholder `frontend/src/App.jsx` to confirm Vite works**

```jsx
import React from 'react';

export default function App() {
  return <div style={{ padding: 32, fontFamily: 'Outfit, sans-serif' }}>InvestMap Maroc — Vite OK ✅</div>;
}
```

- [ ] **Step 8: Start dev server and verify**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` — should show "InvestMap Maroc — Vite OK ✅".

- [ ] **Step 9: Commit**

```bash
git add frontend/
git commit -m "feat: vite + react frontend scaffold"
```

---

## Task 6: Migrate data + personalize to ES modules

**Owner:** Aymen
**Files:**
- Create: `frontend/src/data/scenarios.js` (from root `data.js`)
- Create: `frontend/src/personalize.js` (from root `personalize.js`)

- [ ] **Step 1: Copy `data.js` to `frontend/src/data/scenarios.js`**

Copy the entire content of root `data.js` into `frontend/src/data/scenarios.js`, then make these two changes:

1. Replace the final `window.SCENARIOS = SCENARIOS;` assignment with:
```js
export { SCENARIOS, NATIONAL_PROJECTS, SECTORS, REGIONS };
export const PROJECT_TO_SCENARIO = {
  1: 'hassan',   // Nador West Med → Hassan scenario
  10: 'hassan',  // Pôle Agroalimentaire Berkane → Hassan
  12: 'omar',    // Hub aéronautique → Omar
  8:  'samira',  // Tanger Tech → Samira
  3:  'brahim',  // TGV Sud → Brahim
  19: 'leila',   // Med-Tech Rabat → Leila
};
```

2. Replace `window.selectScenarioKey = function(form) {` with `export function selectScenarioKey(form) {`

- [ ] **Step 2: Copy `personalize.js` to `frontend/src/personalize.js`**

Copy root `personalize.js` into `frontend/src/personalize.js`, then replace:

```js
window.personalizeScenario = function(base, form) {
```
with:
```js
export function personalizeScenario(base, form) {
```

- [ ] **Step 3: Verify the exports are correct**

```bash
cd frontend && node --input-type=module <<'EOF'
import { SCENARIOS, selectScenarioKey } from './src/data/scenarios.js';
console.log('Scenarios:', Object.keys(SCENARIOS));
console.log('selectScenarioKey result:', selectScenarioKey({ profile: 'mre', city: 'Berkane', budget: '150-500' }));
EOF
```

Expected output: lists scenario keys including `hassan`, prints `hassan`.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/data/ frontend/src/personalize.js
git commit -m "feat: migrate data.js and personalize.js to ES modules"
```

---

## Task 7: Migrate all pages + shared components

**Owner:** Aymen
**Files:**
- Create: `frontend/src/styles.css`
- Create: `frontend/src/components/shared/TweaksPanel.jsx`
- Create: `frontend/src/components/map/Maps.jsx`
- Create: `frontend/src/pages/Landing.jsx`
- Create: `frontend/src/pages/Questionnaire.jsx`
- Create: `frontend/src/pages/Loading.jsx`
- Create: `frontend/src/pages/Dashboard.jsx`
- Create: `frontend/src/pages/CRIDashboard.jsx`
- Create: `frontend/src/pages/Results.jsx`

**Migration rule for every file:** Add React imports at the top, replace `window.X` references with module imports, remove `window.` prefix from exports. The UI code itself does not change.

- [ ] **Step 1: Copy `styles.css`**

```bash
cp styles.css frontend/src/styles.css
```

- [ ] **Step 2: Migrate `tweaks-panel.jsx` → `frontend/src/components/shared/TweaksPanel.jsx`**

Copy `tweaks-panel.jsx` content. Add at the very top:
```jsx
import React, { useState, useRef, useEffect } from 'react';
```
At the bottom, replace any `window.` assignments with named exports:
```jsx
export { TweaksPanel, TweakSection, TweakButton, TweakSlider, TweakRadio, useTweaks };
```

- [ ] **Step 3: Migrate `maps.jsx` → `frontend/src/components/map/Maps.jsx`**

Copy `maps.jsx` content. Add at the top:
```jsx
import React, { useEffect, useRef } from 'react';
```
Export the map components at the bottom:
```jsx
export { MapLocal, MapNational };
```

- [ ] **Step 4: Migrate `landing.jsx` → `frontend/src/pages/Landing.jsx`**

Copy `landing.jsx` content. Add at the top:
```jsx
import React, { useState } from 'react';
```
Change the function declaration from `function Landing(` to `export default function Landing(` (or add `export default Landing` at the bottom).

- [ ] **Step 5: Migrate `questionnaire.jsx` → `frontend/src/pages/Questionnaire.jsx`**

Copy `questionnaire.jsx` content. Add at the top:
```jsx
import React, { useState } from 'react';
```
Export: `export default function Questionnaire(` or add `export default Questionnaire`.

- [ ] **Step 6: Migrate `loading.jsx` → `frontend/src/pages/Loading.jsx`**

Copy `loading.jsx` content. Add at the top:
```jsx
import React, { useState, useEffect } from 'react';
```
Export: `export default function LoadingScreen(` or add `export default LoadingScreen`.

- [ ] **Step 7: Migrate `dashboard.jsx` → `frontend/src/pages/Dashboard.jsx`**

Copy `dashboard.jsx` content. Add at the top:
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapLocal } from '../components/map/Maps';
```
Export: `export default function Dashboard(` or add `export default Dashboard`.

- [ ] **Step 8: Migrate `cri-dashboard.jsx` → `frontend/src/pages/CRIDashboard.jsx`**

Copy `cri-dashboard.jsx` content. Add at the top:
```jsx
import React, { useState, useEffect } from 'react';
import { MapNational } from '../components/map/Maps';
```
Export: `export default function CRIDashboard(` or add `export default CRIDashboard`.

- [ ] **Step 9: Migrate `results.jsx` → `frontend/src/pages/Results.jsx`**

Copy `results.jsx` content. Add at the top:
```jsx
import React, { useState } from 'react';
```
Export: `export default function ResultsScreen(` or add `export default ResultsScreen`.

- [ ] **Step 10: Write real `frontend/src/App.jsx`**

Copy `app.jsx` content. Add at the top:
```jsx
import React, { useState, useRef } from 'react';
import { SCENARIOS, selectScenarioKey, PROJECT_TO_SCENARIO } from './data/scenarios';
import { personalizeScenario } from './personalize';
import { TweaksPanel, TweakSection, TweakButton, TweakSlider, TweakRadio, useTweaks } from './components/shared/TweaksPanel';
import Landing from './pages/Landing';
import Questionnaire from './pages/Questionnaire';
import LoadingScreen from './pages/Loading';
import Dashboard from './pages/Dashboard';
import CRIDashboard from './pages/CRIDashboard';
import ResultsScreen from './pages/Results';
```

Remove all `window.SCENARIOS`, `window.selectScenarioKey`, `window.personalizeScenario`, `window.PROJECT_TO_SCENARIO` references — they are now local imports.

Remove the `ReactDOM.createRoot(...)` call at the bottom (it moves to `main.jsx`).

- [ ] **Step 11: Copy logo**

```bash
cp logo.png frontend/src/logo.png
```

Update the `<img src="logo.png?v=2"` reference in `App.jsx` to `<img src="/src/logo.png?v=2"` (Vite serves from project root via `/src/`).

Actually, in Vite, static assets go in `frontend/public/`. Move it there:
```bash
mkdir -p frontend/public
cp logo.png frontend/public/logo.png
```
Then update `App.jsx`: `src="/logo.png"` (no path prefix needed for `public/`).

- [ ] **Step 12: Start dev server and verify UI loads**

```bash
cd frontend && npm run dev
```

Open `http://localhost:5173` — the full Landing page should render with the existing design, no console errors.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/ frontend/public/
git commit -m "feat: migrate all UI pages and components to Vite + ES modules"
```

---

## Task 8: useAgentStream hook + wire Loading to SSE

**Owner:** Aymen
**Files:**
- Create: `frontend/src/hooks/useAgentStream.js`
- Create: `frontend/src/hooks/useScenario.js`
- Modify: `frontend/src/pages/Loading.jsx`
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Write `frontend/src/hooks/useAgentStream.js`**

```js
import { useState, useEffect, useRef } from 'react';

export function useAgentStream(jobId) {
  const [agentEvents, setAgentEvents] = useState([]);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const esRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const es = new EventSource(`/api/stream/${jobId}`);
    esRef.current = es;

    es.addEventListener('agent_start', (e) => {
      const data = JSON.parse(e.data);
      setCurrentAgent(data);
      setAgentEvents(prev => [...prev, data]);
    });

    es.addEventListener('agent_done', (e) => {
      const data = JSON.parse(e.data);
      setAgentEvents(prev => [...prev, data]);
    });

    es.addEventListener('complete', (e) => {
      const data = JSON.parse(e.data);
      setScenario(data.scenario);
      setDone(true);
      es.close();
    });

    es.addEventListener('error', (e) => {
      setError('stream error');
      setDone(true);
      es.close();
    });

    return () => {
      es.close();
    };
  }, [jobId]);

  return { agentEvents, currentAgent, scenario, done, error };
}
```

- [ ] **Step 2: Write `frontend/src/hooks/useScenario.js`**

```js
import { useState } from 'react';
import { SCENARIOS, selectScenarioKey } from '../data/scenarios';
import { personalizeScenario } from '../personalize';

export function useScenario() {
  const [scenarioKey, setScenarioKey] = useState('hassan');
  const [scenario, setScenario] = useState(null);

  const activeScenario = scenario || SCENARIOS[scenarioKey];

  const applyFromForm = (form) => {
    try {
      const key = selectScenarioKey(form);
      const base = SCENARIOS[key];
      const personalized = personalizeScenario ? personalizeScenario(base, form) : base;
      setScenarioKey(key);
      setScenario(personalized);
      return key;
    } catch {
      const key = 'hassan';
      setScenarioKey(key);
      setScenario(SCENARIOS[key]);
      return key;
    }
  };

  const applyFromStream = (streamedScenario) => {
    setScenario(streamedScenario);
  };

  const applyQuick = (key) => {
    setScenarioKey(key);
    setScenario(SCENARIOS[key]);
  };

  return { scenarioKey, scenario, activeScenario, applyFromForm, applyFromStream, applyQuick };
}
```

- [ ] **Step 3: Update `frontend/src/App.jsx` to use job-based SSE flow**

In `App.jsx`, add a `jobId` state and wire `submit()` to call `/api/analyze` and store the returned `job_id`:

```jsx
// Add to imports at top of App.jsx:
import { useAgentStream } from './hooks/useAgentStream';

// Add inside App():
const [jobId, setJobId] = useState(null);

// Replace the submit() function:
const submit = async () => {
  try {
    const key = selectScenarioKey(form);
    const base = SCENARIOS[key];
    const personalized = personalizeScenario ? personalizeScenario(base, form) : base;
    setScenarioKey(key);
    setScenario(personalized);  // fallback while backend works
  } catch {
    setScenarioKey('hassan');
    setScenario(SCENARIOS['hassan']);
  }

  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const { job_id } = await res.json();
      setJobId(job_id);
    }
  } catch {
    // Backend unavailable — fallback scenario already set above
  }

  setPhase('loading');
};
```

Pass `jobId` to `LoadingScreen`:
```jsx
{phase === 'loading' && (
  <LoadingScreen
    duration={t.loadingDuration * 1000}
    jobId={jobId}
    onDone={(streamedScenario) => {
      if (streamedScenario) setScenario(streamedScenario);
      onLoadingDone();
    }}
    scenario={activeScenario}
  />
)}
```

- [ ] **Step 4: Update `frontend/src/pages/Loading.jsx` to accept jobId**

Add `jobId` and `onDone` props. When `jobId` is present, use the SSE hook. When SSE completes, call `onDone(streamedScenario)`. When SSE fails or no `jobId`, let the timer call `onDone(null)` (fallback uses existing scenario):

```jsx
import React, { useState, useEffect } from 'react';
import { useAgentStream } from '../hooks/useAgentStream';

export default function LoadingScreen({ duration, jobId, onDone, scenario }) {
  const { currentAgent, scenario: streamedScenario, done, error } = useAgentStream(jobId);

  // SSE path: when stream completes, call onDone with real scenario
  useEffect(() => {
    if (done) {
      onDone(error ? null : streamedScenario);
    }
  }, [done]);

  // Timer fallback: if no jobId or SSE never resolves, use timer
  useEffect(() => {
    if (jobId) return;  // SSE is handling it
    const timer = setTimeout(() => onDone(null), duration);
    return () => clearTimeout(timer);
  }, [jobId, duration]);

  // Use currentAgent.label if available, else fall back to original message cycling
  // ... rest of existing loading UI code unchanged ...
}
```

- [ ] **Step 5: Verify end-to-end with backend running**

Start both services:
```bash
# Terminal 1:
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2:
cd frontend && npm run dev
```

1. Open `http://localhost:5173`
2. Fill questionnaire: MRE, Berkane, Hay Al Massira, 150–500K
3. Click "Analyser"
4. Watch Loading screen — labels should cycle through real agent messages
5. Dashboard renders with real data from backend

- [ ] **Step 6: Verify fallback works with backend stopped**

```bash
# Stop backend (Ctrl+C in Terminal 1)
```

1. Fill questionnaire again and click "Analyser"
2. Loading screen should still complete (timer fallback kicks in)
3. Dashboard renders with hardcoded scenario data

- [ ] **Step 7: Commit**

```bash
git add frontend/src/hooks/ frontend/src/pages/Loading.jsx frontend/src/App.jsx
git commit -m "feat: useAgentStream hook + SSE-driven loading screen with fallback"
```

---

## Task 9: Docker Compose + Dockerfiles

**Owner:** Anyone
**Files:**
- Create: `backend/Dockerfile`
- Create: `frontend/Dockerfile`
- Create: `docker-compose.yml`
- Create: `.env.example`

- [ ] **Step 1: Write `backend/Dockerfile`**

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

- [ ] **Step 2: Write `frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

- [ ] **Step 3: Write `docker-compose.yml`**

```yaml
services:

  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: investmap
      POSTGRES_USER: investmap
      POSTGRES_PASSWORD: ${DB_PASSWORD:-localdev}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U investmap"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      VITE_API_URL: http://localhost:8000

volumes:
  pgdata:
```

- [ ] **Step 4: Write `.env.example`**

```
DB_PASSWORD=localdev
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_MAPS_API_KEY=...
AGENT_MODE=mock
```

- [ ] **Step 5: Create `.env` from example (not committed)**

```bash
cp .env.example .env
```

Add `.env` to `.gitignore` if not already there:
```bash
echo ".env" >> .gitignore
```

- [ ] **Step 6: Start the full stack**

```bash
docker compose up --build
```

Expected output (after ~60s for first build):
```
db        | database system is ready to accept connections
backend   | INFO:     Application startup complete.
frontend  | VITE v5.x  ready in Xms
frontend  | ➜  Local: http://localhost:5173/
```

- [ ] **Step 7: Verify services are up**

```bash
curl http://localhost:8000/health
# Expected: {"status":"ok"}

curl http://localhost:8000/api/projects | python -m json.tool | head -20
# Expected: JSON array starting with Nador West Med

# Open http://localhost:5173 — full app, end-to-end
```

- [ ] **Step 8: Commit**

```bash
git add backend/Dockerfile frontend/Dockerfile docker-compose.yml .env.example .gitignore
git commit -m "feat: docker compose stack — db + redis + backend + frontend"
```

---

## Success Criteria Checklist

- [ ] `cd backend && pytest -v` — all tests pass
- [ ] `cd frontend && npm run dev` — app loads at `localhost:5173` with full existing UI
- [ ] Fill questionnaire → click Analyser → Loading shows real agent labels → Dashboard renders
- [ ] Stop backend → repeat above → Loading still completes via timer, Dashboard renders with fallback data
- [ ] `curl http://localhost:8000/api/projects` returns 20 projects
- [ ] `docker compose up` brings all 4 services up with no errors
- [ ] `AGENT_MODE=mock` in `.env` → no API keys required for anything to work
