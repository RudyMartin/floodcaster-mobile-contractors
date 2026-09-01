// B4 — Map view (Leaflet + OpenStreetMap)
// Shows bbox rectangle and building markers colored by loss.
import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, CircleMarker, Popup, useMap } from 'react-leaflet';
import { flood } from '../api';
import 'leaflet/dist/leaflet.css';

const LOSS_COLORS = [
  { threshold: 0,      color: '#46A06B' },  // green — no/low loss
  { threshold: 10000,  color: '#a8e05f' },
  { threshold: 50000,  color: '#D4A017' },  // amber — moderate
  { threshold: 100000, color: '#C6485B' },  // red — high
  { threshold: 500000, color: '#8b0000' },  // dark red — severe
];

function lossColor(usd) {
  if (usd == null) return '#8A867E';
  for (let i = LOSS_COLORS.length - 1; i >= 0; i--) {
    if (usd >= LOSS_COLORS[i].threshold) return LOSS_COLORS[i].color;
  }
  return LOSS_COLORS[0].color;
}

function formatUSD(v) {
  if (v == null) return '-';
  return '$' + v.toLocaleString();
}

// Auto-fit map to bbox when it changes
function FitBounds({ bbox }) {
  const map = useMap();
  useEffect(() => {
    if (!bbox) return;
    const [west, south, east, north] = bbox;
    map.fitBounds([[south, west], [north, east]], { padding: [30, 30] });
  }, [bbox, map]);
  return null;
}

export default function MapView({ bbox, jobId }) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch buildings when a completed job ID is provided
  useEffect(() => {
    if (!jobId) {
      setBuildings([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Gated read (ADR-074 R-016 T2): attach a demo token (or the user's own key).
    flood.get(`/jobs/${jobId}/buildings`, { demo: true }).then(resp => {
      if (cancelled) return;
      setLoading(false);
      if (resp.ok && resp.data?.data?.buildings) {
        setBuildings(resp.data.data.buildings);
      } else {
        setError(resp.error?.message || 'Failed to load buildings');
      }
    });

    return () => { cancelled = true; };
  }, [jobId]);

  const center = useMemo(() => {
    if (!bbox) return [29.75, -95.35]; // Houston default
    return [(bbox[1] + bbox[3]) / 2, (bbox[0] + bbox[2]) / 2];
  }, [bbox]);

  const bboxBounds = useMemo(() => {
    if (!bbox) return null;
    return [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];
  }, [bbox]);

  return (
    <div className="map-view">
      <div className="map-header">
        <h4>Map</h4>
        {loading && <span className="map-loading">Loading buildings...</span>}
        {buildings.length > 0 && (
          <span className="map-count">{buildings.length} buildings</span>
        )}
        {error && <span className="map-error">{error}</span>}
      </div>
      <div className="map-container">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', borderRadius: '6px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {bbox && <FitBounds bbox={bbox} />}
          {bboxBounds && (
            <Rectangle
              bounds={bboxBounds}
              pathOptions={{
                color: '#5AA9DE',
                weight: 2,
                fillColor: '#5AA9DE',
                fillOpacity: 0.08,
                dashArray: '6 4',
              }}
            />
          )}
          {buildings.map((b, i) => {
            if (b.lat == null || b.lon == null) return null;
            const totalLoss = (b.bldg_loss_usd || 0) + (b.cont_loss_usd || 0);
            return (
              <CircleMarker
                key={b.building_id || i}
                center={[b.lat, b.lon]}
                radius={6}
                pathOptions={{
                  color: lossColor(totalLoss),
                  fillColor: lossColor(totalLoss),
                  fillOpacity: 0.85,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <strong>{b.building_id || `Building ${i + 1}`}</strong>
                    <div>Depth: {b.depth_ft != null ? b.depth_ft.toFixed(1) + ' ft' : '-'}</div>
                    <div>Bldg Loss: {formatUSD(b.bldg_loss_usd)}</div>
                    <div>Content Loss: {formatUSD(b.cont_loss_usd)}</div>
                    <div>Total: {formatUSD(totalLoss)}</div>
                    {b.jrc_occurrence_mean != null && (
                      <div>JRC Water: {(b.jrc_occurrence_mean * 100).toFixed(0)}%</div>
                    )}
                    {b.deltares_depth_ft_rp100 != null && (
                      <div>Deltares RP100: {b.deltares_depth_ft_rp100.toFixed(1)} ft</div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
      {buildings.length > 0 && (
        <div className="map-legend">
          {LOSS_COLORS.map((c, i) => (
            <div className="legend-item" key={i}>
              <span className="legend-dot" style={{ background: c.color }} />
              <span className="legend-label">
                {c.threshold === 0 ? '<$10k' :
                 c.threshold === 500000 ? '>$500k' :
                 `$${(c.threshold / 1000).toFixed(0)}k`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
