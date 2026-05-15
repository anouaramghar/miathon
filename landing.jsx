// InvestMap Maroc — Écran 1: Landing

function Landing({ onCTA, onQuickDemo }) {
  return (
    <div className="landing">
      {/* LEFT */}
      <div className="landing-left">
        <div className="top">
          <div className="landing-eyebrow">
            <span className="dot"/> InvestMap Maroc · v3.0 · Miathon 2026
          </div>
          <h1>
            Trouve le bon business.<br/>
            Au bon endroit.<br/>
            <em>Maintenant.</em>
          </h1>
          <p className="tagline">
            Des données réelles sur ton quartier — pas des opinions générales.<br/>
            Un radar national des grands projets — pas une liste statique.<br/>
            Les deux se parlent : <b>quand un grand projet arrive près de toi, on te le dit.</b>
          </p>
          <div className="landing-cta-row">
            <button className="btn terra" onClick={onCTA}>
              Analyser mon opportunité
              <svg className="arrow" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="meta">
              <span>3 questions · <b>~60 secondes</b></span>
              <span>7 agents · <b>~8s d'analyse</b></span>
            </div>
          </div>
        </div>

        <div className="landing-demo">
          <span className="demo-label">Voir en direct</span>
          <button className="demo-chip" onClick={() => onQuickDemo('hassan')}>
            <span className="demo-icon">▸</span> Hassan · MRE Amsterdam
          </button>
          <button className="demo-chip" onClick={() => onQuickDemo('fatima')}>
            <span className="demo-icon">▸</span> Fatima · diplômée Nador
          </button>
          <button className="demo-chip demo-chip-radar" onClick={() => onQuickDemo('cri')}>
            <span className="demo-icon">◎</span> CRI Oriental · radar
          </button>
        </div>

        <div className="punch-stats">
          <div className="ps">
            <div className="v">14 200</div>
            <div className="l">Faillites d'entreprises<br/>en 2023 · Inforisk</div>
          </div>
          <div className="ps">
            <div className="v">78<em>/100</em></div>
            <div className="l">Score moyen calibré sur<br/>les vrais cas similaires</div>
          </div>
          <div className="ps">
            <div className="v">847</div>
            <div className="l">Projets nationaux suivis<br/>par notre Radar</div>
          </div>
          <div className="ps">
            <div className="v">0</div>
            <div className="l">Plateforme qui connecte<br/>macro et micro · Maroc</div>
          </div>
        </div>
      </div>

      {/* RIGHT — visual split: macro + micro */}
      <div className="landing-right">
        <div className="layer">
          <div className="layer-tag macro">
            <span className="dot"/> Radar · National
          </div>

          <LandingMacroMap/>

          <div className="layer-foot">
            <div className="layer-num">847<span className="unit">projets surveillés</span></div>
            <div className="layer-desc">
              Surveillance continue des grands projets par IA.
              Extraction et structuration automatique.
            </div>
          </div>
        </div>

        <div className="connector">
          <div className="connector-beam"/>
          <div className="connector-label">↕ connexion temps réel</div>
        </div>

        <div className="layer">
          <div className="layer-tag micro">
            <span className="dot"/> Invest · Local
          </div>

          <LandingMicroMap/>

          <div className="layer-score-badge">
            78<sup style={{ fontSize: 11, fontFamily: 'var(--mono)', opacity: 0.6 }}>/100</sup>
            <span>Score · Pharmacie · Berkane</span>
          </div>

          <div className="layer-foot">
            <div className="layer-num">78<span className="unit">/100 · score Berkane · pharmacie</span></div>
            <div className="layer-desc">
              Concurrents, demande Google, fermetures historiques, cas similaires.
              Granularité quartier.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.Landing = Landing;
