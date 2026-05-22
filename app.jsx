// InvestMap Maroc — App shell (v3.0)
// Flow: Landing → Questionnaire → Loading → Dashboard → Rapport
// Institution profile bifurcates Dashboard → CRI view (Radar national)

const { useState, useRef } = React;

// Maps investor city → best matching CRI scenario key
const CITY_TO_CRI = {
  Berkane:    'cri',
  Casablanca: 'cri_casa',
  Tanger:     'cri',
  Rabat:      'cri',
  Agadir:     'cri',
};

const DEFAULT_FORM = {
  profile: '',
  city: '',
  neighborhood: '',
  budget: '',
};

// Hydrate the polished static scenario with the REAL agent outputs from the
// live backend pipeline. We keep the static base for fields the agents don't
// produce (map competitor positions, demographics, alternatives, financing)
// and overlay only the genuinely AI-computed fields. Shapes match 1:1.
function hydrateWithLiveData(base, real) {
  if (!base || base.kind === 'institution') return base;
  const rtop = real && real.topRecommendation;
  if (!rtop || !rtop.business) return base;
  const btop = base.topRecommendation || {};
  return {
    ...base,
    topRecommendation: {
      ...btop,
      business:  rtop.business || btop.business,
      score:     (rtop.score != null) ? rtop.score : btop.score,
      verdict:   rtop.verdict || btop.verdict,
      positives: (rtop.positives && rtop.positives.length) ? rtop.positives : btop.positives,
      risks:     (rtop.risks && rtop.risks.length) ? rtop.risks : btop.risks,
      finance:   rtop.finance || btop.finance,
      admin:     (real.admin_steps && real.admin_steps.length) ? real.admin_steps : btop.admin,
    },
    _live: true,
  };
}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "loadingDuration": 8
}/*EDITMODE-END*/;

