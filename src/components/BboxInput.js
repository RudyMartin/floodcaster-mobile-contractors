// P2.1 — Bbox Input
import { useState, useEffect } from 'react';

const EMPTY = { west: '', south: '', east: '', north: '' };

function validateBbox({ west, south, east, north }) {
  const w = parseFloat(west), s = parseFloat(south);
  const e = parseFloat(east), n = parseFloat(north);
  if ([w, s, e, n].some(isNaN)) return 'All coordinates are required';
  if (w < -180 || w > 180 || e < -180 || e > 180) return 'Longitude must be between -180 and 180';
  if (s < -90 || s > 90 || n < -90 || n > 90) return 'Latitude must be between -90 and 90';
  if (e <= w) return 'East must be greater than West';
  if (n <= s) return 'North must be greater than South';
  const area = (e - w) * (n - s);
  if (area > 4.0) return `Area ${area.toFixed(2)} sq deg exceeds 4.0 sq deg limit`;
  return null;
}

export default function BboxInput({ onBboxChange, initialBbox }) {
  const [coords, setCoords] = useState(EMPTY);
  const [error, setError] = useState(null);

  // Sync from parent when address auto-generates a bbox
  useEffect(() => {
    if (initialBbox && Array.isArray(initialBbox) && initialBbox.length === 4) {
      const [w, s, e, n] = initialBbox;
      const next = {
        west: w.toFixed(4),
        south: s.toFixed(4),
        east: e.toFixed(4),
        north: n.toFixed(4),
      };
      setCoords(next);
      setError(validateBbox(next));
    }
  }, [initialBbox]);

  const update = (field) => (e) => {
    const next = { ...coords, [field]: e.target.value };
    setCoords(next);
    const err = validateBbox(next);
    setError(err);
    if (!err) {
      onBboxChange([parseFloat(next.west), parseFloat(next.south),
                     parseFloat(next.east), parseFloat(next.north)]);
    } else {
      onBboxChange(null);
    }
  };

  const fields = [
    { key: 'west', label: 'West (lon)', placeholder: '-95.5' },
    { key: 'south', label: 'South (lat)', placeholder: '29.5' },
    { key: 'east', label: 'East (lon)', placeholder: '-95.0' },
    { key: 'north', label: 'North (lat)', placeholder: '30.0' },
  ];

  return (
    <div className="bbox-input">
      <h4>Bounding Box</h4>
      <div className="bbox-grid">
        {fields.map(f => (
          <label key={f.key} className="bbox-field">
            <span>{f.label}</span>
            <input
              type="number"
              step="any"
              value={coords[f.key]}
              onChange={update(f.key)}
              placeholder={f.placeholder}
            />
          </label>
        ))}
      </div>
      {error && <div className="bbox-error">{error}</div>}
      {!error && coords.west && (
        <div className="bbox-preview">
          {((parseFloat(coords.east) - parseFloat(coords.west)) *
            (parseFloat(coords.north) - parseFloat(coords.south))).toFixed(3)} sq deg
        </div>
      )}
    </div>
  );
}
