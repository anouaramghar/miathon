// InvestMap Maroc — Écran 2: Questionnaire intelligent
// 3 questions max — invisible bifurcation based on profile (CRI/Banque → national radar)

const PROFILES = [
  { id: 'mre',           name: 'MRE',                        kind: 'Particulier · à l\'étranger',  isInstitution: false },
  { id: 'diplome',       name: 'Diplômé(e)',                 kind: 'Particulier · jeune',           isInstitution: false },
  { id: 'femme',         name: 'Femme entrepreneure',        kind: 'Particulier · femme',           isInstitution: false },
  { id: 'fonctionnaire', name: 'Fonctionnaire',              kind: 'Particulier · revenu second.',  isInstitution: false },
  { id: 'retraite',      name: 'Retraité(e)',                kind: 'Particulier · capital acquis',  isInstitution: false },
  { id: 'autre',         name: 'Autre / Résident(e)',        kind: 'Particulier',                   isInstitution: false },
  { id: 'institution',   name: 'CRI · Banque · Institution', kind: 'Pro · suivi macro',             isInstitution: true  },
];

const CITIES = ['Berkane', 'Casablanca', 'Tanger', 'Rabat', 'Agadir', 'Oujda', 'Marrakech'];

const ENABLED_CITIES = new Set(['Berkane', 'Casablanca', 'Tanger', 'Rabat', 'Agadir']);

const INSTITUTION_REGIONS = [
  'Oriental', 'Casablanca-Settat', 'Tanger-Tétouan-Al Hoceïma', 'Rabat-Salé-Kénitra',
  'Souss-Massa', 'Fès-Meknès', 'Marrakech-Safi', 'National',
];

const NEIGHBORHOODS = {
  Berkane:    ['Hay Al Massira', 'Centre-ville', 'Hay Salam', 'Boudir'],
  Casablanca: ['Maarif', 'Ain Diab', 'Sidi Moumen', 'Bourgogne'],
  Tanger:     ['Boukhalef', 'Malabata', 'Centre', 'Hay Saddam'],
  Rabat:      ['Agdal', 'Hassan', 'Hay Riad', 'Souissi'],
  Agadir:     ['Hay Mohammadi', 'Talborjt', 'Nouvelle Ville', 'Anza'],
  Oujda:      ['Hay El Qods', 'Sidi Yahya', 'Lazaret'],
  Marrakech:  ['Guéliz', 'Médina', 'Hivernage'],
};

const BUDGET_BANDS = [
  { id: 'lt30',    v: '–30K',     l: 'jeune entrepreneur' },
  { id: '30-150',  v: '30–150K',  l: 'standard' },
  { id: '150-500', v: '150–500K', l: 'MRE · investisseur' },
  { id: 'gt500',   v: '+500K',    l: 'institutionnel' },
  { id: 'none',    v: 'Libre',    l: 'pas fixé' },
];

