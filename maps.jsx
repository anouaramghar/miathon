// InvestMap Maroc — Leaflet map components
// Real OpenStreetMap tiles for neighborhood + national views

// ─── Berkane local map ───────────────────────────────────────────────────────

const BERKANE_CENTER = [34.9197, -2.3197];

// Bounding box for the abstract SVG → real lat/lng conversion (~2.2km × 2.2km)
const BK_BOUNDS = {
  north: 34.9287, south: 34.9107,
  west:  -2.3307, east:  -2.3087,
};

// The competitor data uses SVG-percentage coordinates (0-100), not real lat/lng.
// This converts them into real-world positions around Berkane center.
function svgToLatLng(pctY, pctX) {
  return [
    BK_BOUNDS.north - (pctY / 100) * (BK_BOUNDS.north - BK_BOUNDS.south),
    BK_BOUNDS.west  + (pctX / 100) * (BK_BOUNDS.east  - BK_BOUNDS.west),
  ];
}

// 6-color harmonized palette — shares hue family with the blue primary
//   Blue   #2563eb — professional services
//   Teal   #0d9488 — food & daily commerce
//   Amber  #d97706 — cafés & boulangeries
//   Rose   #e11d48 — health / pharmacy
//   Violet #7c3aed — retail & lifestyle
//   Slate  #475569 — accommodation & misc
const COMPETITOR_COLORS = {
  'Café':                 '#d97706',  // amber  — food/drink
  'Restaurant':           '#0d9488',  // teal   — food service
  'Boulangerie':          '#d97706',  // amber  — food/drink
  'Épicerie':             '#0d9488',  // teal   — daily commerce
  'Marché Souk':          '#0d9488',  // teal   — daily commerce
  'Pharmacie':            '#e11d48',  // rose   — health
  'Pharmacie (1.8km)':    '#e11d48',  // rose   — health
  'Papeterie':            '#2563eb',  // blue   — professional
  'Coworking':            '#2563eb',  // blue   — professional
  'Magasin vêtements':    '#7c3aed',  // violet — retail
  'Pressing':             '#475569',  // slate  — services
  'Résidence meublée':    '#475569',  // slate  — accommodation
  'Hôtel':                '#475569',  // slate  — accommodation
};

const COMPETITOR_ICONS = {
  'Café':                 '☕',
  'Restaurant':           '🍽',
  'Épicerie':             '🛒',
  'Pharmacie':            '💊',
  'Pharmacie (1.8km)':    '💊',
  'Boulangerie':          '🥖',
  'Magasin vêtements':    '👗',
  'Coworking':            '💼',
  'Résidence meublée':    '🏠',
  'Hôtel':                '🏨',
  'Marché Souk':          '🏪',
  'Papeterie':            '📄',
  'Pressing':             '👔',
};

