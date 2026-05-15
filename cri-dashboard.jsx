// InvestMap Maroc — CRI / Institution dashboard (Radar Layer principal)

// MoroccoMapLeaflet is defined in maps.jsx

function ProjectDetailPanel({ project, onClose, onViewInvest }) {
  if (!project) return (
    <div className="proj-detail-panel closed" aria-hidden="true"/>
  );

  const sector = window.SECTORS[project.sector];
  const amtLabel = project.amount >= 1000
    ? `${(project.amount / 1000).toFixed(1)} Mds DH`
    : `${project.amount} M DH`;

  return (
    <div className="proj-detail-panel" role="complementary" aria-label="Détail projet">
      <div className="proj-detail-head">
        <div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink-3)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', marginBottom: 6 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: sector.color, marginRight: 6, verticalAlign: 0 }}/>
            {sector.label}
          </div>
          <h3>{project.name}</h3>
        </div>
        <button className="proj-detail-close" onClick={onClose} aria-label="Fermer">×</button>
      </div>

      <div className="proj-detail-body">
        {/* Stats grid */}
        <div className="proj-detail-stats">
          <div className="proj-detail-stat">
            <div className="l">Montant</div>
            <div className="v">{amtLabel}</div>
          </div>
          <div className="proj-detail-stat">
            <div className="l">Emplois</div>
            <div className="v">{project.jobs ? project.jobs.toLocaleString('fr-FR') : '—'}</div>
          </div>
          <div className="proj-detail-stat">
            <div className="l">Phase</div>
            <div className="v" style={{ fontSize: 15 }}>
              <span className={`phase ${project.phase === 'en_cours' ? 'en-cours' : 'planifie'}`} style={{ fontSize: 11 }}>
                {project.phase === 'en_cours' ? 'En cours' : 'Planifié'}
              </span>
            </div>
          </div>
          <div className="proj-detail-stat">
            <div className="l">Avancement</div>
            <div className="v">{project.progress}%</div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink-3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 'var(--ls-label)' }}>
            <span>Progression globale</span>
            <span>{project.progress}%</span>
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div style={{ width: `${project.progress}%`, background: sector.color }}/>
          </div>
        </div>

        {/* Invest opportunities link */}
        <div style={{
          background: 'linear-gradient(135deg, var(--terra-soft), var(--good-soft))',
          border: '1px solid var(--line)',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 16,
        }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink-3)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase', marginBottom: 8 }}>
            ⚡ Connexion Invest
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 12, lineHeight: 1.45 }}>
            Ce projet génère des opportunités locales mesurables — pharmacies, hôtellerie, restauration, logistique.
          </div>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', fontSize: 13 }}
            onClick={onViewInvest}>
            Voir opportunités Invest liées →
          </button>
        </div>

        {/* Additional info */}
        <div className="proj-detail-section">
          <div className="dl">Région</div>
          <p>{project.region}</p>
        </div>
        {project.launch && (
          <div className="proj-detail-section">
            <div className="dl">Lancement prévu</div>
            <p>{project.launch}</p>
          </div>
        )}
        <div className="proj-detail-section">
          <div className="dl">Source</div>
          <p style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)' }}>
            Agent 6 · CRI / AMDIE · MAJ il y a 7 min
          </p>
        </div>
      </div>
    </div>
  );
}

