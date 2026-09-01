// D5 — Rings of Risk overlay (AI4G SAR recurrence, MODEL_DERIVED_CONTEXT).
// Self-contained map card: fetches by lat/lon, renders KDE ring polygons
// with a severity legend and a provenance footer. Never fabricates
// coverage: outside a loaded AOI it states so explicitly.
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { getRings } from '../api';

const LEVEL_COLORS = {
  Occasional: '#7fb3d5',
  Moderate: '#f7dc6f',
  High: '#f0a05a',
  Severe: '#C6485B',
  Extreme: '#78281f',
};

function ringStyle(feature) {
  const name = feature.properties.level_name;
  return {
    color: LEVEL_COLORS[name] || '#888',
    fillColor: LEVEL_COLORS[name] || '#888',
    fillOpacity: 0.25,
    weight: 1.5,
  };
}

export default function RingsOverlay({ lat, lon }) {
  const [state, setState] = useState({ loading: true, resp: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, resp: null });
    getRings(Number(lat), Number(lon)).then((resp) => {
      if (alive) setState({ loading: false, resp });
    });
    return () => { alive = false; };
  }, [lat, lon]);

  if (state.loading) {
    return <div className="rings-overlay">Loading flood recurrence…</div>;
  }

  const resp = state.resp;
  if (!resp || !resp.ok) {
    return (
      <div className="rings-overlay rings-unavailable">
        <span className="demo-badge">Preview</span>
        Recurrence rings — live coverage pending backend availability.
      </div>
    );
  }

  // API envelope is { data: {...}, meta }; api.js names the body `.data`, so the
  // rings payload lives at resp.data.data (matches FloodReport lookup/zone reads).
  const { coverage, ring_set: ringSet, rings } = resp.data?.data || {};
  if (!coverage) {
    return (
      <div className="rings-overlay rings-no-coverage">
        <span className="demo-badge">Preview</span>
        Recurrence rings not yet computed for this area — live coverage pending.
      </div>
    );
  }

  const levels = [...new Set(rings.features.map((f) => f.properties.level_name))];

  return (
    <div className="rings-overlay">
      <h4>Recurrence Rings — {ringSet.aoi_name}</h4>
      <MapContainer
        center={[lat, lon]}
        zoom={9}
        style={{ height: 320, width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <GeoJSON key={ringSet.ring_set_id} data={rings} style={ringStyle} />
      </MapContainer>
      <div className="rings-legend">
        {levels.map((name) => (
          <span key={name} className="rings-legend-item">
            <span
              className="rings-legend-swatch"
              style={{ backgroundColor: LEVEL_COLORS[name] || '#888' }}
            />
            {name}
          </span>
        ))}
      </div>
      <div className="rings-provenance">
        Source: AI4G Sentinel-1 SAR recurrence 2014–2024 ·{' '}
        {ringSet.derivation_kind} · artifact{' '}
        {(ringSet.artifact_sha256 || '').slice(0, 12) || 'unknown'} — historical context, not a
        flood determination.
      </div>
    </div>
  );
}