function NeighborhoodMapLeaflet({ scenario, height = 440 }) {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || el._leaflet_id) return;

    const center = (scenario.neighborhood && scenario.neighborhood.center) || BERKANE_CENTER;

    // Dynamic ±~1.1 km bounding box around the city center
    const latD = 0.009, lngD = 0.011;
    const bounds = {
      north: center[0] + latD, south: center[0] - latD,
      west:  center[1] - lngD, east:  center[1] + lngD,
    };
    const toLatLng = (pctY, pctX) => [
      bounds.north - (pctY / 100) * (bounds.north - bounds.south),
      bounds.west  + (pctX / 100) * (bounds.east  - bounds.west),
    ];

    const map = L.map(el, {
      center,
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 30,
      wheelDebounceTime: 15,
      zoomSnap: 0.5,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 22,
      maxNativeZoom: 19,
      detectRetina: true,
    }).addTo(map);

    // ── Distance rings ──
    [
      { r: 500,  label: '500 m',  opacity: 0.45 },
      { r: 1200, label: '1.2 km', opacity: 0.25 },
    ].forEach(({ r, label, opacity }) => {
      L.circle(center, {
        radius: r,
        color: '#2563eb',
        weight: 1.5,
        dashArray: '5 6',
        fillOpacity: 0,
        opacity,
      }).addTo(map).bindTooltip(label, { direction: 'right', className: 'lf-ring-tip', permanent: false });
    });

    // ── Opportunity gap zone ──
    const gapPos = toLatLng(50, 50);
    const topBiz = (scenario.topRecommendation && scenario.topRecommendation.business) || 'Opportunité';
    const gapLabel = `${topBiz} · vide commercial`;

    L.circle(gapPos, {
      radius: 160,
      color: '#0d9488',
      weight: 2,
      dashArray: '6 4',
      fillColor: '#0d9488',
      fillOpacity: 0.09,
    }).addTo(map)
      .bindTooltip(
        `<span class="lf-gap-inner">VIDE COMMERCIAL &nbsp;·&nbsp; ${gapLabel}</span>`,
        { permanent: true, direction: 'top', className: 'lf-gap-tip', offset: [0, -8] }
      );

    // ── Competitor markers ──
    // Seeded pseudo-random for deterministic but organic placement
    function seedHash(str) {
      let h = 0;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h + str.charCodeAt(i)) | 0;
      }
      return h;
    }
    function seededRand(seed) {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);  // 0..1
    }

    scenario.competitors.forEach(c => {
      if (c.count === 0) return;
      const color = COMPETITOR_COLORS[c.type] || '#555';
      const emoji = COMPETITOR_ICONS[c.type] || '📍';

      if (c.names && c.names.length > 0) {
        // Individual icon markers — organic scatter around base position
        const n = c.names.length;
        const countNote = c.count > n
          ? `parmi ${c.count} dans la zone`
          : 'concurrent actif';

        c.names.forEach((name, i) => {
          // Use name hash for deterministic but natural-looking offsets
          const hash = seedHash(name + c.type + i);
          const r1 = seededRand(hash);
          const r2 = seededRand(hash + 1);
          const r3 = seededRand(hash + 2);

          // Organic distance: varies between 1.5 and 6 pct-units, non-uniform
          const dist = n <= 1 ? 0 : (2.0 + r1 * 4.5);
          // Random angle with slight bias toward street-like directions
          const angle = n <= 1 ? 0 : (r2 * 2 * Math.PI + i * 1.3);
          const offY = n <= 1 ? 0 : Math.cos(angle) * dist * (0.7 + r3 * 0.6);
          const offX = n <= 1 ? 0 : Math.sin(angle) * dist * (0.8 + r3 * 0.5);
          const pos  = toLatLng(c.lat + offY, c.lng + offX);

          const html = `<div class="lf-comp-icon${c.far ? ' far' : ''}" style="background:${color}">${emoji}</div>`;
          const icon = L.divIcon({ className: '', html, iconSize: [28, 28], iconAnchor: [14, 14] });

          L.marker(pos, { icon, opacity: c.far ? 0.55 : 1 })
            .addTo(map)
            .bindTooltip(`<b>${name}</b><span class="lf-tip-sub">${c.type} · ${countNote}</span>`,
              { direction: 'top', className: 'lf-name-tip', offset: [0, -6] })
            .bindPopup(
              `<b>${name}</b><br/><span style="font-size:11px;color:#888">${c.type} · ${countNote}</span>`,
              { maxWidth: 200 }
            );
        });
      } else {
        // Fallback: icon marker with type label — add slight jitter
        const hash = seedHash(c.type);
        const jY = (seededRand(hash) - 0.5) * 2;
        const jX = (seededRand(hash + 1) - 0.5) * 2;
        const pos   = toLatLng(c.lat + jY, c.lng + jX);
        const label = c.count > 1 ? `${c.type} ×${c.count}` : c.type;
        const html  = `<div class="lf-comp-icon${c.far ? ' far' : ''}" style="background:${color}">${emoji}</div>`;
        const icon  = L.divIcon({ className: '', html, iconSize: [28, 28], iconAnchor: [14, 14] });

        L.marker(pos, { icon, opacity: c.far ? 0.55 : 1 })
          .addTo(map)
          .bindTooltip(`<b>${label}</b>`, { direction: 'top', className: 'lf-name-tip', offset: [0, -6] })
          .bindPopup(
            `<b>${c.type}</b><br/><span style="font-size:11px;color:#888">${c.count} établissement${c.count > 1 ? 's' : ''} dans la zone</span>`
          );
      }
    });

    // ── "You" marker ──
    const youHtml = `<div class="lf-you-pin"></div>`;
    const youIcon = L.divIcon({ className: '', html: youHtml, iconSize: [22, 22], iconAnchor: [11, 11] });
    L.marker(center, { icon: youIcon, zIndexOffset: 1000 })
      .addTo(map)
      .bindPopup(`<b style="font-size:13px">${scenario.user.neighborhood}</b><br/><span style="font-size:11px;color:#888">Ton point d'analyse · ${scenario.user.city}</span>`);

    return () => { map.remove(); };
  }, []);

  return (
    <div style={{ position: 'relative', height }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }}/>

      {/* Radar direction badge — overlaid corner chip */}
      {scenario.radarBoost && (
        <div className="lf-radar-badge">
          <span style={{ color: 'var(--terra)', marginRight: 4 }}>↗</span>
          {scenario.radarBoost.shortName} · {scenario.radarBoost.distanceToBerkane} km
          <span className="lf-radar-dot"/>
        </div>
      )}
    </div>
  );
}

