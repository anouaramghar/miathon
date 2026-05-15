// InvestMap Maroc — Personalization engine
// Takes base scenario + form inputs → adapted scenario with adjusted score,
// dynamic risk/positive factors, profile-specific admin steps, and verdict.

const BUDGET_AMOUNTS = {
  'lt30':    20000,
  '30-150':  80000,
  '150-500': 300000,
  'gt500':   700000,
  'none':    80000,
};

const BUDGET_LABELS = {
  'lt30': '–30K', '30-150': '30–150K', '150-500': '150–500K', 'gt500': '+500K', 'none': 'Libre',
};

const PROFILE_LABELS = {
  mre: 'MRE', diplome: 'Diplômé(e)', femme: 'Femme entrepreneuse',
  fonctionnaire: 'Fonctionnaire', retraite: 'Retraité(e)', autre: 'Résident(e)',
};

// ─── Scenario selector ────────────────────────────────────────────────────────

function selectScenarioKey(form) {
  const { profile, city, budget } = form;

  if (profile === 'institution') {
    return city === 'Casablanca-Settat' ? 'cri_casa' : 'cri';
  }
  if (profile === 'mre') {
    return city === 'Tanger' ? 'samira' : 'hassan';
  }
  if (profile === 'retraite') {
    return 'brahim';
  }
  if (profile === 'fonctionnaire') {
    if (city === 'Tanger') return 'samira';
    if (city === 'Rabat')  return 'leila';
    if (city === 'Agadir') return 'brahim';
    return 'omar';
  }
  if (profile === 'diplome' || profile === 'femme') {
    return city === 'Rabat' ? 'leila' : 'fatima';
  }
  // 'autre' — route by city then budget
  if (city === 'Casablanca') return 'omar';
  if (city === 'Tanger')     return 'samira';
  if (city === 'Agadir')     return 'brahim';
  if (city === 'Rabat')      return 'leila';
  if (budget === 'gt500' || budget === '150-500') return 'hassan';
  return 'fatima';
}

// ─── Core personalization engine ──────────────────────────────────────────────

