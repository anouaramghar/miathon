# InvestMap Maroc

Aide à la décision d'investissement au Maroc, sur **données réelles**. Deux couches qui se parlent :

- **Invest (micro)** — pour un porteur de projet : 5 agents IA analysent une opportunité locale.
  Commerces voisins via **OpenStreetMap** (réel), signal de demande (modèle démographique HCP),
  puis raisonnement LLM pour le matching, les démarches administratives et le score de succès.
  Le résultat est diffusé en direct via **SSE** pendant l'analyse.
- **Radar (macro)** — pour une institution (CRI) : les grands projets nationaux sont extraits en
  continu de la **presse nationale** (recherche web **Tavily** + extraction LLM + géocodage
  Nominatim), affichés sur une carte du Maroc avec leur **source**.

**Lien micro ↔ macro :** pendant l'analyse Invest, le pipeline cherche le grand projet national
réel le plus proche de l'investisseur (depuis le cache Radar) et l'injecte dans le score (Agent 5).

## Architecture

```
frontend (racine du repo)        backend/
  index.html                       main.py            FastAPI + CORS
  *.jsx  (React via Babel CDN)     pipeline.py        orchestrateur SSE (5 agents Invest)
  server.js  (Node http, :3000)    agents/invest/     agent1..5
  data.js / personalize.js         agents/radar/      agent6 (Tavily), agent7 (LLM+géocodage)
                                    core/llm.py        client LLM (NVIDIA, sinon OpenRouter)
                                    core/tavily.py     recherche web
                                    api/routes/        /api/analyze, /api/stream, /api/projects
                                    data/…cache.json   dernier run Radar réel (filet de sécurité)
```

## Lancer le projet (2 processus)

**1. Backend** (port 8000) :
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8000
```

**2. Frontend** (port 3000) :
```bash
node server.js
# puis ouvrir http://localhost:3000
```

## Configuration — `backend/.env`

```
AGENT_MODE=live                 # 'live' = vraies API ; 'mock' = données factices
NVIDIA_API_KEY=nvapi-...         # LLM (recommandé) — sinon OPENROUTER_API_KEY
OPENROUTER_API_KEY=sk-or-...     # LLM de repli
TAVILY_API_KEY=tvly-...          # recherche presse pour le Radar national
```

Le client LLM (`core/llm.py`) utilise NVIDIA si une clé `nvapi-` est présente, sinon OpenRouter.
En cas d'échec d'une API, chaque agent retombe proprement sur des données de secours.

## Rafraîchir le Radar national

`GET /api/projects` sert le dernier run réel mis en cache (instantané, filet de sécurité démo).
Pour relancer l'extraction en direct :

```bash
curl -X POST http://localhost:8000/api/projects/refresh
```

## Tests

```bash
cd backend
python test_pipeline.py        # smoke test bout-en-bout (serveur démarré requis)
pytest                          # tests unitaires
```

> Les documents dans `docs/superpowers/` sont des artefacts de planification historiques et ne
> reflètent pas l'implémentation finale ; ce README fait foi.

ENIAD Berkane · Miathon 2026