// ─── Morocco national map ─────────────────────────────────────────────────────

// Real lat/lng for each project in NATIONAL_PROJECTS (by project id)
const PROJECT_LATLNG = {
  1:  [35.22, -2.92],   // Nador West Med
  2:  [34.21, -4.01],   // Parc éolien Taza
  3:  [30.42, -8.85],   // TGV Marrakech–Agadir (midpoint)
  4:  [35.88, -5.47],   // Tanger Med
  5:  [30.92, -6.90],   // Noor V (Ouarzazate area)
  6:  [35.77, -5.82],   // Renault Tanger (Melloussa)
  7:  [34.26, -6.59],   // Stellantis Kénitra
  8:  [35.75, -5.76],   // Smart City Tanger Tech
  9:  [35.09, -2.23],   // Resort Saïdia
  10: [34.92, -2.32],   // Pôle Agroalimentaire Berkane
  11: [33.61, -7.59],   // Marina Casablanca
  12: [33.37, -7.58],   // Hub aéronautique Mohammed V
  13: [23.72, -15.94],  // Hôpital Dakhla
  14: [30.37, -9.56],   // Hydrogène vert (Agadir area)
  15: [34.68, -1.91],   // Plateforme logistique Oujda
  16: [32.34, -6.35],   // Parc industriel Béni Mellal
  17: [33.53, -5.11],   // Resort Ifrane
  18: [35.59, -5.32],   // Aéroport Tétouan
  19: [34.02, -6.83],   // Campus Med-Tech Rabat
  20: [33.72, -7.38],   // Centrale gaz Mohammedia
};

function MoroccoMapLeaflet({ projects, sectorFilter, onProjectClick, highlight }) {
  const containerRef   = React.useRef(null);
  const mapRef         = React.useRef(null);
  const markersRef     = React.useRef({});
  const onClickRef     = React.useRef(onProjectClick);

  React.useEffect(() => { onClickRef.current = onProjectClick; }, [onProjectClick]);

  // Init map once
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || el._leaflet_id) return;

    const map = L.map(el, {
      zoomControl: true,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 30,
      wheelDebounceTime: 15,
      zoomSnap: 0.5,
      minZoom: 4,
      maxZoom: 14,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 22,
      maxNativeZoom: 19,
      detectRetina: true,
    }).addTo(map);

    // Fit to Morocco bounds (includes Western Sahara projects)
    map.fitBounds([[21.5, -17.5], [36.0, -0.5]]);

    projects.forEach(p => {
      const coords = (p.lat != null && p.lng != null) ? [p.lat, p.lng] : PROJECT_LATLNG[p.id];
      if (!coords) return;
      const sector = window.SECTORS[p.sector] || window.SECTORS.infrastructure;
      const size   = p.featured ? 18 : 12;

      const html = `<div class="lf-proj-dot${p.featured ? ' featured' : ''}" style="width:${size}px;height:${size}px;background:${sector.color};box-shadow:0 0 0 ${p.featured ? 4 : 2}px ${sector.color}40"></div>`;
      const icon = L.divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });

      const amt = p.amount >= 1000 ? `${(p.amount / 1000).toFixed(1)} Mds DH` : `${p.amount} M DH`;
      const phaseHtml = p.phase === 'en_cours'
        ? `<span class="lf-phase en-cours">En cours · ${p.progress}%</span>`
        : `<span class="lf-phase planifie">Planifié · ${p.launch}</span>`;

      const marker = L.marker(coords, { icon }).addTo(map);
      marker.bindPopup(`
        <div class="lf-popup">
          <div class="lf-popup-name">${p.name}</div>
          <div class="lf-popup-sub">${sector.label} · ${p.region}</div>
          <div class="lf-popup-row">${amt}${p.jobs ? ` · ${p.jobs.toLocaleString('fr-FR')} emplois` : ''}</div>
          ${phaseHtml}
        </div>
      `, { maxWidth: 240, className: 'lf-popup-wrap' });

      marker.on('click', () => onClickRef.current && onClickRef.current(p));
      markersRef.current[p.id] = marker;
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // React to sector filter changes
  React.useEffect(() => {
    projects.forEach(p => {
      const m = markersRef.current[p.id];
      if (!m) return;
      const visible = sectorFilter === 'all' || p.sector === sectorFilter;
      m.setOpacity(visible ? 1 : 0.12);
      const el = m.getElement();
      if (el) el.style.pointerEvents = visible ? 'auto' : 'none';
    });
  }, [sectorFilter]);

  // React to highlight changes
  React.useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, m]) => {
      const el = m.getElement();
      if (!el) return;
      const dot = el.querySelector('.lf-proj-dot');
      if (!dot) return;
      const isHighlit = highlight && parseInt(id) === highlight;
      dot.style.transform  = isHighlit ? 'scale(1.6)' : 'scale(1)';
      dot.style.transition = 'transform 200ms';
      dot.style.zIndex     = isHighlit ? '999' : '';
      if (isHighlit) m.openPopup();
    });
  }, [highlight]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }}/>;
}