function personalizeScenario(base, form) {
  if (!base || base.kind !== 'particulier') return base;

  // Deep clone — never mutate the original data
  const s   = JSON.parse(JSON.stringify(base));
  const rec = s.topRecommendation;

  const budgetNum  = BUDGET_AMOUNTS[form.budget] || 80000;
  const investLow  = rec.finance.investment.low;
  const investHigh = rec.finance.investment.high;
  const profile    = form.profile || s.user.profile;
  const city       = form.city    || s.user.city;
  const coverage   = budgetNum / investLow;

  let scoreDelta   = 0;
  const extraRisks = [];
  const extraPos   = [];

  // ── 1. Budget vs investment match ─────────────────────────────────────────

  if (coverage < 0.5) {
    scoreDelta -= 18;
    extraRisks.push({
      label: 'Budget déclaré insuffisant',
      weight: '-18',
      detail: `Ce business nécessite ${(investLow/1000).toFixed(0)}–${(investHigh/1000).toFixed(0)}k DH minimum. Financement complémentaire (Intelaka / CCG) indispensable.`,
    });
    rec.finance.roiMonths.low  = Math.round(rec.finance.roiMonths.low  * 1.4);
    rec.finance.roiMonths.high = Math.round(rec.finance.roiMonths.high * 1.4);
  } else if (coverage < 0.8) {
    scoreDelta -= 9;
    extraRisks.push({
      label: 'Budget légèrement en dessous du seuil',
      weight: '-9',
      detail: `Investissement estimé ${(investLow/1000).toFixed(0)}–${(investHigh/1000).toFixed(0)}k DH — un prêt partiel est recommandé pour ne pas être à court.`,
    });
    rec.finance.roiMonths.low  = Math.round(rec.finance.roiMonths.low  * 1.15);
    rec.finance.roiMonths.high = Math.round(rec.finance.roiMonths.high * 1.15);
  } else if (coverage >= 1.0 && coverage < 1.5) {
    scoreDelta += 3;
    extraPos.push({
      label: 'Budget parfaitement calibré',
      weight: '+3',
      detail: 'Le budget déclaré couvre la fourchette recommandée — démarrage sans pression financière.',
    });
  } else if (coverage >= 1.5) {
    scoreDelta += 6;
    extraPos.push({
      label: 'Capacité financière confortable',
      weight: '+6',
      detail: 'Budget largement au-dessus du seuil — marge pour imprévus et phase de croissance sécurisée.',
    });
  }

  // ── 2. Profile–business coherence ────────────────────────────────────────

  if (profile === 'retraite' && (rec.business.toLowerCase().includes('digital') || rec.business.toLowerCase().includes('social'))) {
    scoreDelta -= 6;
    extraRisks.push({
      label: 'Courbe d\'apprentissage digital',
      weight: '-6',
      detail: 'Business fortement digital — prévoir un associé spécialisé ou une montée en compétences dédiée.',
    });
  }

  if ((profile === 'diplome' || profile === 'femme') && s.user.field) {
    const field = s.user.field.toLowerCase();
    const biz   = rec.business.toLowerCase();
    const match =
      (biz.includes('social') || biz.includes('contenu')) && field.includes('comm') ||
      (biz.includes('papeterie') || biz.includes('photocopie')) && (field.includes('gestion') || field.includes('commerce')) ||
      biz.includes('coworking') && field.includes('finance') ||
      biz.includes('garderie') && field.includes('éducation');
    if (match) {
      scoreDelta += 6;
      extraPos.push({
        label: `Formation ${s.user.field} directement applicable`,
        weight: '+6',
        detail: 'Ton diplôme couvre les compétences opérationnelles de ce business — aucune formation complémentaire requise.',
      });
    }
  }

  if (profile === 'fonctionnaire') {
    scoreDelta += 4;
    extraPos.push({
      label: 'Réseau fonctionnaire = premiers clients B2B',
      weight: '+4',
      detail: 'Crédibilité institutionnelle et réseau professionnel immédiatement exploitable comme premier portefeuille clients.',
    });
  }

  if (profile === 'retraite') {
    scoreDelta += 3;
    extraPos.push({
      label: 'Retraité : disponibilité totale + expérience',
      weight: '+3',
      detail: 'Présence permanente + années d\'expérience = avantage décisif sur les nouveaux entrants.',
    });
  }

  // ── 3. City mismatch ─────────────────────────────────────────────────────

  if (form.city && form.city !== s.user.city) {
    scoreDelta -= 4;
    extraRisks.push({
      label: `Analyse calibrée sur ${s.user.city}`,
      weight: '-4',
      detail: `Données de concurrence et de demande basées sur ${s.user.city}. Données de ${form.city} peuvent diverger — analyse complémentaire recommandée.`,
    });
    s.user.city = form.city;
  }

  // ── 4. Neighborhood specificity ──────────────────────────────────────────

  if (form.neighborhood && form.neighborhood !== s.user.neighborhood) {
    s.user.neighborhood = form.neighborhood;
    scoreDelta += 1;
    extraPos.push({
      label: `Analyse affinée : ${form.neighborhood}`,
      weight: '+1',
      detail: 'Quartier précisé — recommandation calibrée sur ta zone exacte plutôt que sur l\'ensemble de la ville.',
    });
  }

  // ── 5. Apply score delta and update verdict ───────────────────────────────

  const baseScore = rec.score;
  rec.score = Math.min(98, Math.max(18, baseScore + scoreDelta));

  if      (rec.score >= 85) rec.verdict = 'Très forte opportunité';
  else if (rec.score >= 72) rec.verdict = 'Forte opportunité';
  else if (rec.score >= 58) rec.verdict = 'Opportunité solide';
  else if (rec.score >= 42) rec.verdict = 'Opportunité risquée';
  else                      rec.verdict = 'Déconseillé dans ce contexte';

  // Inject factors — critical risks first, contextual positives last
  rec.risks     = [...extraRisks, ...rec.risks];
  rec.positives = [...rec.positives, ...extraPos];

  // ── 6. Profile-specific admin steps ──────────────────────────────────────

  const steps = rec.admin;
  if (profile === 'mre' && !steps.some(a => a.step.includes('DRI'))) {
    steps.unshift({ step: 'Déclaration DRI à la banque', time: '30 jours', note: 'Obligatoire MRE — Office des Changes avant tout investissement' });
  }
  if ((profile === 'diplome' || profile === 'femme') && !steps.some(a => a.step.toLowerCase().includes('intelaka'))) {
    steps.push({ step: 'Dossier Intelaka (CCG)', time: '2 semaines', note: 'Garantie 80% — éligible profil jeune entrepreneur' });
  }
  if (profile === 'retraite' && !steps.some(a => a.step.toLowerCase().includes('pension'))) {
    steps.push({ step: 'Vérification cumul pension + revenus d\'activité', time: '1 semaine', note: 'CMR / RCAR — cumul autorisé sous conditions' });
  }
  if (profile === 'fonctionnaire' && !steps.some(a => a.step.toLowerCase().includes('autorisation'))) {
    steps.push({ step: 'Autorisation cumul emploi + activité commerciale', time: '3 semaines', note: 'Requise pour tout fonctionnaire — Ministère employeur concerné' });
  }

  // ── 7. Update user fields from form ──────────────────────────────────────

  s.user.profile = profile;
  if (form.budget) {
    s.user.budgetId   = form.budget;
    s.user.budgetBand = BUDGET_LABELS[form.budget] || s.user.budgetBand;
    s.user.budget     = budgetNum;
  }

  // ── 8. Personalization metadata ───────────────────────────────────────────

  s._personalized = true;
  s._scoreDelta   = scoreDelta;
  s._baseScore    = baseScore;

  return s;
}

