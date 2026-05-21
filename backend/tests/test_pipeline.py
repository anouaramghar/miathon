import pytest
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
