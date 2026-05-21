from agents.base import BaseAgent

ADMIN_STEPS_BY_PROFILE = {
    "mre": [
        {"step": "Déclaration DRI à la banque",       "time": "30 jours",  "note": "obligatoire MRE — Office des Changes"},
        {"step": "RC + Patente (CRI)",                 "time": "2 semaines","note": "peut se faire depuis l'étranger via mandataire"},
        {"step": "Licence Santé (Pharmacie)",          "time": "8 semaines","note": "dossier médecin + local"},
        {"step": "Financement MDM Tamwil (50%)",       "time": "4 semaines","note": "plafond 2 000 000 DH, taux préférentiel"},
    ],
    "diplome": [
        {"step": "Auto-entrepreneur (CRI)",            "time": "1 semaine", "note": "gratuit, en ligne"},
        {"step": "Patente",                            "time": "2 semaines","note": "taxe locale"},
        {"step": "Programme Intelaka",                 "time": "4 semaines","note": "crédit jusqu'à 250k DH, taux 2%"},
    ],
    "femme_entrepreneur": [
        {"step": "RC (CRI)",                           "time": "1 semaine", "note": ""},
        {"step": "Maroc PME — financement",            "time": "4 semaines","note": "programme garantie 70%"},
        {"step": "Programme Moukawalati",              "time": "3 semaines","note": "aide création 10k DH + formation"},
    ],
    "fonctionnaire": [
        {"step": "Déclaration activité secondaire",    "time": "2 semaines","note": "auprès de votre administration"},
        {"step": "Auto-entrepreneur (compatible)",     "time": "1 semaine", "note": "statut compatible avec fonction publique"},
    ],
}

class Agent4Admin(BaseAgent):
    label = "Calcul de tes démarches administratives..."

    async def _run_mock(self, context: dict) -> dict:
        profile = context.get("profile", "mre")
        steps = ADMIN_STEPS_BY_PROFILE.get(profile, ADMIN_STEPS_BY_PROFILE["mre"])
        return {"admin_steps": steps}