// ─── Project → investor scenario mapping (for CRI "Voir opportunités" button) ─

const PROJECT_TO_SCENARIO = {
  1: 'hassan', 9: 'hassan', 10: 'hassan', 15: 'hassan',   // Oriental
  4: 'samira', 6: 'samira', 8: 'samira',  18: 'samira',   // Tanger
  11: 'omar',  12: 'omar',  20: 'omar',                   // Casablanca
  19: 'leila', 7: 'leila',                                 // Rabat
  3: 'brahim', 14: 'brahim', 5: 'brahim', 17: 'brahim',  // Agadir / Sud
  2: 'fatima', 16: 'fatima',                               // Fès-Meknès / Béni Mellal
  13: 'brahim',                                            // Dakhla
};

// ─── Loading screen agent builder ─────────────────────────────────────────────
// Generates context-aware agent messages from a personalized scenario

function buildLoadingAgents(scenario) {
  if (!scenario || !scenario.topRecommendation) return null;

  const { topRecommendation: rec, user, competitors = [], radarBoost, alternatives = [] } = scenario;

  const city    = user.city || 'Berkane';
  const hood    = user.neighborhood || 'le quartier';
  const profLbl = PROFILE_LABELS[user.profile] || 'Investisseur';
  const budget  = user.budgetBand || '?';

  const nearComps = competitors.filter(c => !c.far && c.count > 0);
  const compSummary = nearComps.length
    ? nearComps.slice(0, 2).map(c => `${c.type} ×${c.count}`).join(' · ')
    : 'Zone peu concurrentielle';
  const totalComps = competitors.reduce((s, c) => s + (c.count || 0), 0);

  const altLine = alternatives.slice(0, 2).map(a => `${a.business.split(' ')[0]} ${a.score}`).join(' · ');
  const adminLine = (rec.admin || []).slice(0, 3).map(a => a.step.split(' ')[0]).join(' → ');
  const topPositive = rec.positives && rec.positives[0] ? rec.positives[0].detail : 'Signal de demande analysé';

  const baseScore  = scenario._baseScore || rec.score;
  const delta      = scenario._scoreDelta || 0;
  const finalScore = rec.score;

  const invest = [
    {
      id: 1, name: 'Location Intelligence',
      task: `Cartographie des commerces · ${city} · ${hood} · rayon 0.5 / 1 / 2 km…`,
      done: `${compSummary} · ${totalComps} établissements scannés dans la zone`,
    },
    {
      id: 2, name: 'Market Demand',
      task: `Analyse demande Google + reviews locales · "${rec.business}" · ${city}…`,
      done: topPositive,
    },
    {
      id: 3, name: 'Business Matching',
      task: `Matching profil ${profLbl} · budget ${budget} · opportunités ${city}…`,
      done: `${rec.business} ${finalScore}/100${altLine ? ' · ' + altLine : ''}`,
    },
    {
      id: 4, name: 'Administrative Navigator',
      task: `Démarches réglementaires · profil ${profLbl} · ${city}…`,
      done: adminLine || 'Démarches identifiées et séquencées',
    },
  ];

  const radar = [
    {
      id: 6, name: 'Data Collector',
      task: `Scraping CRI · AMDIE · presse économique · région de ${city}…`,
      done: radarBoost
        ? `${radarBoost.shortName} détecté · ${radarBoost.amount} · ${radarBoost.jobs}`
        : `847 projets indexés · aucun projet Radar direct dans ta zone`,
    },
    {
      id: 7, name: 'Project Analyzer (LLM)',
      task: `Extraction LLM — secteur, montant, phase, emplois, impact local…`,
      done: radarBoost
        ? `${radarBoost.name} · ${radarBoost.amount} · Phase ${radarBoost.progress}% · ${radarBoost.jobs}`
        : `Projets classés par impact local · aucun boost Radar direct`,
    },
  ];

  const bridge = {
    id: 5, name: 'Success Predictor',
    task: `Calcul probabilité · intégration Radar · calibrage profil ${profLbl}…`,
    done: radarBoost && delta !== 0
      ? `${rec.business} · ${city} : ${baseScore} (base) ⚡ Radar & profil → ${finalScore}/100 · ${rec.verdict}`
      : radarBoost
      ? `${rec.business} · ${city} : ${baseScore} (base) ⚡ Radar → ${finalScore}/100 · ${rec.verdict}`
      : `${rec.business} · ${city} : ${finalScore}/100 · ${rec.verdict}`,
  };

  return { invest, radar, bridge };
}

