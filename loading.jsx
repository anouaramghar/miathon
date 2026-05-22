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
    { id: 6, name: 'Data Collector', task: 'Veille presse nationale (Tavily) · grands projets…', done: 'Projets nationaux détectés · région analysée' },
    { id: 7, name: 'Project Analyzer (LLM)', task: 'Extraction structurée — secteur, montant, région…', done: 'Projets classés par impact local' },
  ],
  bridge: {
    id: 5, name: 'Success Predictor',
    task: 'Calcul probabilité + intégration Radar…',
    done: 'Score calculé · recommandation générée',
  },
};

// Build a human-readable "done" line from a REAL agent_done SSE payload.
// Returns null when the data shape is unexpected (caller keeps the static text).
function realFinding(agent, data) {
  try {
    if (!data) return null;
    if (agent === 1) {
      const loc = data.location || {};
      const comps = loc.competitors || [];
      const total = comps.reduce((s, c) => s + (c.count || 0), 0);
      const top2 = comps.slice(0, 2).map(c => `${c.type} ×${c.count}`).join(' · ');
      const gaps = (loc.commercial_gaps || []).join(', ');
      return `${top2 || 'zone scannée'} · ${total} établissements${gaps ? ' · manque : ' + gaps : ''}`;
    }
    if (agent === 2) {
      const d = data.demand || {};
      return `Signal de demande : ${d.demand_signal || '—'}${d.source ? ' · ' + d.source : ''}`;
    }
    if (agent === 3) {
      const m = data.matches || [];
      return m.slice(0, 3).map(x => `${x.business} ${x.score}`).join(' · ') || 'Opportunités classées';
    }
    if (agent === 4) {
      const steps = data.admin_steps || [];
      return steps.slice(0, 3).map(s => s.step).join(' → ') || 'Démarches séquencées';
    }
    if (agent === 5) {
      const top = (data.scores || {}).top_recommendation || {};
      return [top.business, top.score != null ? top.score + '/100' : null, top.verdict]
        .filter(Boolean).join(' · ') || 'Score calculé';
    }
  } catch (e) { /* fall through */ }
  return null;
}

function LoadingScreen({ onDone, duration = 8000, scenario, jobId, onResult }) {
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

  const [investDone, setInvestDone]   = React.useState(0);
  const [radarDone, setRadarDone]     = React.useState(0);
  const [bridgeDone, setBridgeDone]   = React.useState(false);
  const [secs, setSecs]               = React.useState(0);
  const [canSkip, setCanSkip]         = React.useState(false); // H3 — skip appears after 3s
  const [liveFindings, setFindings]   = React.useState({});    // real per-agent results, keyed by agent id
  const doneRef = React.useRef(false);

  // Real mode = a live backend job is streaming. SSE drives the invest rail,
  // the bridge, and the transition. Demo mode (no jobId) stays timer-driven.
  const realMode = !!jobId;

  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  // SSE: connect to real backend pipeline when jobId is available
  React.useEffect(() => {
    if (!jobId) return;
    const es = new EventSource(`http://localhost:8000/api/stream/${jobId}`);
    es.addEventListener('agent_start', e => {
      const d = JSON.parse(e.data);
      console.log('[InvestMap SSE] agent_start', d.agent, d.label);
    });
    es.addEventListener('agent_done', e => {
      const d = JSON.parse(e.data);
      console.log('[InvestMap SSE] agent_done', d.agent);
      const finding = realFinding(d.agent, d.data);
      if (finding) setFindings(prev => ({ ...prev, [d.agent]: finding }));
      if (d.agent >= 1 && d.agent <= 4) setInvestDone(v => Math.max(v, d.agent));
      if (d.agent === 5) setBridgeDone(true);
    });
    es.addEventListener('complete', e => {
      console.log('[InvestMap SSE] pipeline complete — real data ready');
      try {
        const real = JSON.parse(e.data).scenario;
        if (real && onResult) onResult(real);
      } catch (err) {
        console.warn('[InvestMap SSE] could not parse complete payload', err);
      }
      es.close();
      setInvestDone(INVEST_AGENTS.length);
      setBridgeDone(true);
      // Brief beat so the jury sees agent 5's real score land before we switch.
      if (!doneRef.current) { doneRef.current = true; setTimeout(onDone, 1100); }
    });
    es.onerror = () => { console.warn('[InvestMap SSE] connection closed'); es.close(); };
    return () => es.close();
  }, [jobId]);

  React.useEffect(() => {
    const tick  = setInterval(() => setSecs(s => +(s + 0.1).toFixed(1)), 100);
    const skip3 = setTimeout(() => setCanSkip(true), 3000); // H3 — show skip after 3s

    // Radar layer has no live backend → always timer-driven. In real mode,
    // stretch its pacing so it doesn't all finish while invest is still running.
    const radarWindow = realMode ? 30000 : duration * 0.55;
    const rStep = radarWindow / RADAR_AGENTS.length;
    const rts = RADAR_AGENTS.map((_, i) =>
      setTimeout(() => setRadarDone(v => Math.max(v, i + 1)), rStep * (i + 1) + 500)
    );

    let its = [], bt = null, end = null;
    if (realMode) {
      // SSE drives invest rows, bridge, and the transition. Safety net only:
      // if 'complete' never arrives (API hang), bail out after 210s.
      end = setTimeout(() => {
        if (!doneRef.current) { doneRef.current = true; onDone(); }
      }, 210000);
    } else {
      // Demo mode (no backend): timer drives invest, bridge, and transition.
      const iStep = (duration * 0.58) / INVEST_AGENTS.length;
      its = INVEST_AGENTS.map((_, i) =>
        setTimeout(() => setInvestDone(v => Math.max(v, i + 1)), iStep * (i + 1))
      );
      bt  = setTimeout(() => setBridgeDone(true), duration * 0.76);
      end = setTimeout(() => {
        if (!doneRef.current) { doneRef.current = true; onDone(); }
      }, duration + 500);
    }

    return () => {
      [...its, ...rts, skip3].forEach(clearTimeout);
      if (bt) clearTimeout(bt);
      if (end) clearTimeout(end);
      clearInterval(tick);
    };
  }, [jobId]);

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
        Analyse personnalisée · OpenStreetMap + presse nationale · données réelles
      </div>
      <h2>
        Analyse en cours{profLbl ? ` · profil ${profLbl}` : ''} —{' '}
        <em>{city}</em>
      </h2>
      <div className="sub">
        {realMode
          ? 'Analyse en temps réel — OpenStreetMap, demande locale et raisonnement IA. Les résultats s\'affichent au fil de l\'eau.'
          : 'Vos données locales et nationales sont analysées — résultat dans quelques secondes.'}
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
                    {isDone ? (liveFindings[a.id] || a.done) : a.task}
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
              {bridgeDone ? (liveFindings[5] || BRIDGE.done) : BRIDGE.task}
            </div>
          </div>
          <div className="agent-status">
            {bridgeDone ? '✓ Terminé' : bridgeReady ? 'En cours' : 'En attente'}
          </div>
        </div>
      </div>

      <div className="progress-meta" style={{ width: 760, maxWidth: '100%' }}>
        <span>{done}/{total} analyses terminées</span>
        <span>{realMode
          ? `${secs.toFixed(1)}s · analyse réelle en cours`
          : `${Math.min(secs, duration / 1000).toFixed(1)}s / ~${Math.round(duration / 1000)}s`}</span>
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
