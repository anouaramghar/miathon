// InvestMap Maroc — v3.0 hardcoded data
// Two layers: Invest (local) + Radar (national)

// ───── National Radar — 20 projects across Morocco ─────

const REGIONS = [
  'Tanger-Tétouan-Al Hoceïma','Oriental','Fès-Meknès','Rabat-Salé-Kénitra',
  'Béni Mellal-Khénifra','Casablanca-Settat','Marrakech-Safi','Drâa-Tafilalet',
  'Souss-Massa','Guelmim-Oued Noun','Laâyoune-Sakia El Hamra','Dakhla-Oued Ed-Dahab'
];

const SECTORS = {
  infrastructure: { color: '#c2562b', label: 'Infrastructure' },
  energie:        { color: '#1f6b3a', label: 'Énergie' },
  industrie:      { color: '#5a4691', label: 'Industrie' },
  tourisme:       { color: '#2a6fa8', label: 'Tourisme' },
  agriculture:    { color: '#7a8a2c', label: 'Agriculture' },
  immobilier:     { color: '#a8481f', label: 'Immobilier' },
  tech:           { color: '#3a342c', label: 'Tech' },
};

const NATIONAL_PROJECTS = [
  { id: 1,  name: 'Nador West Med — Phase 2',           sector: 'infrastructure', region: 'Oriental',                    amount: 10000, promoter: 'Agence Nador West Med',       phase: 'en_cours', progress: 65, jobs: 15000, launch: '2026', source: 'medias24.com',           x: 78, y: 14, featured: true },
  { id: 2,  name: 'Parc éolien Taza',                   sector: 'energie',        region: 'Fès-Meknès',                  amount: 800,   promoter: 'MASEN',                       phase: 'planifie', progress: 15, jobs: 600,   launch: '2027', source: 'cri-invest.ma',          x: 66, y: 22 },
  { id: 3,  name: 'TGV Marrakech–Agadir',               sector: 'infrastructure', region: 'Souss-Massa',                 amount: 35000, promoter: 'ONCF',                        phase: 'planifie', progress: 8,  jobs: 25000, launch: '2028', source: 'investinmorocco.com',    x: 32, y: 70 },
  { id: 4,  name: 'Tanger Med — extension',             sector: 'infrastructure', region: 'Tanger-Tétouan-Al Hoceïma',  amount: 12000, promoter: 'TMSA',                        phase: 'en_cours', progress: 48, jobs: 9000,  launch: '2026', source: 'medias24.com',           x: 52, y: 8  },
  { id: 5,  name: 'Méga-station solaire Noor V',        sector: 'energie',        region: 'Drâa-Tafilalet',              amount: 6500,  promoter: 'MASEN',                       phase: 'en_cours', progress: 32, jobs: 2200,  launch: '2027', source: 'leconomiste.com',        x: 42, y: 58 },
  { id: 6,  name: 'Renault Tanger — Ligne 3',           sector: 'industrie',      region: 'Tanger-Tétouan-Al Hoceïma',  amount: 2400,  promoter: 'Renault Maroc',               phase: 'en_cours', progress: 55, jobs: 3500,  launch: '2026', source: 'leconomiste.com',        x: 50, y: 11 },
  { id: 7,  name: 'Stellantis Kénitra — Phase 2',       sector: 'industrie',      region: 'Rabat-Salé-Kénitra',         amount: 2900,  promoter: 'Stellantis',                  phase: 'en_cours', progress: 40, jobs: 2700,  launch: '2027', source: 'medias24.com',           x: 44, y: 18 },
  { id: 8,  name: 'Smart City Mohammed VI Tanger Tech', sector: 'tech',           region: 'Tanger-Tétouan-Al Hoceïma',  amount: 5800,  promoter: 'BMCE Capital',                phase: 'planifie', progress: 5,  jobs: 100000,launch: '2030', source: 'mapmaroc.gov.ma',        x: 51, y: 13 },
  { id: 9,  name: 'Resort Saïdia — extension',          sector: 'tourisme',       region: 'Oriental',                    amount: 1200,  promoter: 'SDS',                         phase: 'planifie', progress: 12, jobs: 800,   launch: '2027', source: 'cri-invest.ma',          x: 82, y: 12 },
  { id: 10, name: 'Pôle Agroalimentaire Berkane',       sector: 'agriculture',    region: 'Oriental',                    amount: 450,   promoter: 'ORMVAM',                      phase: 'en_cours', progress: 35, jobs: 1200,  launch: '2026', source: 'cri-invest.ma',          x: 75, y: 15, near: true },
  { id: 11, name: 'Marina Casablanca Phase 3',          sector: 'immobilier',     region: 'Casablanca-Settat',           amount: 4200,  promoter: 'Al Boraq',                    phase: 'en_cours', progress: 70, jobs: 5000,  launch: '2026', source: 'medias24.com',           x: 36, y: 27 },
  { id: 12, name: 'Hub aéronautique Mohammed V',        sector: 'industrie',      region: 'Casablanca-Settat',           amount: 2100,  promoter: 'AMDIE',                       phase: 'planifie', progress: 18, jobs: 4500,  launch: '2027', source: 'investinmorocco.com',    x: 39, y: 28 },
  { id: 13, name: 'Hôpital Régional Dakhla',            sector: 'infrastructure', region: 'Dakhla-Oued Ed-Dahab',        amount: 600,   promoter: 'Ministère de la Santé',       phase: 'en_cours', progress: 50, jobs: 800,   launch: '2026', source: 'mmsp.gov.ma',            x: 18, y: 90 },
  { id: 14, name: 'Hydrogène vert Sud-Massa',           sector: 'energie',        region: 'Souss-Massa',                 amount: 9500,  promoter: 'OCP Green',                   phase: 'planifie', progress: 6,  jobs: 3000,  launch: '2029', source: 'leconomiste.com',        x: 30, y: 68 },
  { id: 15, name: 'Plateforme logistique Oujda',        sector: 'infrastructure', region: 'Oriental',                    amount: 380,   promoter: 'SNTL',                        phase: 'en_cours', progress: 60, jobs: 700,   launch: '2026', source: 'medias24.com',           x: 80, y: 18, near: true },
  { id: 16, name: 'Parc industriel Béni Mellal',        sector: 'industrie',      region: 'Béni Mellal-Khénifra',        amount: 1500,  promoter: 'MEDZ',                        phase: 'planifie', progress: 22, jobs: 6000,  launch: '2027', source: 'cri-invest.ma',          x: 47, y: 38 },
  { id: 17, name: 'Resort écotouristique Ifrane',       sector: 'tourisme',       region: 'Fès-Meknès',                  amount: 850,   promoter: 'CDG Développement',           phase: 'planifie', progress: 10, jobs: 1100,  launch: '2028', source: 'investinmorocco.com',    x: 55, y: 30 },
  { id: 18, name: 'Aéroport Tétouan — modernisation',  sector: 'infrastructure', region: 'Tanger-Tétouan-Al Hoceïma',  amount: 720,   promoter: 'ONDA',                        phase: 'en_cours', progress: 45, jobs: 600,   launch: '2026', source: 'mmsp.gov.ma',            x: 53, y: 10 },
  { id: 19, name: 'Campus Med-Tech Rabat',             sector: 'tech',           region: 'Rabat-Salé-Kénitra',          amount: 1800,  promoter: 'UM6P',                        phase: 'en_cours', progress: 28, jobs: 2400,  launch: '2027', source: 'mapmaroc.gov.ma',        x: 45, y: 20 },
  { id: 20, name: 'Centrale gaz Mohammedia',           sector: 'energie',        region: 'Casablanca-Settat',           amount: 3200,  promoter: 'ONEE',                        phase: 'planifie', progress: 14, jobs: 1500,  launch: '2028', source: 'leconomiste.com',        x: 37, y: 25 },
];

