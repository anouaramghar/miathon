// Invest Maroc — Onboarding screen

const PROFILES = [
  { id: 'mre',           label: 'MRE',           icon: '01' },
  { id: 'diplome',       label: 'Diplômé(e)',    icon: '02' },
  { id: 'fonctionnaire', label: 'Fonctionnaire', icon: '03' },
  { id: 'femme',         label: 'Femme entrep.', icon: '04' },
  { id: 'resident',      label: 'Résident(e)',   icon: '05' },
];

const CITIES = ['Berkane', 'Oujda', 'Nador', 'Casablanca', 'Marrakech'];

const NEIGHBORHOODS = {
  Berkane:    ['Hay Al Massira', 'Centre-ville', 'Hay Salam', 'Boudir'],
  Oujda:      ['Hay El Qods', 'Sidi Yahya', 'Lazaret'],
  Nador:      ['Centre', 'Selouane', 'Trankate'],
  Casablanca: ['Maârif', 'Ain Diab', 'Sidi Moumen'],
  Marrakech:  ['Guéliz', 'Médina', 'Hivernage'],
};

const COUNTRIES = ['Pays-Bas', 'France', 'Espagne', 'Belgique', 'Allemagne', 'Italie', 'Canada', 'États-Unis'];

function Onboarding({ form, setForm, onSubmit, onQuickFill }) {
  const update = (k, v) => setForm({ ...form, [k]: v });

  const budgetPct = ((form.budget - 10000) / (500000 - 10000)) * 100;

  return (
    <div className="onboarding">
      {/* LEFT — editorial */}
      <div className="onb-left">
        <div className="onb-hero">
          <div className="eyebrow">Invest Maroc · v2.0 · Miathon 2026</div>
          <h1>
            J'ai l'argent.<br/>
            J'ai l'envie.<br/>
            Mais <em>quoi</em> ouvrir, <em>où</em>,<br/>
            et si ça va <em>réussir</em>&nbsp;?
          </h1>
          <p className="lede">
            Cinq agents analysent ton quartier en 8 secondes — concurrents réels, demande Google,
            fermetures historiques, cas similaires ailleurs au Maroc. Ce que ChatGPT ne peut pas faire.
          </p>

          <div className="onb-question">
            <p>"ChatGPT m'a dit d'ouvrir une pharmacie. Mais où exactement&nbsp;? Et si elle ferme dans 6 mois&nbsp;?"</p>
            <div className="who">Hassan · MRE · Amsterdam → Berkane</div>
          </div>
        </div>

        <div className="onb-stats">
          <div className="stat">
            <div className="v">14 200</div>
            <div className="l">Faillites 2023<br/>(+15%) · Inforisk</div>
          </div>
          <div className="stat">
            <div className="v">117,7 Mds</div>
            <div className="l">Transferts MRE<br/>2024 · Office des Changes</div>
          </div>
          <div className="stat">
            <div className="v">1,3 %</div>
            <div className="l">Part investie<br/>productive · CESE</div>
          </div>
        </div>
      </div>

      {/* RIGHT — form */}
      <div className="onb-right">
        <div className="form-head">
          <div>
            <div className="step-pill">Étape 1 / 1</div>
            <h2>Parle-nous de toi</h2>
          </div>
        </div>
        <p>Toutes les réponses restent locales — aucune donnée envoyée tant que tu n'as pas cliqué <b>Analyser</b>.</p>

        {/* Quick-fill personas for demo */}
        <div className="quick">
          <div className="lbl">Démo Miathon · scénarios pré-remplis</div>
          <div className="row">
            <button className="btn ghost" onClick={() => onQuickFill('hassan')}>→ Hassan, MRE Amsterdam</button>
            <button className="btn ghost" onClick={() => onQuickFill('fatima')}>→ Fatima, diplômée Berkane</button>
          </div>
        </div>

        {/* Profile */}
        <div className="field">
          <div className="field-label"><span>Profil <span className="req">*</span></span></div>
          <div className="chips">
            {PROFILES.map(p => (
              <button
                key={p.id}
                className={`chip ${form.profile === p.id ? 'active' : ''}`}
                onClick={() => update('profile', p.id)}
                type="button"
              >
                <span className="icon">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditional per profile */}
        {form.profile === 'mre' && (
          <div className="field">
            <div className="field-label"><span>Pays de résidence</span></div>
            <select className="text" value={form.country} onChange={e => update('country', e.target.value)}>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        {form.profile === 'diplome' && (
          <div className="field">
            <div className="field-label"><span>Domaine de formation</span></div>
            <input className="text" value={form.field} onChange={e => update('field', e.target.value)} placeholder="ex. Gestion, Informatique, Commerce…" />
          </div>
        )}

        {form.profile === 'fonctionnaire' && (
          <div className="field">
            <div className="field-label"><span>Heures disponibles / semaine</span><span className="val mono">{form.hours}h</span></div>
            <input type="range" min={4} max={40} step={2} value={form.hours} className="slider"
              style={{ '--p': `${((form.hours - 4) / 36) * 100}%` }}
              onChange={e => update('hours', +e.target.value)} />
          </div>
        )}

        {form.profile === 'femme' && (
          <div className="field">
            <div className="field-label"><span>Préférence</span></div>
            <div className="chips">
              {['Domicile', 'Local commercial', 'Indifférent'].map(o => (
                <button key={o} type="button"
                  className={`chip ${form.preference === o ? 'active' : ''}`}
                  onClick={() => update('preference', o)}>{o}</button>
              ))}
            </div>
          </div>
        )}

        {/* City */}
        <div className="field">
          <div className="field-label"><span>Ville cible</span></div>
          <div className="chips">
            {CITIES.map(c => (
              <button key={c} type="button"
                className={`chip ${form.city === c ? 'active' : ''}`}
                onClick={() => update('city', c)}>
                {c}
                {c !== 'Berkane' && <span className="icon">soon</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Neighborhood */}
        <div className="field">
          <div className="field-label"><span>Quartier</span></div>
          <select className="text" value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)}>
            {(NEIGHBORHOODS[form.city] || []).map(n => <option key={n}>{n}</option>)}
          </select>
        </div>

        {/* Budget */}
        <div className="field">
          <div className="field-label">
            <span>Budget disponible</span>
            <span className="val">{form.budget.toLocaleString('fr-FR')} DH</span>
          </div>
          <div className="slider-wrap">
            <input type="range" min={10000} max={500000} step={5000}
              value={form.budget}
              className="slider"
              style={{ '--p': `${budgetPct}%` }}
              onChange={e => update('budget', +e.target.value)} />
            <div className="slider-scale">
              <span>10k</span><span>100k</span><span>250k</span><span>500k DH</span>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="field">
          <div className="field-label"><span>Disponibilité</span></div>
          <div className="chips">
            {[
              ['fulltime', 'Temps plein'],
              ['parttime', 'Mi-temps'],
              ['weekly',   '1 visite / sem.'],
              ['quarterly','1 visite / 3 mois'],
            ].map(([id, lbl]) => (
              <button key={id} type="button"
                className={`chip ${form.availability === id ? 'active' : ''}`}
                onClick={() => update('availability', id)}>{lbl}</button>
            ))}
          </div>
        </div>

        <div className="submit-row">
          <div className="meta">
            <b>5 agents</b> seront lancés en parallèle · temps moyen <b>~8s</b>
          </div>
          <button className="btn terra" onClick={onSubmit}>
            Analyser mon opportunité
            <svg className="arrow" viewBox="0 0 20 20" fill="none">
              <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

window.Onboarding = Onboarding;
