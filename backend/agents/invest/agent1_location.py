import httpx
from collections import Counter
from agents.base import BaseAgent

NOMINATIM = "https://nominatim.openstreetmap.org/search"
OVERPASS  = "https://overpass-api.de/api/interpreter"
HEADERS   = {"User-Agent": "InvestMap-Maroc/1.0 hackathon@eniad.ma"}

# OSM tag → (French label, gap_key or None)
TYPES = {
    ("amenity", "pharmacy"):   ("Pharmacie",          "pharmacie"),
    ("amenity", "cafe"):       ("Café",               None),
    ("amenity", "restaurant"): ("Restaurant",          None),
    ("shop",    "bakery"):     ("Boulangerie",         None),
    ("shop",    "clothes"):    ("Magasin vêtements",   None),
    ("amenity", "car_wash"):   ("Lavage auto",         "lavage_auto"),
    ("shop",    "stationery"): ("Papeterie",           "papeterie"),
}

_OVERPASS_QUERY = """
[out:json][timeout:25];
(
  node["amenity"~"^(pharmacy|cafe|restaurant|car_wash)$"](around:1000,{lat},{lng});
  way["amenity"~"^(pharmacy|cafe|restaurant|car_wash)$"](around:1000,{lat},{lng});
  node["shop"~"^(bakery|clothes|stationery)$"](around:1000,{lat},{lng});
  way["shop"~"^(bakery|clothes|stationery)$"](around:1000,{lat},{lng});
);
out tags;
"""


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
                    {"type": "Café",              "count": 6},
                    {"type": "Restaurant",         "count": 4},
                    {"type": "Boulangerie",        "count": 3},
                    {"type": "Magasin vêtements",  "count": 2},
                    {"type": "Pharmacie (1.8km)",  "count": 1, "far": True},
                ],
            }
        }

    async def _run_live(self, context: dict) -> dict:
        city = context.get("city", "Berkane")
        hood = context.get("neighborhood", "")
        place = f"{hood}, {city}, Maroc" if hood else f"{city}, Maroc"

        try:
            async with httpx.AsyncClient(timeout=20.0, headers=HEADERS) as client:
                # 1. Geocode with Nominatim — try full address first, then city-only fallback
                geo = await client.get(NOMINATIM, params={"q": place, "format": "json", "limit": 1})
                geo_data = geo.json()
                if not geo_data and hood:
                    geo = await client.get(NOMINATIM, params={"q": f"{city}, Maroc", "format": "json", "limit": 1})
                    geo_data = geo.json()
                if not geo_data:
                    return await self._run_mock(context)

                lat = float(geo_data[0]["lat"])
                lng = float(geo_data[0]["lon"])

                # 2. Single Overpass query for all business types
                query = _OVERPASS_QUERY.format(lat=lat, lng=lng)
                osm = await client.post(OVERPASS, data={"data": query})
                elements = osm.json().get("elements", [])

            # 3. Count by OSM tag
            raw_counts: Counter = Counter()
            for el in elements:
                tags = el.get("tags", {})
                for (tag_key, tag_val) in TYPES:
                    if tags.get(tag_key) == tag_val:
                        raw_counts[(tag_key, tag_val)] += 1

            # 4. Build competitors list and identify gaps
            competitors = []
            gaps = []
            pharmacies_1km = 0

            for (tag_key, tag_val), (label, gap_key) in TYPES.items():
                count = raw_counts[(tag_key, tag_val)]
                is_pharmacy = (tag_key == "amenity" and tag_val == "pharmacy")

                if is_pharmacy:
                    pharmacies_1km = count
                    if count == 0:
                        if gap_key:
                            gaps.append(gap_key)
                    else:
                        competitors.append({"type": label, "count": count})
                else:
                    if count == 0 and gap_key:
                        gaps.append(gap_key)
                    elif count > 0:
                        competitors.append({"type": label, "count": count})

            return {
                "location": {
                    "coordinates": {"lat": lat, "lng": lng},
                    "pharmacies_1km": pharmacies_1km,
                    "population_radius": 12400,
                    "avg_income": 4800,
                    "commercial_gaps": gaps,
                    "competitors_1km": sum(c["count"] for c in competitors if not c.get("far")),
                    "competitors": competitors,
                }
            }

        except Exception as e:
            print(f"[Agent1] live fetch failed ({e}), falling back to mock")
            return await self._run_mock(context)