// ─── Landing page maps (non-interactive, CartoDB Dark tiles) ─────────────────

function LandingMacroMap() {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || el._leaflet_id) return;

    const map = L.map(el, {
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 22,
      maxNativeZoom: 19,
      detectRetina: true,
    }).addTo(map);

    map.fitBounds([[21.5, -17.5], [36.0, -0.5]]);

    (window.NATIONAL_PROJECTS || []).forEach(p => {
      const coords = PROJECT_LATLNG[p.id];
      if (!coords) return;
      const sector = window.SECTORS[p.sector];
      const isNador = p.id === 1;
      const size = isNador ? 14 : 7;
      const cls = isNador ? 'lf-land-dot lf-land-pulse' : 'lf-land-dot';
      const html = `<div class="${cls}" style="width:${size}px;height:${size}px;background:${sector.color}"></div>`;
      const icon = L.divIcon({ className: '', html, iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
      L.marker(coords, { icon, interactive: false }).addTo(map);
    });

    return () => { map.remove(); };
  }, []);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}/>;
}

function LandingMicroMap() {
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || el._leaflet_id) return;

    const map = L.map(el, {
      center: BERKANE_CENTER,
      zoom: 14,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      keyboard: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 22,
      maxNativeZoom: 19,
      detectRetina: true,
    }).addTo(map);

    // Opportunity gap zone
    L.circle(BERKANE_CENTER, {
      radius: 300,
      color: '#6fce8c',
      weight: 1.5,
      dashArray: '5 5',
      fillColor: '#6fce8c',
      fillOpacity: 0.1,
      interactive: false,
    }).addTo(map);

    // Two competitor icon pins
    [
      { type: 'Café', pctY: 38, pctX: 32 },
      { type: 'Épicerie', pctY: 64, pctX: 68 },
    ].forEach(({ type, pctY, pctX }) => {
      const pos   = svgToLatLng(pctY, pctX);
      const color = COMPETITOR_COLORS[type] || '#555';
      const emoji = COMPETITOR_ICONS[type] || '📍';
      const html  = `<div class="lf-comp-icon" style="background:${color}">${emoji}</div>`;
      const icon  = L.divIcon({ className: '', html, iconSize: [28, 28], iconAnchor: [14, 14] });
      L.marker(pos, { icon, interactive: false }).addTo(map);
    });

    // "You" pulsing dot
    const youHtml = `<div class="lf-you-pin"></div>`;
    const youIcon = L.divIcon({ className: '', html: youHtml, iconSize: [18, 18], iconAnchor: [9, 9] });
    L.marker(BERKANE_CENTER, { icon: youIcon, interactive: false }).addTo(map);

    return () => { map.remove(); };
  }, []);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}/>;
}

window.NeighborhoodMapLeaflet = NeighborhoodMapLeaflet;
window.MoroccoMapLeaflet = MoroccoMapLeaflet;
window.LandingMacroMap = LandingMacroMap;
window.LandingMicroMap = LandingMicroMap;
