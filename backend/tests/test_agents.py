import pytest

CTX = {"profile": "mre", "city": "Berkane", "neighborhood": "Hay Al Massira", "budget": "150-500"}

async def test_agent1_returns_location():
    from agents.invest.agent1_location import Agent1Location
    result = await Agent1Location().run(CTX)
    assert "location" in result
    assert "pharmacies_1km" in result["location"]
    assert "competitors_1km" in result["location"]
    assert "commercial_gaps" in result["location"]

async def test_agent2_returns_demand():
    from agents.invest.agent2_demand import Agent2Demand
    result = await Agent2Demand().run({**CTX, "location": {}})
    assert "demand" in result
    assert "pharmacie_search_volume" in result["demand"]

async def test_agent3_returns_matches():
    from agents.invest.agent3_matching import Agent3Matching
    result = await Agent3Matching().run({**CTX, "location": {}, "demand": {}})
    assert "matches" in result
    assert len(result["matches"]) >= 3
    assert "business" in result["matches"][0]
    assert "score" in result["matches"][0]

async def test_agent4_returns_admin_steps():
    from agents.invest.agent4_admin import Agent4Admin
    result = await Agent4Admin().run(CTX)
    assert "admin_steps" in result
    assert len(result["admin_steps"]) >= 1
    assert "step" in result["admin_steps"][0]

async def test_agent5_returns_scores():
    from agents.invest.agent5_predictor import Agent5Predictor
    result = await Agent5Predictor().run({**CTX, "matches": [{"business": "Pharmacie"}]})
    assert "scores" in result
    assert "top_recommendation" in result["scores"]
    assert "radar_boost" in result["scores"]
