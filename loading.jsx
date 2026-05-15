// InvestMap Maroc — Loading screen — parallel 2-rail layout
// Agent messages are built dynamically from the active scenario

const FALLBACK_AGENTS = {
  invest: [
    { id: 1, name: 'Location Intelligence', task: 'Cartographie des commerces dans 0.5 / 1 / 2 km…', done: 'Zone cartographiée · établissements scannés' },
    { id: 2, name: 'Market Demand', task: 'Mesure de la demande Google + reviews locales…', done: 'Demande locale analysée · signal identifié' },
    { id: 3, name: 'Business Matching', task: 'Matching profil ↔ opportunités selon budget…', done: 'Top recommandation identifiée' },
    { id: 4, name: 'Administrative Navigator', task: 'Démarches légales spécifiques au profil…', done: 'Démarches identifiées et séquencées' },
  ],
  radar: [
    { id: 6, name: 'Data Collector', task: 'Scraping CRI · AMDIE · presse économique (24h)…', done: '847 projets indexés · région analysée' },
    { id: 7, name: 'Project Analyzer (LLM)', task: 'Extraction structurée — secteur, montant, région…', done: 'Projets classés par impact local' },
  ],
  bridge: {
    id: 5, name: 'Success Predictor',
    task: 'Calcul probabilité + intégration Radar…',
    done: 'Score calculé · recommandation générée',
  },
};

function LoadingScreen({ onDone, duration = 8000, scenario }) {
  // Build context-aware agent messages from scenario (via personalize.js)
  const agents = React.useMemo(() => {
    try {
      if (window.buildLoadingAgents && scenario) {
        return window.buildLoadingAgents(scenario) || FALLBACK_AGENTS;
      }
    } catch (e) {
      console.warn('[LoadingScreen] buildLoadingAgents failed, using fallback', e);
    }
    return FALLBACK_AGENTS;
  }, [scenario]);

  const INVEST_AGENTS = agents.invest;
  const RADAR_AGENTS = agents.radar;
  const BRIDGE = agents.bridge;

  const [investDone, setInvestDone] = React.useState(0);
  const [radarDone, setRadarDone]   = React.useState(0);
  const [bridgeDone, setBridgeDone] = React.useState(false);
  const [secs, setSecs]             = React.useState(0);
  const [canSkip, setCanSkip]       = React.useState(false); // H3 — skip appears after 3s
  const doneRef = React.useRef(false);

  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  React.useEffect(() => {
    const iStep = (duration * 0.58) / INVEST_AGENTS.length;
    const rStep = (duration * 0.55) / RADAR_AGENTS.length;

    const its = INVEST_AGENTS.map((_, i) =>
      setTimeout(() => setInvestDone(v => Math.max(v, i + 1)), iStep * (i + 1))
    );
    const rts = RADAR_AGENTS.map((_, i) =>
      setTimeout(() => setRadarDone(v => Math.max(v, i + 1)), rStep * (i + 1) + 500)
    );
    const bt    = setTimeout(() => setBridgeDone(true), duration * 0.76);
    const tick  = setInterval(() => setSecs(s => +(s + 0.1).toFixed(1)), 100);
    const skip3 = setTimeout(() => setCanSkip(true), 3000); // H3 — show skip after 3s
    const end   = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onDone(); }
    }, duration + 500);

    return () => {
      [...its, ...rts, bt, end, skip3].forEach(clearTimeout);
      clearInterval(tick);
    };
  }, []);

  const done = investDone + radarDone + (bridgeDone ? 1 : 0);
  const total = INVEST_AGENTS.length + RADAR_AGENTS.length + 1;
  const allInvest = investDone >= INVEST_AGENTS.length;
  const allRadar  = radarDone >= RADAR_AGENTS.length;
  const bridgeReady = allInvest && allRadar;

  // Context headline from scenario
  const city    = scenario?.user?.city || 'ton quartier';
  const profLbl = scenario?.user?.profileLabel || '';

  return (
    <div className="loading">
      {/* H2 — user-friendly copy, no tech jargon */}
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Analyse personnalisée · 5 sources · données temps réel
      </div>
      <h2>
        Analyse en cours{profLbl ? ` · profil ${profLbl}` : ''} —{' '}
        <em>{city}</em>
      </h2>
      <div className="sub">
        Vos données locales et nationales sont analysées — résultat dans quelques secondes.
      </div>

      {/* Parallel rails */}
      <div className="loading-rails">
        {/* Left — Invest Layer */}
        <div className="loading-rail">
          <div className="loading-rail-head invest">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', flexShrink: 0 }} />
            Invest · local
          </div>
          {INVEST_AGENTS.map((a, i) => {
            const isDone = i < investDone;
            const isActive = i === investDone;
            return (
              <div key={a.id} className={`agent-row ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                <div className="agent-num"><span className="n">{a.id}</span></div>
                <div>
                  <div className="agent-name" style={{ fontSize: 13 }}>{a.name}</div>
                  <div className="agent-task" style={{ fontSize: 11 }}>
                    {isActive && <span className="spinner" />}
                    {isDone ? a.done : a.task}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right — Radar Layer */}
        <div className="loading-rail">
          <div className="loading-rail-head radar">
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--terra)', display: 'inline-block', flexShrink: 0 }} />
            Radar · national
          </div>
          {RADAR_AGENTS.map((a, i) => {
            const isDone = i < radarDone;
            const isActive = i === radarDone;
            return (
              <div key={a.id} className={`agent-row ${isDone ? 'done' : isActive ? 'active' : ''}`}>
                <div className="agent-num"><span className="n">{a.id}</span></div>
                <div>
                  <div className="agent-name" style={{ fontSize: 13 }}>{a.name}</div>
                  <div className="agent-task" style={{ fontSize: 11 }}>
                    {isActive && <span className="spinner" />}
                    {isDone ? a.done : a.task}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bridge agent — spans full width, activates when both layers done */}
      <div className="loading-bridge">
        <div className={`agent-row ${bridgeDone ? 'done' : bridgeReady ? 'active' : ''}`}
          style={{ gridTemplateColumns: '44px 1fr 110px' }}>
          <div className="agent-num"><span className="n">{BRIDGE.id}</span></div>
          <div>
            <div className="agent-name" style={{ fontSize: 13 }}>
              {BRIDGE.name}
              <span className="bridge-label">Invest + Radar</span>
            </div>
            <div className="agent-task" style={{ fontSize: 11 }}>
              {bridgeReady && !bridgeDone && <span className="spinner" />}
              {bridgeDone ? BRIDGE.done : BRIDGE.task}
            </div>
          </div>
          <div className="agent-status">
            {bridgeDone ? '✓ Terminé' : bridgeReady ? 'En cours' : 'En attente'}
          </div>
        </div>
      </div>

      <div className="progress-meta" style={{ width: 760, maxWidth: '100%' }}>
        <span>{done}/{total} analyses terminées</span>
        <span>{Math.min(secs, duration / 1000).toFixed(1)}s / ~{Math.round(duration / 1000)}s</span>
      </div>

      {/* H3 — skip button, visible after 3s */}
      <div className="loading-skip-wrap" style={{ opacity: canSkip ? 1 : 0, transition: 'opacity 400ms ease', marginTop: 20, minHeight: 32 }}>
        {canSkip && (
          <button className="btn ghost" onClick={skip} style={{ fontSize: 'var(--text-xs)', padding: '5px 14px' }}>
            Passer → voir les résultats
          </button>
        )}
      </div>
    </div>
  );
}

window.LoadingScreen = LoadingScreen;
