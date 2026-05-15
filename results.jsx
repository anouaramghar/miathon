// Invest Maroc — Results screen

function ScoreRing({ score, color = 'var(--good)' }) {
  const R = 56;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - score / 100);
  return (
    <div className="score-ring">
      <svg viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={R} fill="none" strokeWidth="10" className="bg"/>
        <circle cx="66" cy="66" r={R} fill="none" strokeWidth="10"
          strokeLinecap="round"
          className="fg"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ stroke: color }}/>
      </svg>
      <div className="num">
        <div className="v">{score}</div>
        <div className="o">/ 100 · succès</div>
      </div>
    </div>
  );
}

// NeighborhoodMapLeaflet is defined in maps.jsx

function fmt(n) { return n.toLocaleString('fr-FR'); }
function range(lo, hi, unit = 'DH') {
  return <span>{fmt(lo)}<span className="unit"> – {fmt(hi)} {unit}</span></span>;
}

function ResultsScreen({ scenario, onRestart, onEditCriteria }) {
  const reco = scenario.topRecommendation;

  // H9 — guard: if data is missing, show friendly error state
  if (!reco) {
    return (
      <div className="results" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="error-card">
          <div className="error-icon">⚠</div>
          <h3>Rapport indisponible</h3>
          <p>Les données de ce scénario n'ont pas pu être chargées. Veuillez relancer une analyse.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {onEditCriteria && <button className="btn ghost" onClick={onEditCriteria}>← Modifier mes critères</button>}
            <button className="btn terra" onClick={onRestart}>Nouvelle analyse</button>
          </div>
        </div>
      </div>
    );
  }

  const scoreColor = reco.score >= 70 ? 'var(--good)' : reco.score >= 50 ? 'var(--warn)' : 'var(--bad)';

  const [toast, setToast] = React.useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4200);
  };

  return (
    <div className="results">

      {/* Sticky TOC */}
      <nav className="results-toc" aria-label="Sections du rapport">
        <a href="#r-score">Score</a>
        <a href="#r-finance">Finances</a>
        <a href="#r-demarches">Démarches</a>
        <a href="#r-alternatives">Alternatives</a>
        <a href="#r-avoid">À éviter</a>
        {scenario.radarBoost && <a href="#r-radar">Radar</a>}
      </nav>

      <div className="results-head">
        <div>
          <div className="crumbs">
            Rapport · {scenario.user.city} · {scenario.user.neighborhood} ·
            <span className="mono"> #{scenario.user.profile === 'mre' ? 'IM-2026-0142' : 'IM-2026-0287'}</span>
          </div>
          <h1>
            Pour <em>{scenario.user.name}</em>, on recommande<br/>
            une <em>{reco.business.toLowerCase()}</em>.
          </h1>
          <div className="who">
            {scenario.user.profileLabel}
            {scenario.user.country ? ` · ${scenario.user.country}` : ''}
            {' · '}budget {fmt(scenario.user.budget)} DH · disponibilité {scenario.user.availabilityLabel}
          </div>
          {scenario._personalized && scenario._scoreDelta !== 0 && (
            <div className={`personalization-badge ${scenario._scoreDelta > 0 ? 'pos' : 'neg'}`}>
              {scenario._scoreDelta > 0 ? '↑' : '↓'} Score ajusté {scenario._scoreDelta > 0 ? '+' : ''}{scenario._scoreDelta} pts · budget réel pris en compte
            </div>
          )}
        </div>
        <div className="actions">
          {/* H3 — edit criteria without full restart */}
          {onEditCriteria && (
            <button className="btn ghost" onClick={onEditCriteria} title="Modifier le profil, la ville ou le budget">
              ← Modifier mes critères
            </button>
          )}
          {/* H4 — consistent restart label */}
          <button className="btn ghost" onClick={onRestart}>Nouvelle analyse</button>
          <button className="btn" onClick={() => window.print()}>
            Exporter PDF
            <svg className="arrow" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* TOP ROW — hero score + map */}
      <div className="results-grid" id="r-score">
        {/* Hero card */}
        <div className="hero-card">
          <div className="hero-top">
            <div style={{ flex: 1 }}>
              <div className="eyebrow">Recommandation #1 · top match</div>
              <h2>{reco.business}</h2>
              <div className="verdict">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--good)' }}/>
                {reco.verdict}
              </div>
            </div>
            <ScoreRing score={reco.score} color={scoreColor}/>
          </div>

          <div className="hero-factors">
            <div className="factor-block">
              <h4>
                Facteurs positifs
                <span className="tally">
                  +{reco.positives.reduce((s, f) => s + parseInt(f.weight) || 0, 0)} pts
                </span>
              </h4>
              {reco.positives.map((f, i) => (
                <div key={i} className="factor pos">
                  <div className="mark">✓</div>
                  <div className="body">
                    {f.label}
                    <div className="detail">{f.detail}</div>
                  </div>
                  <div className="w">{f.weight}</div>
                </div>
              ))}
            </div>

            <div className="factor-block">
              <h4>
                Facteurs de risque
                <span className="tally">
                  {reco.risks.reduce((s, f) => s + (parseInt(f.weight) || 0), 0)} pts
                </span>
              </h4>
              {reco.risks.map((f, i) => (
                <div key={i} className="factor neg">
                  <div className="mark">!</div>
                  <div className="body">
                    {f.label}
                    <div className="detail">{f.detail}</div>
                  </div>
                  <div className="w">{f.weight}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="map-card">
          <div className="map-head">
            <h3>Carte du quartier</h3>
            <div className="legend">
              <span className="lg"><span className="pin you"/> Toi</span>
              <span className="lg"><span className="pin comp"/> Concurrents</span>
              <span className="lg"><span className="pin gap"/> Vide commercial</span>
            </div>
          </div>
          <NeighborhoodMapLeaflet scenario={scenario} height={380}/>
          <div className="nb-strip">
            <div className="cell">
              <div className="v">{fmt(scenario.neighborhood.population)}</div>
              <div className="l">Habitants · 1 km</div>
            </div>
            <div className="cell">
              <div className="v">{fmt(scenario.neighborhood.avgIncome)} <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink-3)' }}>DH</span></div>
              <div className="l">Revenu moyen</div>
            </div>
            <div className="cell">
              <div className="v">{scenario.competitors.length}</div>
              <div className="l">Pins commerce</div>
            </div>
            <div className="cell">
              <div className="v">{scenario.neighborhood.area}</div>
              <div className="l">Zone analysée</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECOND ROW — finance / admin */}
      <div className="section-bridge" id="r-finance">
        <div className="line"/>
        <div className="label">Chiffres · démarches · financement</div>
        <div className="line"/>
      </div>

      <div className="results-grid">
        {/* Finance card (dark) */}
        <div className="fin-card">
          <div className="eyebrow">Estimation financière</div>
          <h3>{reco.business} · {scenario.user.neighborhood}</h3>
          <div className="fin-rows">
            <div className="fin-row">
              <div className="l">Investissement initial</div>
              <div className="v">{range(reco.finance.investment.low, reco.finance.investment.high)}</div>
            </div>
            <div className="fin-row">
              <div className="l">Revenu net mensuel</div>
              <div className="v">{range(reco.finance.monthlyNet.low, reco.finance.monthlyNet.high)}</div>
            </div>
            <div className="fin-row">
              <div className="l">Retour sur invest.</div>
              <div className="v">
                mois&nbsp;{reco.finance.roiMonths.low}<span className="unit"> – {reco.finance.roiMonths.high}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin steps */}
        <div className="card" id="r-demarches">
          <div className="eyebrow">Étapes administratives — profil {scenario.user.profileLabel}</div>
          <h3>Démarches personnalisées</h3>
          <p className="sub">Adaptées à ton profil — pas un guide générique.</p>
          <div className="steps">
            {reco.admin.map((s, i) => (
              <div key={i} className="step">
                <div className="n">{i + 1}</div>
                <div className="body">
                  <div className="ttl">{s.step}</div>
                  <div className="note">{s.note}</div>
                </div>
                <div className="time">{s.time}</div>
              </div>
            ))}
          </div>
          <div className="fin-tags">
            {reco.financing.map((f, i) => (
              <div key={i} className="fin-tag">
                <div>
                  <div className="name">{f.name}</div>
                  <div className="desc">{f.desc}</div>
                </div>
                <div className="badge">{f.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THIRD ROW — alternatives */}
      <div className="section-bridge" id="r-alternatives">
        <div className="line"/>
        <div className="label">Autres options · même quartier</div>
        <div className="line"/>
      </div>

      <div className="card">
        <h3>Alternatives à considérer</h3>
        <p className="sub">Si la recommandation #1 ne te convient pas — voici 2 autres pistes solides.</p>
        <div className="alt-grid">
          {scenario.alternatives.map((a, i) => (
            <div key={i} className="alt">
              <div className="alt-top">
                <div className="alt-name">{a.business}</div>
                <div className="alt-score">{a.score}/100</div>
              </div>
              <div className="alt-reason">{a.reason}</div>
              <div className="alt-meta">
                <span>Invest. <b>{a.invest} DH</b></span>
                <span>ROI <b>{a.roi}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOURTH — avoid */}
      <div className="section-bridge" id="r-avoid">
        <div className="line"/>
        <div className="label">À éviter dans ce quartier</div>
        <div className="line"/>
      </div>

      <div className="avoid-card">
        <h3>Business à éviter ici</h3>
        <p className="sub">Basé sur les fermetures historiques observées sur Google Maps "Permanently Closed" + statistiques Inforisk.</p>
        {scenario.avoid.map((a, i) => (
          <div key={i} className="avoid">
            <div className="score-mini">{a.score}</div>
            <div>
              <div className="name">{a.business}</div>
              <div className="reason">{a.reason}</div>
            </div>
            <div className="right">{a.score} / 100</div>
          </div>
        ))}
      </div>

      {/* ⚡ Radar section — the magic connection */}
      {scenario.radarBoost && (
        <div className="radar-section" id="r-radar">
          <div className="head">
            <div className="tag">
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--terra)', boxShadow: '0 0 0 3px rgba(194,86,43,0.25)' }}/>
              Bonus Radar · macro → micro
            </div>
            <h3>Un <em>grand projet</em> arrive près de toi.<br/>Voici ce que ça change.</h3>
            <p className="lede">
              Notre Radar surveille 847 projets d'investissement annoncés au Maroc.
              Quand un projet majeur est détecté dans ta région, Agent 5 réévalue le score de business
              dont la demande sera directement boostée par cet afflux d'activité.
            </p>
          </div>

          <div className="radar-project-card">
            <div className="info">
              <div className="name">{scenario.radarBoost.name}</div>
              <div className="desc">{scenario.radarBoost.description}</div>
              <div className="stats">
                <div className="stat-item">Montant<b>{scenario.radarBoost.amount}</b></div>
                <div className="stat-item">Emplois<b>{scenario.radarBoost.jobs}</b></div>
                <div className="stat-item">Phase<b>{scenario.radarBoost.phase}</b></div>
                <div className="stat-item">Progression<b>{scenario.radarBoost.progress}%</b></div>
              </div>
              <div className="source-link">
                Détecté et vérifié en temps réel par Agent 6 le {scenario.radarBoost.detectedAt}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 60, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {scenario.radarBoost.distanceToBerkane}<span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'rgba(245,239,228,0.55)' }}> km</span>
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'rgba(245,239,228,0.55)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', marginTop: 4 }}>
                de ton quartier
              </div>
            </div>
          </div>

          <div className="boosted-grid">
            {scenario.radarBoost.boostedOpportunities.map((b, i) => (
              <div key={i} className="boosted-card">
                <div className="top">
                  <div className="biz">{b.business}</div>
                  <div className="score-box">
                    <div className="v">{b.score}</div>
                    <div className="o">/ 100</div>
                  </div>
                </div>
                <div className="boost">
                  ↑ Score boost <b style={{ color: 'var(--terra)' }}>{b.boost}</b> vs score de base
                </div>
                <div className="reason">{b.reason}</div>
                <div className="figs">
                  <span>Invest. <b>{b.invest}</b></span>
                  <span>Net/mois <b>{b.monthlyNet}</b></span>
                  <span>ROI <b>{b.roi}</b></span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            margin: '0 30px 26px',
            display: 'flex', gap: 10, justifyContent: 'flex-end',
            position: 'relative', zIndex: 1,
          }}>
            <button className="btn ghost"
              style={{ color: 'var(--paper)', borderColor: 'rgba(245,239,228,0.3)' }}
              onClick={() => showToast('✓ Alertes Radar activées — vous recevrez un email dès qu\'un projet majeur est détecté dans votre région.')}>
              Activer alertes Radar
            </button>
            <button className="btn terra" onClick={onRestart}>
              Nouvelle analyse →
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="section-bridge" style={{ marginTop: 48 }}>
        <div className="line"/>
        <div className="label">Analyse IA structurée · Données qualifiées en temps réel</div>
        <div className="line"/>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" role="alert">
          <div className="t-icon">✓</div>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

window.ResultsScreen = ResultsScreen;
