from agents.base import BaseAgent
from core.llm import chat_json

_SYSTEM = """Tu es un expert juridique et administratif pour la création d'entreprise au Maroc.
Tu réponds UNIQUEMENT en JSON valide, sans texte avant ou après.
Tous les textes sont en français."""

_PROMPT = """Un investisseur veut créer : {business}
Profil : {profile}
Ville : {city}

Liste les 3 à 4 démarches administratives essentielles au Maroc pour créer ce type de commerce.

Réponds avec ce JSON exact :
{{
  "admin_steps": [
    {{
      "step": "nom de la démarche",
      "time": "durée estimée",
      "note": "détail pratique utile"
    }}
  ]
}}

Sois précis sur les organismes (CRI, CNSS, etc.) et les programmes de financement disponibles selon le profil."""


class Agent4Admin(BaseAgent):
    label = "Calcul de tes démarches administratives..."

    async def _run_mock(self, context: dict) -> dict:
        profile = context.get("profile", "mre")
        steps_by_profile = {
            "mre": [
                {"step": "Déclaration DRI à la banque",    "time": "30 jours",   "note": "obligatoire MRE — Office des Changes"},
                {"step": "RC + Patente (CRI)",              "time": "2 semaines", "note": "peut se faire depuis l'étranger via mandataire"},
                {"step": "Licence Santé (Pharmacie)",       "time": "8 semaines", "note": "dossier médecin + local"},
                {"step": "Financement MDM Tamwil (50%)",    "time": "4 semaines", "note": "plafond 2 000 000 DH, taux préférentiel"},
            ],
            "diplome": [
                {"step": "Auto-entrepreneur (CRI)",         "time": "1 semaine",  "note": "gratuit, en ligne"},
                {"step": "Patente",                         "time": "2 semaines", "note": "taxe locale"},
                {"step": "Programme Intelaka",              "time": "4 semaines", "note": "crédit jusqu'à 250k DH, taux 2%"},
            ],
            "femme_entrepreneur": [
                {"step": "RC (CRI)",                        "time": "1 semaine",  "note": ""},
                {"step": "Maroc PME — financement",         "time": "4 semaines", "note": "programme garantie 70%"},
                {"step": "Programme Moukawalati",           "time": "3 semaines", "note": "aide création 10k DH + formation"},
            ],
            "fonctionnaire": [
                {"step": "Déclaration activité secondaire", "time": "2 semaines", "note": "auprès de votre administration"},
                {"step": "Auto-entrepreneur (compatible)",  "time": "1 semaine",  "note": "statut compatible avec fonction publique"},
            ],
        }
        return {"admin_steps": steps_by_profile.get(profile, steps_by_profile["mre"])}

    async def _run_live(self, context: dict) -> dict:
        import asyncio
        await asyncio.sleep(10)  # space out requests to stay under free-tier rate limit
        matches = context.get("matches", [])
        top_business = matches[0]["business"] if matches else "commerce général"

        prompt = _PROMPT.format(
            business=top_business,
            profile=context.get("profile", "mre"),
            city=context.get("city", "Berkane"),
        )

        try:
            result = await chat_json([
                {"role": "system", "content": _SYSTEM},
                {"role": "user",   "content": prompt},
            ])
            if "admin_steps" in result:
                return {"admin_steps": result["admin_steps"]}
        except Exception as e:
            print(f"[Agent4] OpenRouter failed ({e}), falling back to mock")

        return await self._run_mock(context)
