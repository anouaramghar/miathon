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