function CRIDashboard({ scenario, onRestart, onViewInvest }) {
  const [sectorFilter, setSectorFilter] = React.useState('all');
  const [selectedProject, setSelectedProject] = React.useState(null);

  const allProjects    = window.NATIONAL_PROJECTS;
  const regionProjects = allProjects.filter(p => p.region === scenario.user.region);
  const filtered       = sectorFilter === 'all' ? allProjects : allProjects.filter(p => p.sector === sectorFilter);

  const totalAmount = filtered.reduce((s, p) => s + p.amount, 0);
  const totalJobs   = filtered.reduce((s, p) => s + (p.jobs || 0), 0);

  const handleProjectClick = (p) => setSelectedProject(p);
  const handleCloseDetail  = () => setSelectedProject(null);

  const handleViewInvest = () => {
    const pid = selectedProject && selectedProject.id;
    setSelectedProject(null);
    if (onViewInvest && pid) {
      onViewInvest(pid);
    } else {
      onRestart && onRestart();
    }
  };

  return (
    <div className="cri-dash">
      <div className="dash-head" style={{ marginBottom: 16 }}>
        <div>
          <div className="crumbs">Radar national · vue institution</div>
          <h2>
            <em>{scenario.user.org}</em> · {regionProjects.length} projets dans la région
          </h2>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)', marginTop: 4 }}>
            {scenario.user.contact} · dashboard mis à jour il y a 7 min
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn ghost" onClick={onRestart}>← Quitter</button>
          <button className="btn" onClick={() => window.print()}>
            Export rapport
            <svg className="arrow" viewBox="0 0 20 20" fill="none">
              <path d="M10 3v10m0 0l-4-4m4 4l4-4M4 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="cri-summary">
        <div className="cri-stat">
          <div className="l">Projets surveillés</div>
          <div className="v">{filtered.length}<span className="unit">{sectorFilter === 'all' ? '/ 847 national' : `/ ${allProjects.length}`}</span></div>
          <div className="trend">↑ +12 nouveaux ce mois</div>
        </div>
        <div className="cri-stat">
          <div className="l">Montant engagé</div>
          <div className="v">{(totalAmount/1000).toFixed(1)}<span className="unit">Mds DH</span></div>
          <div className="trend">↑ +8,4% vs Q4 2025</div>
        </div>
        <div className="cri-stat">
          <div className="l">Emplois projetés</div>
          <div className="v">{(totalJobs/1000).toFixed(0)}<span className="unit">K</span></div>
          <div className="trend" style={{ color: 'var(--ink-3)' }}>directs · 5 ans</div>
        </div>
        <div className="cri-stat">
          <div className="l">Phase "en cours"</div>
          <div className="v">{filtered.filter(p => p.phase === 'en_cours').length}<span className="unit">/ {filtered.length}</span></div>
          <div className="trend" style={{ color: 'var(--terra)' }}>● temps réel</div>
        </div>
      </div>

      <div className="cri-grid">
        {/* National map */}
        <div className="cri-map-card">
          <div className="head">
            <h3>Carte nationale · {allProjects.length} projets indexés</h3>
            <div className="map-legend">
              <span className="lg"><span className="pin orange"/> Featured</span>
              <span className="lg"><span className="pin" style={{ background: window.SECTORS.energie.color }}/> Énergie</span>
              <span className="lg"><span className="pin" style={{ background: window.SECTORS.industrie.color }}/> Industrie</span>
            </div>
          </div>
          <div className="cri-filters">
            <button className={`filter-chip ${sectorFilter === 'all' ? 'active' : ''}`}
              onClick={() => setSectorFilter('all')}>Tous secteurs</button>
            {Object.entries(window.SECTORS).map(([k, s]) => (
              <button key={k}
                className={`filter-chip ${sectorFilter === k ? 'active' : ''}`}
                onClick={() => setSectorFilter(k)}>
                <span className="sw" style={{ background: s.color }}/>{s.label}
              </button>
            ))}
          </div>
          <div className="map-wrap">
            <MoroccoMapLeaflet projects={allProjects} sectorFilter={sectorFilter}
              onProjectClick={handleProjectClick}
              highlight={selectedProject ? selectedProject.id : null}/>
          </div>
        </div>

        {/* Project list */}
        <div className="proj-list">
          <div className="head">
            <h3>Région {scenario.user.region}</h3>
            <span className="count">{regionProjects.length} projets · cliquer pour détail</span>
          </div>
          <div className="proj-rows">
            {regionProjects.map((p) => (
              <div key={p.id}
                className={`proj-row ${p.featured ? 'featured' : ''} ${selectedProject && selectedProject.id === p.id ? 'featured' : ''}`}
                onClick={() => handleProjectClick(p)}
                style={{ cursor: 'pointer' }}>
                <div className="proj-icon" style={{ background: window.SECTORS[p.sector].color }}>
                  {window.SECTORS[p.sector].label.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="proj-name">{p.name}</div>
                  <div className="proj-meta">
                    <span>{window.SECTORS[p.sector].label}</span>
                    <span>{p.jobs ? `${p.jobs.toLocaleString('fr-FR')} emplois` : ''}</span>
                  </div>
                  <span className={`phase ${p.phase === 'en_cours' ? 'en-cours' : 'planifie'}`}>
                    {p.phase === 'en_cours' ? `En cours · ${p.progress}%` : `Planifié · ${p.launch}`}
                  </span>
                  <div className="progress-bar"><div style={{ width: `${p.progress}%` }}/></div>
                </div>
                <div className="proj-amount">
                  {p.amount >= 1000 ? `${(p.amount/1000).toFixed(1)}` : p.amount}
                  <span className="unit">{p.amount >= 1000 ? 'Mds DH' : 'M DH'}</span>
                </div>
              </div>
            ))}

            <div style={{ padding: '12px 20px', borderTop: '4px double var(--line-2)', background: 'var(--bg-2)' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--ink-3)', letterSpacing: 'var(--ls-label)', textTransform: 'uppercase' }}>
                Autres régions · à surveiller
              </div>
            </div>
            {allProjects.filter(p => p.region !== scenario.user.region && p.amount >= 5000).map((p) => (
              <div key={p.id} className="proj-row" onClick={() => handleProjectClick(p)}
                style={{ opacity: 0.85, cursor: 'pointer' }}>
                <div className="proj-icon" style={{ background: window.SECTORS[p.sector].color }}>
                  {window.SECTORS[p.sector].label.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="proj-name">{p.name}</div>
                  <div className="proj-meta">
                    <span>{p.region}</span>
                    <span>{p.jobs ? `${p.jobs.toLocaleString('fr-FR')} emplois` : ''}</span>
                  </div>
                  <span className={`phase ${p.phase === 'en_cours' ? 'en-cours' : 'planifie'}`}>
                    {p.phase === 'en_cours' ? `En cours · ${p.progress}%` : `Planifié · ${p.launch}`}
                  </span>
                </div>
                <div className="proj-amount">
                  {p.amount >= 1000 ? `${(p.amount/1000).toFixed(1)}` : p.amount}
                  <span className="unit">{p.amount >= 1000 ? 'Mds DH' : 'M DH'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 18, padding: '14px 20px',
        background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--sans)', fontSize: 'var(--text-xs)', color: 'var(--ink-3)',
      }}>
        <span>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--good)', marginRight: 8, verticalAlign: 1 }}/>
          Agent 6 actif · prochain scrape dans 17h 42m · sources : medias24 · cri-invest · leconomiste · mapmaroc · investinmorocco
        </span>
        <span>847 projets · 12 régions · MAJ il y a 7 min</span>
      </div>

      {/* Slide-in project detail panel */}
      <ProjectDetailPanel
        project={selectedProject}
        onClose={handleCloseDetail}
        onViewInvest={handleViewInvest}
      />
    </div>
  );
}

window.CRIDashboard = CRIDashboard;