// ───── Radar boost objects — one per anchoring national project ─────

const NADOR_WEST_MED = {
  id: 1,
  name: 'Nador West Med — Phase 2',
  shortName: 'Nador West Med',
  description: 'Port en eaux profondes + zone franche industrielle de 5 000 ha. Adjacent à Berkane (60 km).',
  amount: '10 milliards DH',
  jobs: '15 000 emplois directs prévus',
  progress: 65,
  phase: 'En cours · 2026–2028',
  promoter: 'Agence spéciale Nador West Med',
  distanceToBerkane: 60,
  detectedAt: '14 mai 2026 · 09:42',
  source: 'medias24.com — "Nador West Med : le port entre dans sa phase d\'industrialisation"',
  boostedOpportunities: [
    {
      business: 'Station-service route du port',
      score: 94, boost: '+16',
      reason: 'Trafic camions × 4 attendu d\'ici 2027. Aucune station haute-capacité dans 12 km.',
      invest: '180–250k DH', monthlyNet: '28–38k DH', roi: 'mois 9–14',
    },
    {
      business: 'Restaurant ouvriers / cantine',
      score: 87, boost: '+12',
      reason: '15 000 emplois → besoin quotidien repas chauds. Aucun acteur structuré sur la zone.',
      invest: '60–90k DH', monthlyNet: '14–22k DH', roi: 'mois 8–12',
    },
    {
      business: 'Entrepôt logistique petite surface',
      score: 82, boost: '+9',
      reason: 'Stockage tampon pour sous-traitants du port. Foncier disponible côté Berkane.',
      invest: '320–450k DH', monthlyNet: '22–32k DH', roi: 'mois 18–26',
    },
  ],
};

const HUB_AERONAUTIQUE = {
  id: 12,
  name: 'Hub aéronautique Mohammed V — Phase 2',
  shortName: 'Hub Aéronautique',
  description: 'Plateforme industrielle aéronautique de 450 ha adjacent à l\'aéroport Mohammed V. 30+ sous-traitants internationaux.',
  amount: '2,1 Mds DH',
  jobs: '4 500 emplois directs',
  progress: 18,
  phase: 'Planifié · 2027',
  promoter: 'AMDIE / GIMAS',
  distanceToBerkane: 18,
  detectedAt: '11 mai 2026 · 14:22',
  source: 'investinmorocco.com — "Aéronautique : la montée en puissance de Casablanca"',
  boostedOpportunities: [
    {
      business: 'Espace coworking & salles de réunion',
      score: 88, boost: '+14',
      reason: '4 500 ingénieurs + cadres → besoin d\'espaces flexibles. Aucun coworking à moins de 2 km.',
      invest: '65–95k DH', monthlyNet: '15–22k DH', roi: 'mois 10–16',
    },
    {
      business: 'Restaurant d\'entreprise / traiteur B2B',
      score: 81, boost: '+10',
      reason: 'Contrats de restauration avec les sous-traitants du hub — volume garanti.',
      invest: '80–130k DH', monthlyNet: '18–28k DH', roi: 'mois 12–18',
    },
    {
      business: 'Transport navette entreprise',
      score: 76, boost: '+8',
      reason: 'Déficit de transport entre Casablanca centre et la zone aéronautique.',
      invest: '120–200k DH', monthlyNet: '14–20k DH', roi: 'mois 16–24',
    },
  ],
};