function Questionnaire({ form, setForm, onSubmit, onQuickFill, onBack }) {
  const update = (k, v) => setForm({ ...form, [k]: v });
  const selectedProfile = PROFILES.find(p => p.id === form.profile);
  const isInstitution   = selectedProfile?.isInstitution;

  const profileHint = form.profile && !isInstitution ? (window.PROFILE_HINTS || {})[form.profile] : null;
  const cityRadar   = form.city && !isInstitution ? (window.CITY_RADAR || {})[form.city] : null;
  const budgetWarn  = window.getBudgetWarning ? window.getBudgetWarning(form.profile, form.budget) : null;

  const canSubmit = form.profile && form.city && (isInstitution || form.budget);

  // H1 — submit loading state
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    // Brief delay to show feedback before parent transitions to loading
    setTimeout(() => onSubmit(), 180);
  };

  const cityList = isInstitution ? INSTITUTION_REGIONS : CITIES;

  const switchToMacro = () => setForm({ ...form, profile: 'institution', city: '', budget: '' });
  const switchToMicro = () => setForm({ ...form, profile: '', city: '', budget: '' });

  // H7 — keyboard shortcuts: Enter to submit, Escape to go back
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Enter' && canSubmit && !submitting) handleSubmit();
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [canSubmit, submitting, form]);

  return (
    <div className="questionnaire">
      <div className="quest-inner">
        <div className="quest-head">
          <div className="step-pill">
            {isInstitution ? 'Étape 1 / 1 · 1 question · ~15s' : 'Étape 1 / 1 · 3 questions · ~60s'}
          </div>
          <h2>Parle-nous de <em>toi</em>.</h2>
          <p>Choisis ton mode, réponds aux questions — le dashboard s'adapte automatiquement.</p>

          {/* H10 — contextual trust tip */}
          <p className="quest-trust-tip">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ verticalAlign: '-1px', marginRight: 5, opacity: 0.6 }}>
              <path d="M8 1l1.5 3.5L13 5l-2.5 2.4.6 3.6L8 9.5l-3.1 1.5.6-3.6L3 5l3.5-.5L8 1z"/>
            </svg>
            Aucun compte requis · données anonymisées · résultat immédiat · 100% gratuit
          </p>
        </div>

        {/* Mode toggle — Micro / Macro */}
        <div className="mode-toggle">
          <button
            type="button"
            className={`mode-card ${!isInstitution ? 'active' : ''}`}
            onClick={switchToMicro}>
            <div className="mode-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
              </svg>
            </div>
            <div className="mode-body">
              <div className="mode-title">Micro · Investisseur</div>
              <div className="mode-desc">Opportunités locales · quartier · budget · démarches</div>
            </div>
            <div className="mode-check">{!isInstitution && '✓'}</div>
          </button>
          <button
            type="button"
            className={`mode-card macro ${isInstitution ? 'active' : ''}`}
            onClick={switchToMacro}>
            <div className="mode-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 3a15.3 15.3 0 010 18M3 12h18"/>
              </svg>
            </div>
            <div className="mode-body">
              <div className="mode-title">Macro · Institution</div>
              <div className="mode-desc">Radar national · CRI · Banque · suivi projets</div>
            </div>
            <div className="mode-check">{isInstitution && '✓'}</div>
          </button>
        </div>

        {/* H6 — demo shortcuts always visible (no <details> gate) */}
        <div className="demo-shortcuts demo-shortcuts-open">
          <div className="demo-shortcuts-label">
            Scénarios pré-remplis · démo Miathon
          </div>
          <div className="quick">
            <div className="row">
              <button className="btn ghost" onClick={() => onQuickFill('hassan')}>→ Hassan · MRE Berkane · données réelles</button>
            </div>
            <div className="row">
              <button className="btn ghost" onClick={() => onQuickFill('cri')}>→ CRI Oriental · radar</button>
              <button className="btn ghost" onClick={() => onQuickFill('cri_casa')}>→ CRI Casablanca · radar</button>
            </div>
          </div>
        </div>

        {/* Q1 — Profile (Micro mode only) */}
        {!isInstitution && (
          <div className={`q-block ${form.profile ? '' : 'active'}`}>
            <div className="q-num">Question 1 / 3</div>
            <h3>Je suis…</h3>
            <div className="profile-grid">
              {PROFILES.filter(p => !p.isInstitution).map(p => (
                <button key={p.id} type="button"
                  className={`profile-card ${form.profile === p.id ? 'active' : ''}`}
                  onClick={() => update('profile', p.id)}>
                  <span className="kind">{p.kind}</span>
                  <span className="name">{p.name}</span>
                </button>
              ))}
            </div>

            {profileHint && (
              <div className="profile-hint">
                <div className="profile-hint-row">
                  <span className="profile-hint-label">Budget typique</span>
                  <span className="profile-hint-val">{profileHint.budget}</span>
                </div>
                <div className="profile-hint-row">
                  <span className="profile-hint-label">Secteurs clés</span>
                  <span className="profile-hint-val">{profileHint.businesses.join(' · ')}</span>
                </div>
                {profileHint.note && (
                  <div className="profile-hint-note">{profileHint.note}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Q2 — Ville / Région */}
        <div className={`q-block ${form.profile && !form.city ? 'active' : ''}`}>
          <div className="q-num">{isInstitution ? 'Question 1 / 1' : 'Question 2 / 3'}</div>
          <h3>{isInstitution ? 'Région à surveiller' : 'Ma ville cible'}</h3>
          {isInstitution ? (
            <p className="sub">
              Tu verras tous les projets nationaux — choisis ta région pour le filtrage par défaut.
            </p>
          ) : (
            <p className="sub">
              Données disponibles sur Berkane, Casablanca, Tanger, Rabat et Agadir.
            </p>
          )}
          <div className="chips">
            {cityList.map(c => {
              const enabled = isInstitution || ENABLED_CITIES.has(c);
              return (
                <button key={c} type="button"
                  className={`chip ${form.city === c ? 'active' : ''}`}
                  onClick={() => enabled ? update('city', c) : null}
                  disabled={!enabled}
                  aria-disabled={!enabled}>
                  {c}
                  {!enabled && <span className="icon">bientôt</span>}
                </button>
              );
            })}
          </div>

          {/* Neighborhood selector — individual only */}
          {!isInstitution && form.city && (
            <div style={{ marginTop: 14 }}>
              <div className="field-label" style={{ marginBottom: 6 }}>
                <span>Quartier (optionnel)</span>
              </div>
              <select className="text" value={form.neighborhood}
                onChange={e => update('neighborhood', e.target.value)}>
                {(NEIGHBORHOODS[form.city] || []).map(n => <option key={n}>{n}</option>)}
              </select>
            </div>
          )}

          {cityRadar && (
            <div className="city-hint">
              <span className="city-hint-dot"/>
              <span className="city-hint-count">{cityRadar.count} projets Radar</span>
              <span className="city-hint-sep">·</span>
              <span className="city-hint-feat">Projet phare : {cityRadar.featured}</span>
            </div>
          )}
        </div>

        {/* Q3 — Budget (hidden for institutions) */}
        {!isInstitution && (
          <div className={`q-block ${form.profile && form.city && !form.budget ? 'active' : ''}`}>
            <div className="q-num">Question 3 / 3</div>
            <h3>Mon budget disponible</h3>
            <p className="sub">Une fourchette suffit — on s'adapte aux financements éligibles (Intelaka, MDM Tamwil, etc.)</p>
            <div className="budget-bands">
              {BUDGET_BANDS.map(b => (
                <button key={b.id} type="button"
                  className={`band ${form.budget === b.id ? 'active' : ''}`}
                  onClick={() => update('budget', b.id)}>
                  <div className="v">{b.v}</div>
                  <div className="l">{b.l}</div>
                </button>
              ))}
            </div>
            {budgetWarn && (
              <div className="budget-warning">{budgetWarn}</div>
            )}
          </div>
        )}

        {isInstitution && (
          <div className="q-block" style={{ background: 'var(--bg-2)', borderStyle: 'dashed' }}>
            <div className="q-num" style={{ background: 'var(--bg-2)' }}>Profil institution détecté</div>
            <h3>Pas de question budget.</h3>
            <p className="sub" style={{ marginTop: -4 }}>
              Ton dashboard sera adapté au suivi macro : carte nationale, filtres par secteur,
              Radar des grands projets (presse nationale). Aucune question supplémentaire.
            </p>
          </div>
        )}

        <div className="quest-submit">
          <button className="btn ghost" onClick={onBack} disabled={submitting}>← Retour</button>
          {/* H1 — submit button shows loading feedback before transition */}
          <button className="btn terra" disabled={!canSubmit || submitting} onClick={handleSubmit}>
            {submitting ? (
              <>
                <span className="spinner" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)', marginRight: 8 }}/>
                Analyse en cours…
              </>
            ) : (
              <>
                Analyser mon opportunité
                <svg className="arrow" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* H7 — keyboard hint */}
        {canSubmit && !submitting && (
          <p className="quest-kbd-hint">Appuyer sur <kbd>Entrée</kbd> pour lancer l'analyse</p>
        )}
      </div>
    </div>
  );
}

window.Questionnaire = Questionnaire;
window.PROFILES = PROFILES;
