from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter()

NATIONAL_PROJECTS = [
    {"id": 1,  "name": "Nador West Med — Phase 2",           "sector": "infrastructure", "region": "Oriental",                    "amount": 10000, "promoter": "Agence Nador West Med",       "phase": "en_cours", "progress": 65, "jobs": 15000, "launch": "2026", "x": 78, "y": 14, "featured": True},
    {"id": 2,  "name": "Parc éolien Taza",                   "sector": "energie",        "region": "Fès-Meknès",                  "amount": 800,   "promoter": "MASEN",                       "phase": "planifie", "progress": 15, "jobs": 600,   "launch": "2027", "x": 66, "y": 22},
    {"id": 3,  "name": "TGV Marrakech–Agadir",               "sector": "infrastructure", "region": "Souss-Massa",                 "amount": 35000, "promoter": "ONCF",                        "phase": "planifie", "progress": 8,  "jobs": 25000, "launch": "2028", "x": 32, "y": 70},
    {"id": 4,  "name": "Tanger Med — extension",             "sector": "infrastructure", "region": "Tanger-Tétouan-Al Hoceïma",  "amount": 12000, "promoter": "TMSA",                        "phase": "en_cours", "progress": 48, "jobs": 9000,  "launch": "2026", "x": 52, "y": 8},
    {"id": 5,  "name": "Méga-station solaire Noor V",        "sector": "energie",        "region": "Drâa-Tafilalet",              "amount": 6500,  "promoter": "MASEN",                       "phase": "en_cours", "progress": 32, "jobs": 2200,  "launch": "2027", "x": 42, "y": 58},
    {"id": 6,  "name": "Renault Tanger — Ligne 3",           "sector": "industrie",      "region": "Tanger-Tétouan-Al Hoceïma",  "amount": 2400,  "promoter": "Renault Maroc",               "phase": "en_cours", "progress": 55, "jobs": 3500,  "launch": "2026", "x": 50, "y": 11},
    {"id": 7,  "name": "Stellantis Kénitra — Phase 2",       "sector": "industrie",      "region": "Rabat-Salé-Kénitra",         "amount": 2900,  "promoter": "Stellantis",                  "phase": "en_cours", "progress": 40, "jobs": 2700,  "launch": "2027", "x": 44, "y": 18},
    {"id": 8,  "name": "Smart City Mohammed VI Tanger Tech", "sector": "tech",           "region": "Tanger-Tétouan-Al Hoceïma",  "amount": 5800,  "promoter": "BMCE Capital",                "phase": "planifie", "progress": 5,  "jobs": 100000,"launch": "2030", "x": 51, "y": 13},
    {"id": 9,  "name": "Resort Saïdia — extension",          "sector": "tourisme",       "region": "Oriental",                    "amount": 1200,  "promoter": "SDS",                         "phase": "planifie", "progress": 12, "jobs": 800,   "launch": "2027", "x": 82, "y": 12},
    {"id": 10, "name": "Pôle Agroalimentaire Berkane",       "sector": "agriculture",    "region": "Oriental",                    "amount": 450,   "promoter": "ORMVAM",                      "phase": "en_cours", "progress": 35, "jobs": 1200,  "launch": "2026", "x": 75, "y": 15, "near": True},
    {"id": 11, "name": "Marina Casablanca Phase 3",          "sector": "immobilier",     "region": "Casablanca-Settat",           "amount": 4200,  "promoter": "Al Boraq",                    "phase": "en_cours", "progress": 70, "jobs": 5000,  "launch": "2026", "x": 36, "y": 27},
    {"id": 12, "name": "Hub aéronautique Mohammed V",        "sector": "industrie",      "region": "Casablanca-Settat",           "amount": 2100,  "promoter": "AMDIE",                       "phase": "planifie", "progress": 18, "jobs": 4500,  "launch": "2027", "x": 39, "y": 28},
    {"id": 13, "name": "Hôpital Régional Dakhla",            "sector": "infrastructure", "region": "Dakhla-Oued Ed-Dahab",        "amount": 600,   "promoter": "Ministère de la Santé",       "phase": "en_cours", "progress": 50, "jobs": 800,   "launch": "2026", "x": 18, "y": 90},
    {"id": 14, "name": "Hydrogène vert Sud-Massa",           "sector": "energie",        "region": "Souss-Massa",                 "amount": 9500,  "promoter": "OCP Green",                   "phase": "planifie", "progress": 6,  "jobs": 3000,  "launch": "2029", "x": 30, "y": 68},
    {"id": 15, "name": "Plateforme logistique Oujda",        "sector": "infrastructure", "region": "Oriental",                    "amount": 380,   "promoter": "SNTL",                        "phase": "en_cours", "progress": 60, "jobs": 700,   "launch": "2026", "x": 80, "y": 18, "near": True},
    {"id": 16, "name": "Parc industriel Béni Mellal",        "sector": "industrie",      "region": "Béni Mellal-Khénifra",        "amount": 1500,  "promoter": "MEDZ",                        "phase": "planifie", "progress": 22, "jobs": 6000,  "launch": "2027", "x": 47, "y": 38},
    {"id": 17, "name": "Resort écotouristique Ifrane",       "sector": "tourisme",       "region": "Fès-Meknès",                  "amount": 850,   "promoter": "CDG Développement",           "phase": "planifie", "progress": 10, "jobs": 1100,  "launch": "2028", "x": 55, "y": 30},
    {"id": 18, "name": "Aéroport Tétouan — modernisation",  "sector": "infrastructure", "region": "Tanger-Tétouan-Al Hoceïma",  "amount": 720,   "promoter": "ONDA",                        "phase": "en_cours", "progress": 45, "jobs": 600,   "launch": "2026", "x": 53, "y": 10},
    {"id": 19, "name": "Campus Med-Tech Rabat",              "sector": "tech",           "region": "Rabat-Salé-Kénitra",          "amount": 1800,  "promoter": "UM6P",                        "phase": "en_cours", "progress": 28, "jobs": 2400,  "launch": "2027", "x": 45, "y": 20},
    {"id": 20, "name": "Centrale gaz Mohammedia",            "sector": "energie",        "region": "Casablanca-Settat",           "amount": 3200,  "promoter": "ONEE",                        "phase": "planifie", "progress": 14, "jobs": 1500,  "launch": "2028", "x": 37, "y": 25},
]


@router.get("/projects")
async def get_projects(region: Optional[str] = Query(None)):
    if region:
        return [p for p in NATIONAL_PROJECTS if p["region"] == region]
    return NATIONAL_PROJECTS