const TANGER_TECH = {
  id: 8,
  name: 'Smart City Mohammed VI Tanger Tech',
  shortName: 'Tanger Tech',
  description: 'Nouvelle ville intelligente de 2 000 ha entre Tanger et Tétouan. Hub industriel, résidentiel et universitaire.',
  amount: '5,8 Mds DH',
  jobs: '100 000 emplois · 2030',
  progress: 5,
  phase: 'Planifié · 2030',
  promoter: 'BMCE Capital / Mohammed VI Polytechnic',
  distanceToBerkane: 8,
  detectedAt: '9 mai 2026 · 11:30',
  source: 'medias24.com — "Tanger Tech : les travaux démarrent sur 500 ha"',
  boostedOpportunities: [
    {
      business: 'Résidence meublée étudiants & cadres',
      score: 91, boost: '+18',
      reason: '100 000 futurs résidents — déficit massif en logement qualitatif dans le rayon 10 km.',
      invest: '280–380k DH', monthlyNet: '25–38k DH', roi: 'mois 18–28',
    },
    {
      business: 'École privée / garde d\'enfants premium',
      score: 82, boost: '+12',
      reason: 'Familles d\'expatriés et cadres cherchent scolarisation de qualité. Aucune offre dans 5 km.',
      invest: '120–180k DH', monthlyNet: '18–26k DH', roi: 'mois 10–16',
    },
    {
      business: 'Centre de fitness & bien-être',
      score: 77, boost: '+9',
      reason: 'Population active + cadres = forte demande lifestyle. 0 salle de sport dans 4 km.',
      invest: '150–240k DH', monthlyNet: '20–30k DH', roi: 'mois 12–18',
    },
  ],
};

const TGV_SUD = {
  id: 3,
  name: 'TGV Marrakech–Agadir',
  shortName: 'TGV Sud',
  description: 'Ligne à grande vitesse reliant Marrakech à Agadir (270 km) — 80 min de trajet prévu.',
  amount: '35 Mds DH',
  jobs: '25 000 emplois construction + 2 000 permanents',
  progress: 8,
  phase: 'Planifié · 2028',
  promoter: 'ONCF / Ministère Transport',
  distanceToBerkane: 15,
  detectedAt: '7 mai 2026 · 16:15',
  source: 'leconomiste.com — "TGV Agadir : le financement bouclé pour 2028"',
  boostedOpportunities: [
    {
      business: 'Maison d\'hôtes / Riad boutique',
      score: 89, boost: '+16',
      reason: 'TGV = +60% connexions Marrakech–Agadir → afflux touristes et hommes d\'affaires.',
      invest: '420–560k DH', monthlyNet: '30–50k DH', roi: 'mois 20–30',
    },
    {
      business: 'Restaurant gastronomique local',
      score: 78, boost: '+12',
      reason: 'Nouvelle clientèle aisée Marrakech attirée par Agadir — besoin d\'adresses de référence.',
      invest: '200–320k DH', monthlyNet: '22–36k DH', roi: 'mois 14–20',
    },
    {
      business: 'Location voitures premium',
      score: 73, boost: '+10',
      reason: 'Gare TGV = point d\'entrée pour exploration de la région. Déficit offre premium.',
      invest: '300–450k DH', monthlyNet: '28–42k DH', roi: 'mois 16–24',
    },
  ],
};

const MEDTECH_RABAT = {
  id: 19,
  name: 'Campus Med-Tech Rabat',
  shortName: 'Med-Tech Rabat',
  description: 'Campus technologique et startup hub adossé à UM6P — 200+ startups, 2 400 chercheurs prévus.',
  amount: '1,8 Md DH',
  jobs: '2 400 emplois directs · 5 000 indirects',
  progress: 28,
  phase: 'En cours · 2027',
  promoter: 'UM6P / Ministère Enseignement Sup.',
  distanceToBerkane: 3,
  detectedAt: '12 mai 2026 · 10:05',
  source: 'mapmaroc.gov.ma — "Med-Tech Rabat : livraison phase 1 confirmée pour T3 2027"',
  boostedOpportunities: [
    {
      business: 'Agence social media startups tech',
      score: 88, boost: '+16',
      reason: '200+ startups sans équipe marketing → forte demande de contenu et de branding.',
      invest: '5–18k DH', monthlyNet: '10–18k DH', roi: 'mois 3–6',
    },
    {
      business: 'Café-espace de travail premium',
      score: 79, boost: '+11',
      reason: 'Chercheurs et fondateurs de startups cherchent des espaces informels hors campus.',
      invest: '80–120k DH', monthlyNet: '15–22k DH', roi: 'mois 10–14',
    },
    {
      business: 'Formation communication pour entrepreneurs',
      score: 73, boost: '+8',
      reason: 'Fondateurs tech avec peu de compétences soft skills / pitch. Formation facturable.',
      invest: '3–10k DH', monthlyNet: '8–14k DH', roi: 'mois 2–4',
    },
  ],
};

// ───── Invest Layer scenarios ─────

