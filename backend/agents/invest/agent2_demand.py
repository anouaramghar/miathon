import asyncio
import httpx
from agents.base import BaseAgent

OVERPASS = "https://overpass-api.de/api/interpreter"
HEADERS  = {"User-Agent": "InvestMap-Maroc/1.0 hackathon@eniad.ma"}

# Gap key → search term used in pytrends
_TREND_KW = {
    "pharmacie":   "pharmacie",
    "papeterie":   "papeterie librairie",
    "lavage_auto": "lavage voiture",
}

# Population estimates for the main demo cities (World Bank / HCP Maroc 2024)
_CITY_POP = {
    "Berkane":     120_000,
    "Casablanca": 4_270_000,
    "Tanger":      960_000,
    "Rabat":       600_000,
    "Agadir":      600_000,
}

# Typical ratio: 1 pharmacy per N inhabitants in a healthy market (Maroc avg ~1/5000)
_MARKET_NORM = {
    "pharmacie":   5_000,
    "papeterie":  12_000,
    "lavage_auto": 8_000,
}


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

    async def _run_live(self, context: dict) -> dict:
        # 1. Try Google Trends (may be rate-limited) in a thread
        loop = asyncio.get_running_loop()
        trends_result = await loop.run_in_executor(None, self._try_pytrends, context)
        if trends_result:
            return trends_result

        # 2. Fallback: compute demand from real OSM competitor density
        return await self._osm_demand(context)

    # ── Google Trends ─────────────────────────────────────────────────────────

    def _try_pytrends(self, context: dict):
        import time
        try:
            import urllib3.util.retry as _retry
            _orig = _retry.Retry.__init__
            def _patched(self, *a, **kw):
                if "method_whitelist" in kw:
                    kw["allowed_methods"] = kw.pop("method_whitelist")
                _orig(self, *a, **kw)
            _retry.Retry.__init__ = _patched

            from pytrends.request import TrendReq

            city = context.get("city", "Maroc")
            gaps = context.get("location", {}).get("commercial_gaps", [])
            top_gap = gaps[0] if gaps else "commerce"
            kw_base = _TREND_KW.get(top_gap, top_gap)
            keyword = f"{kw_base} {city}"

            time.sleep(2)  # be polite, reduce 429 risk
            pt = TrendReq(hl="fr-MA", tz=0, timeout=(10, 25), retries=1, backoff_factor=1.0)
            pt.build_payload([keyword], geo="MA", timeframe="today 3-m")
            df = pt.interest_over_time()

            if df.empty or keyword not in df.columns:
                return None

            avg = int(df[keyword].mean())
            volume = max(50, avg * 4)
            signal = "forte" if avg > 50 else "modérée" if avg > 20 else "faible"

            related = pt.related_queries()
            top_rel = related.get(keyword, {}).get("top")
            complaints = top_rel["query"].head(3).tolist() if (top_rel is not None and not top_rel.empty) else []

            return {
                "demand": {
                    "search_volume": volume,
                    "demand_signal": signal,
                    "top_keyword": keyword,
                    "google_trends_avg": avg,
                    "top_complaints": complaints or ["offre insuffisante", "accès difficile"],
                    "source": "Google Trends · Maroc · 3 mois",
                }
            }
        except Exception as e:
            print(f"[Agent2] pytrends unavailable ({type(e).__name__}), switching to OSM demand model")
            return None

    # ── OSM-based demand model ────────────────────────────────────────────────

    async def _osm_demand(self, context: dict) -> dict:
        location = context.get("location", {})
        coords   = location.get("coordinates")
        gaps     = location.get("commercial_gaps", [])
        city     = context.get("city", "Berkane")
        top_gap  = gaps[0] if gaps else None

        if not top_gap or not coords:
            return await self._run_mock(context)

        lat, lng = coords["lat"], coords["lng"]
        population = _CITY_POP.get(city, 150_000)
        norm = _MARKET_NORM.get(top_gap, 8_000)

        # Count this business type within 2km (wider radius for saturation picture)
        osm_tag = {
            "pharmacie":   ("amenity", "pharmacy"),
            "papeterie":   ("shop",    "stationery"),
            "lavage_auto": ("amenity", "car_wash"),
        }.get(top_gap, ("amenity", "cafe"))

        tag_key, tag_val = osm_tag
        query = (
            f'[out:json][timeout:15];'
            f'(node["{tag_key}"="{tag_val}"](around:2000,{lat},{lng});'
            f'way["{tag_key}"="{tag_val}"](around:2000,{lat},{lng}););'
            f'out count;'
        )
        count_2km = 0
        try:
            async with httpx.AsyncClient(timeout=15.0, headers=HEADERS) as client:
                r = await client.post(OVERPASS, data={"data": query})
                count_2km = int(r.json()["elements"][0]["tags"]["total"])
        except Exception:
            pass

        # Expected businesses for this city given population
        expected = population / norm
        ratio = count_2km / expected if expected else 0

        if count_2km == 0:
            signal, volume, complaint = "très forte", 400, "aucune offre dans la zone"
        elif ratio < 0.5:
            signal, volume, complaint = "forte", 280, "offre insuffisante vs. population"
        elif ratio < 1.0:
            signal, volume, complaint = "modérée", 160, "marché en croissance"
        else:
            signal, volume, complaint = "faible", 80, "marché saturé"

        return {
            "demand": {
                "search_volume": volume,
                "demand_signal": signal,
                "existing_2km": count_2km,
                "expected_for_city": round(expected, 1),
                "saturation_ratio": round(ratio, 2),
                "top_complaints": [complaint, f"{count_2km} établissements dans 2 km"],
                "source": "OpenStreetMap · modèle démographique HCP 2024",
            }
        }
