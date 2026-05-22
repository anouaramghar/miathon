from agents.base import BaseAgent
from core.tavily import search

# Thematic + regional queries for broad national coverage. Regional queries
# ensure each of the 12 regions surfaces projects (not just the big national ones).
_QUERIES = [
    "grands projets investissement Maroc milliards dirhams 2025 2026",
    "nouveaux projets industriels usine Maroc investissement 2026",
    "projets énergie renouvelable solaire éolien hydrogène vert Maroc 2026",
    "projets infrastructure port autoroute TGV aéroport Maroc 2026",
    "projets touristiques hôtels resorts Maroc investissement 2026",
    "projets investissement région Oriental Oujda Nador Berkane 2026",
    "projets investissement Casablanca Rabat Tanger 2026 milliards",
    "projets investissement Marrakech Agadir Fès Souss 2026",
    "zones industrielles parcs MEDZ AMDIE Maroc nouveaux projets 2026",
]


class Agent6Collector(BaseAgent):
    label = "Vérification des grands projets nationaux..."

    async def _run_mock(self, context: dict) -> dict:
        return {"collected": 0}

    async def collect(self) -> list[dict]:
        """Run all thematic searches and return a deduplicated list of articles."""
        seen, articles = set(), []
        for q in _QUERIES:
            try:
                results = await search(q, max_results=6)
            except Exception as e:
                print(f"[Agent6] Tavily search failed for '{q}': {e}")
                continue
            for r in results:
                url = r.get("url", "")
                if url and url not in seen:
                    seen.add(url)
                    articles.append(r)
        return articles