const SCENARIOS = {

  // ── Hassan — MRE Pays-Bas · Berkane · Pharmacie ──────────────────────────
  hassan: {
    kind: 'particulier',
    user: {
      name: 'Hassan', age: 38, profile: 'mre', profileLabel: 'MRE',
      country: 'Pays-Bas', city: 'Berkane', neighborhood: 'Hay Al Massira',
      budget: 150000, budgetId: '150-500', budgetBand: '150–500K',
      availability: 'quarterly', availabilityLabel: '1 visite / 3 mois',
    },
    neighborhood: {
      population: 12400, avgIncome: 4800, area: '1.2 km²', density: '10 333 / km²',
      center: [34.9197, -2.3197],
    },
    competitors: [
      { type: 'Café',               count: 6, lat: 35, lng: 40, names: ['Café Atlas', 'Café Massira', 'Café Saada', 'Café Zitoun'] },
      { type: 'Restaurant',         count: 4, lat: 55, lng: 30, names: ['Snack El Fath', 'Resto Manar', 'Snack Berkane', 'Resto Zitoun'] },
      { type: 'Boulangerie',        count: 3, lat: 70, lng: 55, names: ['Boulangerie Rif', 'Boulangerie Salam', 'Boulangerie Madina'] },
      { type: 'Magasin vêtements',  count: 2, lat: 25, lng: 65, names: ['Layla Mode', 'Mode El Baz'] },
      { type: 'Pharmacie (1.8km)',  count: 1, lat: 88, lng: 80, far: true, names: ['Pharmacie Centrale'] },
      { type: 'Pharmacie (1.8km)',  count: 1, lat: 12, lng: 14, far: true, names: ['Pharmacie Hay Salam'] },
    ],
    topRecommendation: {
      business: 'Pharmacie',
      score: 78,
      verdict: 'Forte opportunité',
      positives: [
        { label: '0 pharmacie dans 1.2 km',            weight: '+25', detail: 'vide commercial confirmé' },
        { label: '340 recherches/mois sur Google',      weight: '+15', detail: 'demande active non satisfaite' },
        { label: 'Cas similaire réussi à Oujda (2022)', weight: '+10', detail: 'Hay El Qods, profil démographique comparable' },
        { label: 'Revenu moyen 4 800 DH',              weight: '+10', detail: 'pouvoir d\'achat correct' },
        { label: '12 400 habitants dans le rayon',     weight: '+8',  detail: '1 pharmacie / 12k habitants — Maroc: 1 / 4.7k' },
        { label: 'Nador West Med à 60 km',             weight: '+5',  detail: 'bonus Radar — flux démographique attendu' },
      ],
      risks: [
        { label: 'Grande pharmacie à 1.8 km',     weight: '-8', detail: 'concurrence indirecte sur prescriptions complexes' },
        { label: 'Licence Santé : délai 8 semaines', weight: '—', detail: 'lent mais prévisible' },
      ],
      finance: {
        investment: { low: 130000, high: 160000 },
        monthlyNet: { low: 15000, high: 22000 },
        roiMonths:  { low: 14, high: 18 },
      },
      admin: [
        { step: 'Déclaration DRI à la banque',          time: '30 jours',   note: 'obligatoire MRE — Office des Changes' },
        { step: 'Registre du Commerce',                 time: '2 semaines', note: 'via CRI Oriental — formulaire 92' },
        { step: 'Licence Ministère de la Santé',        time: '8 semaines', note: 'diplôme pharmacien titulaire requis' },
        { step: 'Affiliation CNSS',                     time: '1 semaine',  note: 'après immatriculation' },
      ],
      financing: [
        { name: 'MDM Tamwil', desc: '50% du financement pour MRE — taux préférentiel 4.5%', tag: 'Éligible' },
        { name: 'Crédit BMCE Bank MRE', desc: 'Jusqu\'à 80% du projet, durée 7 ans', tag: 'Compatible' },
      ],
    },
    alternatives: [
      { business: 'Centre d\'impression numérique', score: 66, invest: '60–90k', roi: '12 mois',
        reason: 'Manque d\'offre B2B dans le quartier — bureaux administratifs proches.' },
      { business: 'Lavage auto premium', score: 61, invest: '120–180k', roi: '20 mois',
        reason: 'Demande émergente — zone résidentielle motorisée, pas d\'offre haut-de-gamme.' },
    ],
    avoid: [
      { business: 'Magasin de vêtements', score: 29, reason: '3 fermetures dans le quartier (2021–2024). Marché saturé Berkane + concurrence souk hebdomadaire.' },
      { business: 'Café',                 score: 41, reason: '6 cafés actifs dans 800m. Ticket moyen 8 DH — incompatible avec ROI 150k DH.' },
      { business: 'Boucherie',            score: 38, reason: 'Saturation circuit traditionnel. Capital immobilisé en stock périssable.' },
    ],
    nearbyRadarProjects: [1, 10, 15, 9],
    radarBoost: NADOR_WEST_MED,
  },

  // ── Fatima — Diplômée · Berkane · Papeterie ──────────────────────────────
  fatima: {
    kind: 'particulier',
    user: {
      name: 'Fatima', age: 27, profile: 'diplome', profileLabel: 'Diplômée',
      country: null, city: 'Berkane', neighborhood: 'Hay Al Massira',
      budget: 30000, budgetId: 'lt30', budgetBand: '–30K',
      availability: 'fulltime', availabilityLabel: 'Temps plein', field: 'Gestion',
    },
    neighborhood: {
      population: 12400, avgIncome: 4800, area: '1.2 km²', density: '10 333 / km²',
      center: [34.9197, -2.3197],
    },
    competitors: [
      { type: 'Café',              count: 6, lat: 35, lng: 40, names: ['Café Atlas', 'Café Massira', 'Café Saada', 'Café Zitoun'] },
      { type: 'Restaurant',        count: 4, lat: 55, lng: 30, names: ['Snack El Fath', 'Resto Manar', 'Snack Berkane', 'Resto Zitoun'] },
      { type: 'Boulangerie',       count: 3, lat: 70, lng: 55, names: ['Boulangerie Rif', 'Boulangerie Salam', 'Boulangerie Madina'] },
      { type: 'Magasin vêtements', count: 2, lat: 25, lng: 65, names: ['Layla Mode', 'Mode El Baz'] },
    ],
    topRecommendation: {
      business: 'Centre photocopie & papeterie',
      score: 71,
      verdict: 'Opportunité solide',
      positives: [
        { label: '0 concurrent dans 800 m',        weight: '+25', detail: 'vide local confirmé sur Google Maps' },
        { label: 'École primaire + lycée à 400m',   weight: '+12', detail: 'demande captive constante' },
        { label: 'Investissement adapté au budget', weight: '+10', detail: '30 000 DH suffisant — pas de dette' },
        { label: 'Gestion simple',                  weight: '+8',  detail: 'formation gestion = atout — pas d\'expertise technique requise' },
        { label: 'Saisonnalité rentrée scolaire',   weight: '+6',  detail: 'pic septembre–octobre + examens' },
      ],
      risks: [
        { label: 'Marge unitaire faible',      weight: '-5', detail: 'compenser par volume + services annexes' },
        { label: 'Digitalisation progressive', weight: '-5', detail: 'anticiper diversification dans 5 ans' },
      ],
      finance: {
        investment: { low: 20000, high: 35000 },
        monthlyNet: { low: 6000, high: 9000 },
        roiMonths:  { low: 8, high: 12 },
      },
      admin: [
        { step: 'Statut Auto-entrepreneur', time: '1 semaine',  note: 'en ligne — ae.gov.ma' },
        { step: 'Patente locale',           time: '2 semaines', note: 'commune de Berkane' },
        { step: 'Domiciliation activité',   time: '3 jours',    note: 'bail commercial ou domicile' },
      ],
      financing: [
        { name: 'Intelaka', desc: 'Garantie 80% par CCG — taux 2% pour jeunes entrepreneurs', tag: 'Éligible' },
        { name: 'Maroc PME — Programme Femme', desc: 'Accompagnement gratuit + subvention équipement', tag: 'Éligible' },
      ],
    },
    alternatives: [
      { business: 'Coiffure & beauté à domicile', score: 64, invest: '8–15k', roi: '6 mois',
        reason: 'Capital faible. Bouche-à-oreille fort dans quartier résidentiel.' },
      { business: 'Garderie / soutien scolaire', score: 62, invest: '15–25k', roi: '10 mois',
        reason: 'Diplôme gestion + proximité écoles. Demande des parents actifs.' },
    ],
    avoid: [
      { business: 'Restaurant',           score: 32, reason: 'Budget insuffisant (min 80k DH). Saturation locale + risque sanitaire élevé.' },
      { business: 'Magasin de vêtements', score: 29, reason: '3 fermetures dans le quartier (2021–2024). Stock immobilisé incompatible avec 30k DH.' },
    ],
    nearbyRadarProjects: [1, 10],
    radarBoost: null,
  },

  // ── Omar — Fonctionnaire · Casablanca Maarif · Coworking ─────────────────
  omar: {
    kind: 'particulier',
    user: {
      name: 'Omar', age: 35, profile: 'fonctionnaire', profileLabel: 'Fonctionnaire',
      country: null, city: 'Casablanca', neighborhood: 'Maarif',
      budget: 80000, budgetId: '30-150', budgetBand: '30–150K',
      availability: 'parttime', availabilityLabel: 'Mi-temps', field: 'Finance',
    },
    neighborhood: {
      population: 48000, avgIncome: 8200, area: '3.8 km²', density: '12 632 / km²',
      center: [33.5892, -7.6321],
    },
    competitors: [
      { type: 'Café',      count: 14, lat: 30, lng: 25, names: ['Café Maarif', 'Café Liberté', 'Le Commerce', 'Café Victoria'] },
      { type: 'Restaurant', count: 9, lat: 60, lng: 35, names: ['Le Marrakchi', 'Snack Le Coq', 'Chez Sylvana'] },
      { type: 'Épicerie',   count: 8, lat: 70, lng: 55, names: ['Épicerie Badr', 'Mini Marché Hassan', 'Chez Mustapha'] },
      { type: 'Coworking',  count: 1, lat: 20, lng: 72, far: true, names: ['ImpactHub Maarif'] },
    ],
    topRecommendation: {
      business: 'Espace coworking spécialisé',
      score: 74,
      verdict: 'Opportunité émergente',
      positives: [
        { label: '1 seul coworking à 2.4 km',        weight: '+22', detail: 'zone sous-équipée face à demande cadres en hausse' },
        { label: 'Hub aéronautique à 18 km',          weight: '+14', detail: 'bonus Radar — afflux cadres techniques & ingénieurs' },
        { label: 'Revenu moyen 8 200 DH',             weight: '+12', detail: 'pouvoir d\'achat B2B dans le quartier Maarif' },
        { label: 'Profil Finance = crédibilité B2B',  weight: '+8',  detail: 'réseau corporatif existant comme premier client' },
        { label: 'Tendance télétravail hybride',      weight: '+7',  detail: 'demande stable et structurelle depuis 2022' },
      ],
      risks: [
        { label: 'Investissement mobilier élevé', weight: '-6', detail: 'amortissement sur 36 mois minimum' },
        { label: 'Disponibilité partielle',       weight: '-5', detail: 'nécessite un manager sur place à temps plein' },
      ],
      finance: {
        investment: { low: 65000, high: 95000 },
        monthlyNet: { low: 12000, high: 18000 },
        roiMonths:  { low: 10, high: 16 },
      },
      admin: [
        { step: 'SARL à associé unique',             time: '3 semaines', note: 'CRI Casablanca-Settat — capital min 10k DH' },
        { step: 'Patente & taxe professionnelle',    time: '2 semaines', note: 'commune de Casablanca' },
        { step: 'Contrat de bail commercial',        time: '1 semaine',  note: 'quartier Maarif — prévoir 3 mois loyer de caution' },
        { step: 'Affiliation CNSS salariés',         time: '3 jours',    note: 'dès premier salarié embauché' },
      ],
      financing: [
        { name: 'Crédit Jeunes Entrepreneurs BCP', desc: 'Financement jusqu\'à 70% — taux 5.5%, durée 5 ans', tag: 'Compatible' },
        { name: 'Maroc PME — Imtiaz', desc: 'Prime 20% du coût d\'investissement, plafond 5M DH', tag: 'Éligible' },
      ],
    },
    alternatives: [
      { business: 'Café-restaurant premium', score: 66, invest: '70–120k', roi: '18 mois',
        reason: 'Forte densité mais ticket moyen élevé possible — positionnement haut de gamme sur Maarif.' },
      { business: 'Centre de formation certifiante', score: 61, invest: '40–70k', roi: '14 mois',
        reason: 'Profil Finance = crédibilité. Demande en comptabilité et gestion PME à Casablanca.' },
    ],
    avoid: [
      { business: 'Café standard',      score: 28, reason: '14 cafés dans 800m. Saturation totale — marge nette < 8%.' },
      { business: 'Épicerie',           score: 31, reason: 'Pression prix Marjane / Label\'Vie. Stock immobilisé trop élevé.' },
      { business: 'Pressing',           score: 35, reason: 'Saturation + équipement industriel coûteux. ROI 36+ mois.' },
    ],
    nearbyRadarProjects: [11, 12, 20],
    radarBoost: HUB_AERONAUTIQUE,
  },

  // ── Samira — MRE Espagne · Tanger Boukhalef · Résidence meublée ──────────
  samira: {
    kind: 'particulier',
    user: {
      name: 'Samira', age: 42, profile: 'mre', profileLabel: 'MRE',
      country: 'Espagne', city: 'Tanger', neighborhood: 'Boukhalef',
      budget: 350000, budgetId: '150-500', budgetBand: '150–500K',
      availability: 'quarterly', availabilityLabel: '1 visite / 3 mois',
    },
    neighborhood: {
      population: 35000, avgIncome: 5600, area: '2.8 km²', density: '12 500 / km²',
      center: [35.7395, -5.8590],
    },
    competitors: [
      { type: 'Café',              count: 8,  lat: 30, lng: 35, names: ['Café Détroit', 'Café Boukhalef', "L'Horizon", 'Café Bab'] },
      { type: 'Restaurant',        count: 5,  lat: 55, lng: 60, names: ['Snack El Boughaz', 'Resto Andalus', 'Chez Malek'] },
      { type: 'Pharmacie',         count: 2,  lat: 70, lng: 30, names: ['Pharmacie Boukhalef', 'Pharmacie Tanja'] },
      { type: 'Résidence meublée', count: 1,  lat: 20, lng: 70, far: true, names: ['Résidence Sidi Sghir'] },
    ],
    topRecommendation: {
      business: 'Résidence étudiante meublée',
      score: 83,
      verdict: 'Très forte opportunité',
      positives: [
        { label: '0 résidence structurée dans 3 km',     weight: '+24', detail: 'vide de marché sur la demande étudiante et cadres' },
        { label: 'Tanger Tech à 8 km',                   weight: '+18', detail: 'bonus Radar — 100 000 emplois/résidents attendus d\'ici 2030' },
        { label: 'Université Al-Manzil + ENSA proches',  weight: '+14', detail: '12 000 étudiants en recherche de logement' },
        { label: 'Expats + cadres Tanger Med',           weight: '+10', detail: 'rotation élevée de professionnels en déplacement' },
        { label: 'Budget 350k DH adapté',                weight: '+8',  detail: 'acquisition + aménagement de 6–8 studios possible' },
      ],
      risks: [
        { label: 'Gestion locative à distance', weight: '-8', detail: 'nécessite un régisseur sur place' },
        { label: 'Déclaration loyers MRE',      weight: '-5', detail: 'obligation fiscale IR Maroc + convention Maroc-Espagne' },
      ],
      finance: {
        investment: { low: 280000, high: 380000 },
        monthlyNet: { low: 22000, high: 35000 },
        roiMonths:  { low: 18, high: 28 },
      },
      admin: [
        { step: 'Déclaration DRI — apport MRE',    time: '30 jours',    note: 'Office des Changes — formulaire IS1' },
        { step: 'Acquisition immobilière',         time: '6–8 semaines', note: 'notaire, conservation foncière, droits enregistrement 4%' },
        { step: 'Déclaration activité location',   time: '2 semaines',  note: 'commune Tanger + fisc marocain — IR foncier 15%' },
        { step: 'Contrat gestion locative',        time: '1 semaine',   note: 'agence locale ou régisseur indépendant' },
      ],
      financing: [
        { name: 'MDM Tamwil (CIH Bank)', desc: 'Crédit acquisition immobilier MRE — taux 4.5%, durée 20 ans', tag: 'Éligible' },
        { name: 'Convention CNSS Maroc-Espagne', desc: 'Double affiliation maîtrisée — pas de double imposition IS', tag: 'Applicable' },
      ],
    },
    alternatives: [
      { business: 'Agence logistique import/export', score: 72, invest: '200–320k', roi: '22 mois',
        reason: 'Tanger Med = 1er port Méditerranée. Opportunité courtage douanier & transit.' },
      { business: 'Café haut de gamme / rooftop', score: 65, invest: '180–280k', roi: '20 mois',
        reason: 'Expats et cadres demandent des espaces premium. Aucun concept fort dans Boukhalef.' },
    ],
    avoid: [
      { business: 'Épicerie / supérette', score: 27, reason: 'Marché ultra-concurrentiel. Gestion quotidienne incompatible avec présence trimestrielle.' },
      { business: 'Restaurant standard',  score: 33, reason: '5 restaurants actifs. Sans présence constante du gérant, qualité non maîtrisable à distance.' },
    ],
    nearbyRadarProjects: [4, 6, 8, 18],
    radarBoost: TANGER_TECH,
  },

  // ── Brahim — Retraité · Agadir · Maison d'hôtes ──────────────────────────
  brahim: {
    kind: 'particulier',
    user: {
      name: 'Brahim', age: 58, profile: 'retraite', profileLabel: 'Retraité',
      country: null, city: 'Agadir', neighborhood: 'Hay Mohammadi',
      budget: 500000, budgetId: 'gt500', budgetBand: '+500K',
      availability: 'fulltime', availabilityLabel: 'Disponible',
    },
    neighborhood: {
      population: 28000, avgIncome: 6100, area: '2.2 km²', density: '12 727 / km²',
      center: [30.4183, -9.5982],
    },
    competitors: [
      { type: 'Café',      count: 7, lat: 35, lng: 40, names: ['Café Souss', 'Café Tagma', 'Café Bienvenue', 'Café Agadir'] },
      { type: 'Restaurant', count: 6, lat: 55, lng: 30, names: ['Snack Tigra', 'Restaurant Al Mina', 'Chez Driss', 'Pizzeria Agadir'] },
      { type: 'Épicerie',  count: 5, lat: 25, lng: 70, names: ['Épicerie Draa', 'Chez Bouchaib', 'Mini Marché Souss'] },
      { type: 'Hôtel',     count: 2, lat: 75, lng: 70, far: true, names: ['Palais des Roses', 'Hôtel Kenzi'] },
    ],
    topRecommendation: {
      business: 'Maison d\'hôtes / Riad boutique',
      score: 81,
      verdict: 'Opportunité premium',
      positives: [
        { label: 'Agadir : 4M touristes/an',                  weight: '+22', detail: 'demande hébergement boutique en forte hausse' },
        { label: 'TGV Marrakech–Agadir prévu 2028',           weight: '+16', detail: 'bonus Radar — +60% connexions attendues' },
        { label: 'Hydrogène vert Souss-Massa',                weight: '+10', detail: 'afflux ingénieurs & cadres techniques 2026–2029' },
        { label: 'Budget 500k+ pour acquisition + rénovation', weight: '+12', detail: 'riad 6–8 chambres — rentabilité touristique prouvée' },
        { label: 'Profil retraité = présence permanente',      weight: '+8',  detail: 'disponibilité totale = clé dans l\'hôtellerie boutique' },
      ],
      risks: [
        { label: 'Saisonnalité touristique',     weight: '-8', detail: 'basse saison été — diversifier avec séjours affaires' },
        { label: 'Concurrence hôtels 4 étoiles', weight: '-6', detail: 'se différencier sur l\'authenticité et l\'expérience locale' },
      ],
      finance: {
        investment: { low: 420000, high: 560000 },
        monthlyNet: { low: 28000, high: 48000 },
        roiMonths:  { low: 20, high: 30 },
      },
      admin: [
        { step: 'Classement hébergement touristique', time: '8 semaines', note: 'Ministère Tourisme — agrément maison d\'hôtes 4 étoiles' },
        { step: 'Registre du Commerce',               time: '2 semaines', note: 'CRI Souss-Massa' },
        { step: 'Affiliation FNIH Maroc',             time: '2 semaines', note: 'accès centrale de réservation nationale' },
        { step: 'Inscription Booking / Airbnb',       time: '1 semaine',  note: 'visibilité immédiate à l\'ouverture' },
      ],
      financing: [
        { name: 'Fonds Tourisme Solidaire', desc: 'Bonification 2% sur crédit hôtelier — durée 12 ans', tag: 'Éligible' },
        { name: 'CIH Hôtellerie', desc: 'Financement 60% acquisition + travaux — taux négocié', tag: 'Compatible' },
      ],
    },
    alternatives: [
      { business: 'Restaurant spécialités locales', score: 69, invest: '180–280k', roi: '16 mois',
        reason: 'Touristes cherchent authenticité. Cuisine soussie peu représentée en restauration formelle.' },
      { business: 'Agence excursions / randonnées', score: 64, invest: '60–100k', roi: '12 mois',
        reason: 'Connaissance terrain. Forte demande randonnées Atlas et Aït Benhaddou depuis Agadir.' },
    ],
    avoid: [
      { business: 'Hôtel standard 2 étoiles', score: 26, reason: 'Saturation totale. Taux d\'occupation < 40% hors juillet–août. Budget insuffisant vs concurrence.' },
      { business: 'Commerce import',          score: 30, reason: 'Guerre des prix avec grands distributeurs. Marge < 5%. Complexité douanière.' },
    ],
    nearbyRadarProjects: [3, 14],
    radarBoost: TGV_SUD,
  },

  // ── Leila — Diplômée Communication · Rabat Agdal · Agence social media ──
  leila: {
    kind: 'particulier',
    user: {
      name: 'Leila', age: 25, profile: 'diplome', profileLabel: 'Diplômée',
      country: null, city: 'Rabat', neighborhood: 'Agdal',
      budget: 15000, budgetId: 'lt30', budgetBand: '–30K',
      availability: 'fulltime', availabilityLabel: 'Temps plein', field: 'Communication',
    },
    neighborhood: {
      population: 22000, avgIncome: 9500, area: '1.8 km²', density: '12 222 / km²',
      center: [33.9823, -6.8598],
    },
    competitors: [
      { type: 'Café',      count: 9, lat: 30, lng: 35, names: ['Café Agdal', 'Le Diplomate', 'Café Rive G.', 'La Terrasse'] },
      { type: 'Restaurant', count: 7, lat: 55, lng: 25, names: ['Borj Eddar', "Le Bistro d'Agdal", 'Snack Diwan', 'Resto Grill'] },
      { type: 'Pharmacie', count: 3, lat: 20, lng: 65, names: ['Pharmacie Agdal', 'Pharmacie Hassan II', 'Pharmacie Souissi'] },
      { type: 'Épicerie',  count: 6, lat: 70, lng: 60, names: ['Épicerie Agdal', 'Chez Karima', 'Mini Marché Ahmed'] },
    ],
    topRecommendation: {
      business: 'Agence social media & contenu',
      score: 76,
      verdict: 'Opportunité haute cohérence',
      positives: [
        { label: 'Diplôme communication = levier direct',     weight: '+20', detail: 'pas de formation supplémentaire requise' },
        { label: 'Med-Tech Rabat à 3 km',                    weight: '+16', detail: 'bonus Radar — startups & PME tech en demande d\'image' },
        { label: 'Investissement quasi nul',                 weight: '+15', detail: 'laptop + connexion — démarrage sans emprunt' },
        { label: 'Agdal : concentration PME et ministères',  weight: '+10', detail: 'tissu clients B2B dans le quartier même' },
        { label: '72% des PME marocaines sans stratégie réseaux', weight: '+8', detail: 'marché non capté — TikTok/Instagram PME en forte hausse' },
      ],
      risks: [
        { label: 'Concurrence freelances',        weight: '-6', detail: 'différencier par spécialisation sectorielle (tech, santé, tourisme)' },
        { label: 'Revenus irréguliers au début',  weight: '-5', detail: 'prévoir 3 mois de trésorerie avant les premiers contrats' },
      ],
      finance: {
        investment: { low: 5000, high: 18000 },
        monthlyNet: { low: 8000, high: 15000 },
        roiMonths:  { low: 3, high: 6 },
      },
      admin: [
        { step: 'Statut Auto-entrepreneur',           time: '1 semaine', note: 'en ligne ae.gov.ma — plafond 500k DH CA' },
        { step: 'Profil LinkedIn + Portfolio',        time: '3 jours',   note: 'indispensable pour crédibilité B2B à Rabat' },
        { step: 'Affiliation CNSS auto-entrepreneur', time: '2 jours',   note: '6% cotisation sur CA déclaré' },
      ],
      financing: [
        { name: 'Intelaka — Jeunes', desc: 'Garantie CCG 80%, taux 2%, plafond 50k DH', tag: 'Éligible' },
        { name: 'Programme Maroc PME Femme', desc: 'Accompagnement gratuit + 50h de coaching', tag: 'Éligible' },
      ],
    },
    alternatives: [
      { business: 'Cours particuliers / tutorat lycéens', score: 68, invest: '0–5k', roi: '1 mois',
        reason: 'Agdal = familles aisées. Demande en anglais, maths, préparation bac. Démarrage instantané.' },
      { business: 'Assistant virtuel PME (services admin)', score: 63, invest: '0–8k', roi: '2 mois',
        reason: 'PME Agdal sous-équipées en back-office. Compétences gestion directement applicables.' },
    ],
    avoid: [
      { business: 'Café',              score: 22, reason: '9 cafés dans 800m. Investissement min 80k DH — incompatible avec capital 15k DH.' },
      { business: 'Boutique vêtements', score: 25, reason: 'Stock immobilisé + tendance e-commerce. 4 fermetures en 2023–2024 dans Agdal.' },
    ],
    nearbyRadarProjects: [19, 7],
    radarBoost: MEDTECH_RABAT,
  },

  // ── CRI Oriental — Institution · vue nationale ────────────────────────────
  cri: {
    kind: 'institution',
    user: {
      name: 'CRI Oriental',
      profile: 'institution',
      profileLabel: 'Centre Régional d\'Investissement',
      org: 'CRI Oriental · Oujda',
      region: 'Oriental',
      contact: 'Direction · M. Lahcen Ait Brahim',
    },
    regionFilter: 'Oriental',
    summary: { totalProjects: 8, totalAmount: 14300, ongoing: 5, planned: 3, jobsCreated: 18300 },
  },

  // ── CRI Casablanca-Settat — Institution · vue nationale ───────────────────
  cri_casa: {
    kind: 'institution',
    user: {
      name: 'CRI Casablanca-Settat',
      profile: 'institution',
      profileLabel: 'Centre Régional d\'Investissement',
      org: 'CRI Casablanca-Settat · Casablanca',
      region: 'Casablanca-Settat',
      contact: 'Direction · Mme Nadia El Ouali',
    },
    regionFilter: 'Casablanca-Settat',
    summary: { totalProjects: 4, totalAmount: 10700, ongoing: 2, planned: 2, jobsCreated: 12000 },
  },
};

window.SECTORS          = SECTORS;
window.NATIONAL_PROJECTS = NATIONAL_PROJECTS;
window.NADOR_WEST_MED   = NADOR_WEST_MED;
window.SCENARIOS        = SCENARIOS;