// ─── Questionnaire intelligence ───────────────────────────────────────────────

const PROFILE_HINTS = {
  mre: {
    budget: '150–500K DH',
    businesses: ['Pharmacie', 'Franchise', 'Immobilier locatif'],
    note: 'Financement MDM Tamwil : jusqu\'à 50% du projet · taux préférentiel 4.5%',
  },
  diplome: {
    budget: '–30K DH',
    businesses: ['Papeterie', 'Services', 'Agence en ligne'],
    note: 'Intelaka : garantie CCG 80% · taux 2% · idéal jeune entrepreneur',
  },
  femme: {
    budget: '–30K DH',
    businesses: ['Beauté', 'Formation', 'E-commerce'],
    note: 'Programme Maroc PME Femme : accompagnement + subvention équipement',
  },
  fonctionnaire: {
    budget: '30–150K DH',
    businesses: ['Coworking', 'Franchise', 'Location'],
    note: 'Autorisation cumul emploi + activité commerciale requise (3 semaines)',
  },
  retraite: {
    budget: '150K+ DH',
    businesses: ['Hôtel / Riad', 'Restaurant', 'Commerce'],
    note: 'Cumul pension + revenus : vérification CMR/RCAR conseillée',
  },
  autre: {
    budget: '30–150K DH',
    businesses: ['Commerce de proximité', 'Services locaux'],
    note: 'Analyse adaptée à votre situation et à votre ville cible',
  },
};

const CITY_RADAR = {
  Berkane:    { count: 4, featured: 'Nador West Med · 10 Mds DH · En cours 65%' },
  Casablanca: { count: 3, featured: 'Hub Aéronautique Mohammed V · 2,1 Mds DH' },
  Tanger:     { count: 4, featured: 'Smart City Tanger Tech · 5,8 Mds DH' },
  Rabat:      { count: 2, featured: 'Campus Med-Tech Rabat · 1,8 Md DH · En cours 28%' },
  Agadir:     { count: 2, featured: 'TGV Marrakech–Agadir · 35 Mds DH' },
};

function getBudgetWarning(profile, budget) {
  if (!profile || !budget) return null;
  if (profile === 'mre' && (budget === 'lt30' || budget === '30-150')) {
    return 'Budget typique MRE : 150–500k DH. Le financement MDM Tamwil peut compléter jusqu\'à 50% du projet.';
  }
  if (profile === 'retraite' && budget === 'lt30') {
    return 'Budget de –30k DH limité pour un investissement retraite. Un capital plus important optimise le retour sur investissement.';
  }
  if ((profile === 'diplome' || profile === 'femme') && (budget === 'gt500' || budget === '150-500')) {
    return 'Budget élevé pour ce profil — la recommandation sera orientée vers un business à forte marge ou immobilier.';
  }
  if (profile === 'fonctionnaire' && budget === 'gt500') {
    return 'Budget très élevé pour un fonctionnaire — vérifier les règles de cumul et la déclaration de patrimoine.';
  }
  return null;
}

window.selectScenarioKey   = selectScenarioKey;
window.personalizeScenario = personalizeScenario;
window.buildLoadingAgents  = buildLoadingAgents;
window.PROJECT_TO_SCENARIO = PROJECT_TO_SCENARIO;
window.PROFILE_HINTS       = PROFILE_HINTS;
window.CITY_RADAR          = CITY_RADAR;
window.getBudgetWarning    = getBudgetWarning;
