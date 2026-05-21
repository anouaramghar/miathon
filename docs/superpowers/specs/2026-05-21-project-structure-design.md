# InvestMap Maroc — Project Structure Design

**Date:** 2026-05-21
**Status:** Approved
**Team:** Anouar (AI/Backend), Marouane (Data/Radar), Aymen (Frontend)
**Event:** Miathon 3rd Edition — ENIAD Berkane, Université Mohammed Premier

---

## Context

The current codebase is a prototype: 15+ files in a flat root folder, in-browser Babel transpilation, no build system, no backend, no database. All 7 agents from the PRD are simulated by a single hardcoded `data.js` file.

This spec defines the real project structure before implementing any actual agent or backend logic.

---

## Goals

1. Migrate frontend to Vite + React (proper build tooling, npm packages, hot reload)
2. Build FastAPI Python backend with the 7-agent architecture
3. Set up PostgreSQL + PostGIS from day one via Docker
4. Keep existing UI work — no visual regressions, just reorganization
5. Never break the demo — hardcoded fallback data always available

---

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend build | Vite + npm | Real imports, hot reload, Mapbox works |
| Backend | FastAPI (Python) | Matches PRD, best for LangChain + Claude API |
| Database | PostgreSQL + PostGIS | Geo queries, project data, required by PRD |
| Repo | Monorepo | One git history, one docker-compose, 3-person team |
| Agent communication | SSE (Server-Sent Events) | Real-time progress, 10 lines of FastAPI code |

---

## Section 1 — Folder Structure

```
miathon/
├── frontend/                        ← Aymen's domain
│   ├── src/
│   │   ├── components/
│   │   │   ├── map/                 ← MapLocal.jsx, MapNational.jsx
│   │   │   ├── dashboard/           ← OpportunityCard, ScoreGauge, RadarAlert
│   │   │   ├── cri/                 ← ProjectCard, FilterBar
│   │   │   └── shared/              ← Topbar, TweaksPanel, LoadingBar
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Questionnaire.jsx
│   │   │   ├── Loading.jsx          ← driven by real SSE events
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CRIDashboard.jsx
│   │   │   └── Results.jsx
│   │   ├── hooks/
│   │   │   ├── useAgentStream.js    ← SSE connection + progress state
│   │   │   └── useScenario.js
│   │   ├── data/
│   │   │   └── scenarios.js         ← hardcoded fallback (migrated from root data.js)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                         ← Anouar + Marouane's domain
│   ├── agents/
│   │   ├── invest/
│   │   │   ├── agent1_location.py
│   │   │   ├── agent2_demand.py
│   │   │   ├── agent3_matching.py
│   │   │   ├── agent4_admin.py
│   │   │   └── agent5_predictor.py
│   │   └── radar/
│   │       ├── agent6_collector.py
│   │       └── agent7_analyzer.py
│   ├── api/
│   │   └── routes/
│   │       ├── invest.py            ← POST /api/analyze, GET /api/stream/{id}
│   │       └── radar.py             ← GET /api/projects, GET /api/projects/{region}
│   ├── db/
│   │   ├── models.py                ← SQLAlchemy models
│   │   └── seed.py                  ← loads hardcoded scenarios into DB
│   ├── core/
│   │   ├── config.py                ← env vars, API keys
│   │   └── claude_client.py         ← Anthropic SDK wrapper
│   ├── main.py
│   └── requirements.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

**Migration note:** Existing `.jsx` files are moved and split — not deleted. The UI is preserved. `data.js` content moves to `frontend/src/data/scenarios.js`.

---

## Section 2 — Data Flow (SSE Pipeline)

```
User clicks "Analyser"
        │
        ▼
POST /api/analyze
{ profile, city, neighborhood, budget }
        │
        ▼
Backend: creates job_id (UUID), spawns agent pipeline as background task
Returns: { job_id } immediately (< 50ms)
        │
        ▼
Frontend opens SSE:
GET /api/stream/{job_id}
        │
        ▼