function App() {
  // phase: 'landing' | 'questionnaire' | 'loading' | 'dashboard' | 'results' | 'cri'
  const [phase, setPhase]             = useState('landing');
  const [form, setForm]               = useState(DEFAULT_FORM);
  const [scenarioKey, setScenarioKey] = useState('hassan');
  const [scenario, setScenario]       = useState(null); // personalized scenario
  const [jobId, setJobId]             = useState(null);
  const [t, setTweak]                 = useTweaks(TWEAK_DEFAULTS);
  const prevInvestKey                 = useRef('hassan'); // remembers last investor scenario across macro switch

  // Current active scenario — personalized if available, else raw
  const activeScenario = scenario || window.SCENARIOS[scenarioKey];

  // H9 — try/catch around personalization; falls back to raw scenario on error
  const submit = () => {
    try {
      const key         = window.selectScenarioKey(form);
      const base        = window.SCENARIOS[key];
      const personalized = window.personalizeScenario ? window.personalizeScenario(base, form) : base;
      setScenarioKey(key);
      setScenario(personalized);
    } catch (e) {
      console.warn('[submit] personalization failed, using raw scenario', e);
      const key = window.selectScenarioKey ? window.selectScenarioKey(form) : 'hassan';
      setScenarioKey(key);
      setScenario(window.SCENARIOS[key]);
    }
    setJobId(null);
    setPhase('loading');
    // Fire-and-forget backend call — SSE streams agent events to loading screen
    fetch('http://localhost:8000/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(r => r.json())
      .then(d => { if (d.job_id) setJobId(d.job_id); })
      .catch(() => console.warn('[investmap] backend not running — demo mode'));
  };

  const onLoadingDone = () => {
    setPhase(activeScenario.kind === 'institution' ? 'cri' : 'dashboard');
  };

  // SSE 'complete' → overlay real agent output onto the current scenario.
  // Dashboard reads activeScenario, so this updates the view live.
  const onLiveResult = (real) => {
    setScenario(prev => {
      const fallback = window.SCENARIOS[scenarioKey] || window.SCENARIOS.hassan;
      const merged = hydrateWithLiveData(prev || fallback, real);
      if (merged && merged._live) console.log('[InvestMap] dashboard hydrated with real AI data');
      return merged;
    });
  };

  const quickFill = (key) => {
    const s = window.SCENARIOS[key];
    setScenarioKey(key);
    setScenario(s); // no personalization for quick demos — show raw data
    if (s.kind === 'institution') {
      setForm({ profile: 'institution', city: s.user.region || 'Oriental', neighborhood: '', budget: '' });
    } else {
      setForm({
        profile:      s.user.profile,
        city:         s.user.city,
        neighborhood: s.user.neighborhood || '',
        budget:       s.user.budgetId || '30-150',
      });
    }
  };

  const goToScenario = (key) => {
    quickFill(key);
    setPhase('loading');
  };

  // H3 — edit criteria: go back to questionnaire with existing form data intact
  const editCriteria = () => setPhase('questionnaire');

  // Topbar Micro ↔ Macro switcher
  const switchToMacro = () => {
    prevInvestKey.current = scenarioKey;
    const city   = activeScenario?.user?.city;
    const criKey = CITY_TO_CRI[city] || 'cri';
    setScenarioKey(criKey);
    setScenario(window.SCENARIOS[criKey]);
    setPhase('cri');
  };

  const switchToMicro = () => {
    const key = prevInvestKey.current;
    setScenarioKey(key);
    setScenario(window.SCENARIOS[key]);
    setPhase('dashboard');
  };

  // CRI → Invest: navigate directly to the investor scenario for a given project
  const handleCRIViewInvest = (projectId) => {
    const key  = (window.PROJECT_TO_SCENARIO || {})[projectId] || 'hassan';
    const base = window.SCENARIOS[key];
    setScenarioKey(key);
    setScenario(base);
    setPhase('dashboard');
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <img src="logo.png?v=2" alt="Logo InvestMap" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
          InvestMap <span className="it">Maroc</span>
        </div>
        <div className="topbar-right">
          {(phase === 'dashboard' || phase === 'results' || phase === 'cri') && (
              <span className="trust-strip">
                <span className="trust-dot"/>
                Analyse IA en temps réel · MAJ il y a 7 min
              </span>
          )}
          {(phase === 'dashboard' || phase === 'results' || phase === 'cri') && (
            <div className="view-switcher">
              <button
                className={`vs-btn ${phase !== 'cri' ? 'active' : ''}`}
                onClick={switchToMicro}
                title="Vue investisseur · opportunités locales">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="7" cy="7" r="4.5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/></svg>
                Micro
              </button>
              <button
                className={`vs-btn ${phase === 'cri' ? 'active' : ''}`}
                onClick={switchToMacro}
                title="Vue institution · radar national">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="8" cy="8" r="6"/><path d="M8 2a10.2 10.2 0 010 12M2 8h12"/></svg>
                Macro
              </button>
            </div>
          )}
          {/* H2 — user-friendly tag, no tech jargon */}
          <span className="pill"><span className="dot"/> IA · données temps réel</span>
          <span>v3.0 · Miathon 2026</span>
          <span>ENIAD · UMP</span>
        </div>
      </header>

      {phase === 'landing' && (
        <Landing onCTA={() => setPhase('questionnaire')} onQuickDemo={goToScenario}/>
      )}

      {phase === 'questionnaire' && (
        <Questionnaire
          form={form} setForm={setForm}
          onSubmit={submit}
          onQuickFill={quickFill}
          onBack={() => setPhase('landing')}
        />
      )}

      {phase === 'loading' && (
        <LoadingScreen
          duration={t.loadingDuration * 1000}
          onDone={onLoadingDone}
          scenario={activeScenario}
          jobId={jobId}
          onResult={onLiveResult}
        />
      )}

      {phase === 'dashboard' && (
        <Dashboard
          scenario={activeScenario}
          onSeeReport={() => setPhase('results')}
          onSeeRadar={() => setPhase('results')}
          onRestart={() => setPhase('landing')}
          onEditCriteria={editCriteria}
        />
      )}

      {phase === 'results' && (
        <ResultsScreen
          scenario={activeScenario}
          onRestart={() => setPhase('landing')}
          onEditCriteria={editCriteria}
        />
      )}

      {phase === 'cri' && (
        <CRIDashboard
          scenario={activeScenario}
          onRestart={() => setPhase('landing')}
          onViewInvest={handleCRIViewInvest}
        />
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Navigation">
          <TweakRadio
            label="Étape"
            options={[
              { label: 'Landing',  value: 'landing' },
              { label: 'Quest.',   value: 'questionnaire' },
              { label: 'Loading',  value: 'loading' },
              { label: 'Dash.',    value: 'dashboard' },
              { label: 'Report',   value: 'results' },
              { label: 'CRI',      value: 'cri' },
            ]}
            value={phase}
            onChange={v => setPhase(v)}
          />
          <TweakSlider label="Durée Loading"
            value={t.loadingDuration} min={2} max={14} step={1} unit="s"
            onChange={v => setTweak('loadingDuration', v)}/>
        </TweakSection>

        <TweakSection label="Scénarios démo (pitch)">
          <TweakButton label="▶ Hassan · MRE Berkane · données réelles" onClick={() => goToScenario('hassan')}/>
          <TweakButton label="▶ CRI Oriental · radar"                   onClick={() => goToScenario('cri')}/>
          <TweakButton label="▶ CRI Casablanca · radar"                 onClick={() => goToScenario('cri_casa')}/>
          <TweakButton label="⚡ Magic moment · Nador → Hassan"
            onClick={() => { quickFill('hassan'); setPhase('dashboard'); }}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
