from core.tavily import search

# Multi-language, multi-topic queries for broad national coverage:
#  - French news (national + per-region)
#  - Arabic news (where most Moroccan regional project coverage actually lives)
#  - General topic (official/structured sources: CRI, AMDIE, megaproject lists)
_QUERIES = [
    # French — national & sectoral
    {"q": "grands projets investissement Maroc milliards dirhams 2025 2026", "topic": "news"},
    {"q": "nouveaux projets industriels usine Maroc investissement 2026", "topic": "news"},
    {"q": "projets énergie renouvelable solaire éolien hydrogène vert Maroc 2026", "topic": "news"},
    {"q": "projets infrastructure port autoroute TGV aéroport Maroc 2026", "topic": "news"},
    {"q": "projets touristiques hôtels resorts Maroc investissement 2026", "topic": "news"},
    # French — regional
    {"q": "projets investissement région Oriental Oujda Nador Berkane 2026", "topic": "news"},
    {"q": "projets investissement Marrakech Agadir Fès Souss Massa 2026", "topic": "news"},
    # Arabic — national & regional (high recall for Moroccan press)
    {"q": "مشاريع استثمارية كبرى المغرب 2026 مليار درهم", "topic": "news"},
    {"q": "مشاريع استثمار جهة الشرق وجدة الناظور بركان 2026", "topic": "news"},
    {"q": "مشاريع صناعية وطاقية وبنية تحتية المغرب 2026", "topic": "news"},
    {"q": "مشاريع سياحية وعقارية المغرب استثمار 2026", "topic": "news"},
    # General — official / structured sources
    {"q": "liste grands projets investissement Maroc CRI AMDIE MEDZ", "topic": "general"},
    {"q": "Morocco major investment megaprojects 2026 billion dirhams", "topic": "general"},
]


class Agent6Collector:
    """Collects recent Moroccan investment-project news via Tavily search."""

    async def collect(self) -> list[dict]:
        """Run all queries and return a deduplicated list of articles."""
        seen, articles = set(), []
        for item in _QUERIES:
            try:
                results = await search(item["q"], max_results=6, topic=item["topic"])
            except Exception as e:
                print(f"[Agent6] Tavily search failed for '{item['q'][:40]}': {e}")
                continue
            for r in results:
                url = r.get("url", "")
                if url and url not in seen:
                    seen.add(url)
                    articles.append(r)
        print(f"[Agent6] collected {len(articles)} unique articles")
        return articles