Backend emits SSE events as each agent completes:

  event: agent_start
  data: {"agent": 1, "label": "Analyse des commerces de ton quartier..."}

  event: agent_done
  data: {"agent": 1, "data": {"pharmacies_1km": 0, ...}}

  event: agent_start
  data: {"agent": 2, "label": "Mesure de la demande locale..."}

  ... (agents 1→5 for Invest, agents 6+7 output is pre-computed in DB)

  event: complete
  data: {"scenario": { full scenario object }}
        │
        ▼
Frontend: closes SSE, renders Dashboard with real data
```

**Loading screen:** `Loading.jsx` subscribes to `useAgentStream(job_id)`. Each `agent_start` event advances the progress bar and updates the displayed message — matching the PRD loading screen spec exactly, but driven by real agent execution.

**Fallback:** If the backend is unreachable or an agent throws, the frontend falls back to `data/scenarios.js`. The demo never breaks.

---

## Section 3 — Agent Pipeline Design

### Pattern

Every agent is a Python class with one `async run(context)` method. A shared `context` dict grows as agents execute — no global state.

```python
class Agent1Location:
    async def run(self, context: dict) -> dict:
        # reads:  context["city"], context["neighborhood"]
        # writes: context["location"]
        result = await self._fetch_google_maps(...)
        return {"location": result}
```

### Invest Layer execution order

```
context = { profile, city, neighborhood, budget }

Agent1 → adds context["location"]      (Google Maps Places API)
Agent2 → adds context["demand"]        (Google Trends + Reviews NLP)
Agent3 → adds context["matches"]       (business matching algorithm)
Agent4 → adds context["admin_steps"]   (profile-based admin roadmap)
Agent5 → adds context["scores"]        (success predictor + Radar bonus)

→ emit SSE: complete { full context }
```

### Radar Layer

Agent6 + Agent7 run on a **scheduler (APScheduler, every 24h)**, not on user request. Projects land in Postgres. When Agent5 runs, it queries Postgres for nearby radar projects within 50km to compute the score bonus — this is the "magic connection" from the PRD.

### Mock/Live switch

Every agent supports two modes controlled by a single env var:

```
AGENT_MODE=mock   # returns hardcoded data instantly — demo safe
AGENT_MODE=live   # calls real APIs (Google Maps, Claude, etc.)
```

This means the demo never breaks, and live APIs can be integrated incrementally.

---

## Section 4 — Docker Compose & Infrastructure

```yaml
services:

  db:
    image: postgis/postgis:16-3.4
    environment:
      POSTGRES_DB: investmap
      POSTGRES_USER: investmap
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    env_file: .env
    depends_on: [db, redis]
    volumes: ["./backend:/app"]   # hot reload via uvicorn --reload

  frontend:
    build: ./frontend
    ports: ["5173:5173"]
    volumes: ["./frontend:/app"]  # Vite HMR
    environment:
      VITE_API_URL: http://localhost:8000
```

### .env.example

```
DB_PASSWORD=localdev
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_MAPS_API_KEY=...
AGENT_MODE=mock
```

### Dev workflow

```bash
docker compose up
# frontend  → http://localhost:5173
# backend   → http://localhost:8000
# API docs  → http://localhost:8000/docs
```

### Team split

- **Aymen:** `cd frontend && npm run dev` — no Docker needed for UI work
- **Anouar + Marouane:** `docker compose up db redis backend` — backend with live reload

---

## What This Does NOT Cover

- Individual agent implementation (logic, API calls, prompts) — next spec
- Database schema (tables, indexes) — next spec
- Frontend component implementation — next spec
- Deployment / production config — out of scope for hackathon

---

## Success Criteria

- `docker compose up` brings up all 4 services cleanly
- Frontend loads at `localhost:5173` with existing UI intact
- `POST /api/analyze` returns a `job_id`
- SSE stream at `/api/stream/{job_id}` emits 5 agent events then `complete`
- `AGENT_MODE=mock` makes all of the above work without any real API keys
- Existing demo scenarios (Hassan, Fatima, CRI...) still work via fallback
