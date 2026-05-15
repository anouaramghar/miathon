// InvestMap Maroc — Écran 3: Dashboard unifié
// Magic moment: score ring animates up when Radar alert slides in after 1.5s

// NeighborhoodMapLeaflet is defined in maps.jsx (loaded before this file)

function ScoreRingDash({ score, color }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);
  return (
    <div className="score-ring sm">
      <svg viewBox="0 0 74 74">
        <circle cx="37" cy="37" r={R} fill="none" strokeWidth="6" className="bg"/>
        <circle cx="37" cy="37" r={R} fill="none" strokeWidth="6"
          strokeLinecap="round" className="fg"
          strokeDasharray={C} strokeDashoffset={offset}
          style={{ stroke: color }}/>
      </svg>
      <div className="num">
        <div className="v">{score}</div>
        <div className="o">/ 100</div>
      </div>
    </div>
  );
}


function Dashboard({ scenario, onSeeReport, onSeeRadar, onRestart, onEditCriteria }) {
  const reco = scenario.topRecommendation;
  const fmt  = (n) => n.toLocaleString('fr-FR');

  // H9 — guard: if topRecommendation is missing, show friendly error
  if (!reco) {
    return (
      <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="error-card">
          <div className="error-icon">⚠</div>
          <h3>Données indisponibles</h3>
          <p>Impossible de charger les recommandations pour ce profil. Veuillez réessayer.</p>
          <button className="btn terra" onClick={onRestart}>← Nouvelle analyse</button>
        </div>
      </div>
    );
  }

  // H8 — collapsible "À éviter" section
  const [avoidOpen, setAvoidOpen] = React.useState(false);

  // Detect radar bonus from positives list (matches label OR detail containing "radar" or "Nador")
  const radarFactor = reco.positives.find(p =>
    (p.detail && p.detail.toLowerCase().includes('radar')) ||
    (p.label  && (p.label.toLowerCase().includes('radar') || p.label.toLowerCase().includes('nador')))
  );
  const radarBonus  = radarFactor ? (parseInt(radarFactor.weight) || 5) : 0;
  const hasRadar    = !!scenario.radarBoost && radarBonus > 0;
  const baseScore   = hasRadar ? reco.score - radarBonus : reco.score;

  const [radarVisible, setRadarVisible] = React.useState(!hasRadar);
  const [displayScore, setDisplayScore] = React.useState(baseScore);

  const scoreColor = displayScore >= 70 ? 'var(--good)' : displayScore >= 50 ? 'var(--warn)' : 'var(--bad)';
  const scoreClass = (s) => s >= 70 ? '' : s >= 50 ? 'warn' : 'bad';

  React.useEffect(() => {
    if (!hasRadar) return;

    const t = setTimeout(() => {
      setRadarVisible(true);

      // Animate score from base → full
      const steps = 24;
      const diff  = reco.score - baseScore;
      let step = 0;
      const iv = setInterval(() => {
        step++;
        if (step >= steps) {
          setDisplayScore(reco.score);
          clearInterval(iv);
        } else {
          setDisplayScore(Math.round(baseScore + diff * (step / steps)));
        }
      }, 700 / steps);
    }, 1500);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-head">
        <div>
          <div className="crumbs">Dashboard · {scenario.user.city} · {scenario.user.neighborhood}</div>
          <h2>Pour <em>{scenario.user.name}</em> · {scenario.user.profileLabel}{scenario.user.country ? ` · ${scenario.user.country}` : ''}</h2>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* H3 — edit criteria without full restart */}
          {onEditCriteria && (
            <button className="btn ghost" onClick={onEditCriteria} title="Modifier le profil, la ville ou le budget">
              ← Modifier mes critères
            </button>
          )}
          {/* H4 — consistent label for full restart */}
          <button className="btn ghost" onClick={onRestart}>Nouvelle analyse</button>
          <button className="btn" onClick={onSeeReport}>
            Voir le rapport complet
            <svg className="arrow" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Score hero strip ─── */}
      <div className="dash-score-hero">
        <ScoreRingDash score={displayScore} color={scoreColor}/>
        <div>
          <div className="eyebrow">Recommandation #1</div>
          <div className="biz-name">{reco.business}</div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <span className="biz-verdict">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', flexShrink: 0 }}/>
              {reco.verdict}
            </span>
            {hasRadar && radarVisible && (
              <span className="radar-boost-badge">⚡ +{radarBonus} pts Radar</span>
            )}
          </div>
        </div>
        <div className="agent6-status">
          <div><span className="agent6-dot"/>Agent 6 actif</div>
          <div>Radar · MAJ il y a 7 min</div>
          <div style={{ color: 'var(--ink-4)', fontSize: 9.5 }}>847 projets surveillés</div>
        </div>
      </div>

      {/* ─── Main grid ─── */}
      <div className="dash-main">
        {/* Left — local map */}
        <div className="big-map-card">
          <div className="head">
            <div>
              <h3>Quartier · {scenario.user.neighborhood}</h3>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)', marginTop: 2 }}>
                {fmt(scenario.neighborhood.population)} hab. · revenu moyen {fmt(scenario.neighborhood.avgIncome)} DH
              </div>
            </div>
            <div className="map-legend">
              <span className="lg"><span className="pin you"/> Toi</span>
              <span className="lg"><span className="pin green"/> Vide</span>
              <span className="lg"><span className="pin" style={{ background: 'var(--ink)' }}/> Conc.</span>
              <span className="lg"><span className="pin orange"/> Radar</span>
            </div>
          </div>
          <NeighborhoodMapLeaflet scenario={scenario} height={440}/>
        </div>

        {/* Right — opportunities panel */}
        <div className="opp-panel">
          <div className="head">
            <h3>Top opportunités</h3>
            <p className="sub">3 recommandées · 2 à éviter · par score</p>
          </div>

          <div className="opp-list">
            {/* #1 — recommended */}
            <div className="opp-row active" onClick={onSeeReport} style={{ cursor: 'pointer' }}>
              <div className={`opp-mini-score ${scoreClass(reco.score)}`}>{reco.score}</div>
              <div>
                <div className="opp-name">{reco.business}</div>
                <div className="opp-meta">Recommandation #1 · {reco.verdict}</div>
              </div>
              <div className="opp-arrow">→</div>
            </div>

            {/* Alternatives */}
            {scenario.alternatives.map((a, i) => (
              <div key={i} className="opp-row" onClick={onSeeReport} style={{ cursor: 'pointer' }}>
                <div className={`opp-mini-score ${scoreClass(a.score)}`}>{a.score}</div>
                <div>
                  <div className="opp-name">{a.business}</div>
                  <div className="opp-meta">Alt. · {a.invest} DH · ROI {a.roi}</div>
                </div>
                <div className="opp-arrow">→</div>
              </div>
            ))}

            <div style={{ height: 6 }}/>
            {/* H8 — collapsible "À éviter" for progressive disclosure */}
            <button
              className="avoid-toggle"
              onClick={() => setAvoidOpen(v => !v)}
              aria-expanded={avoidOpen}>
              <span style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink-3)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
                À éviter dans ce quartier
              </span>
              <span className="avoid-toggle-arrow" style={{ transform: avoidOpen ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 200ms', color: 'var(--ink-3)', marginLeft: 6 }}>▾</span>
            </button>

            {avoidOpen && scenario.avoid.slice(0, 2).map((a, i) => (
              <div key={i} className="opp-row bad">
                <div className="opp-mini-score bad">{a.score}</div>
                <div>
                  <div className="opp-name">{a.business}</div>
                  <div className="opp-meta">{a.reason.split('.')[0]}.</div>
                </div>
                <div className="opp-arrow">×</div>
              </div>
            ))}
          </div>

          <div className="foot">
            <span style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>
              Google Maps · HCP · Inforisk
            </span>
            <button className="btn ghost" onClick={onSeeReport}>Rapport →</button>
          </div>
        </div>
      </div>

      {/* ─── Radar Alert — magic moment (slides in after 1.5s) ─── */}
      {scenario.radarBoost && (
        <div className={`radar-alert ${radarVisible ? '' : 'hidden'}`}>
          <div className="icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
              <circle cx="12" cy="12" r="6"  stroke="currentColor" strokeWidth="1.6" opacity="0.6"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.6" opacity="0.3"/>
              <path d="M12 12 L20 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="copy">
            <div className="tag">
              <span className="pulse"/> Radar · nouvelle détection
            </div>
            <h4>
              <em>{scenario.radarBoost.shortName}</em> détecté à {scenario.radarBoost.distanceToBerkane} km
              · <em>3 opportunités boostées</em> pour toi.
            </h4>
            <div className="deet">
              <b>{scenario.radarBoost.amount}</b> · {scenario.radarBoost.jobs} · phase <b>{scenario.radarBoost.phase}</b> · détecté le <b>{scenario.radarBoost.detectedAt}</b>
            </div>
          </div>
          <button className="cta" onClick={onSeeRadar}>
            Voir les opportunités
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

window.Dashboard = Dashboard;
