// TweaksPanel — floating dev controls overlay

const { useState, useCallback } = React;

function useTweaks(defaults) {
  const [tweaks, setTweaks] = useState(defaults);
  const setTweak = useCallback((key, value) => {
    setTweaks(prev => ({ ...prev, [key]: value }));
  }, []);
  return [tweaks, setTweak];
}

function TweaksPanel({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
      fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
    }}>
      {open && (
        <div style={{
          background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
          padding: '12px 14px', marginBottom: 8, minWidth: 220,
          color: '#e5e5e5', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 10, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: 10 }}>
            {title}
          </div>
          {children}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: open ? 'rgba(255,255,255,0.15)' : 'rgba(10,10,10,0.85)',
          border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8,
          color: '#fff', cursor: 'pointer', padding: '6px 12px',
          fontSize: 11, fontFamily: 'inherit', display: 'block', marginLeft: 'auto',
        }}
      >
        {open ? '✕ Fermer' : '⚙ Tweaks'}
      </button>
    </div>
  );
}

function TweakSection({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {children}
      </div>
    </div>
  );
}

function TweakRadio({ label, options, value, onChange }) {
  return (
    <div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              background: value === opt.value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.08)',
              color: value === opt.value ? '#000' : '#ccc',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 5, padding: '3px 8px', cursor: 'pointer',
              fontSize: 10, fontFamily: 'inherit',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TweakSlider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.6)', fontSize: 10, marginBottom: 3 }}>
        <span>{label}</span>
        <span style={{ color: '#fff' }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#fff' }}
      />
    </div>
  );
}

function TweakButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 5, color: '#ccc', cursor: 'pointer', padding: '5px 8px',
        fontSize: 10, fontFamily: 'inherit', textAlign: 'left', width: '100%',
      }}
    >
      {label}
    </button>
  );
}
