// P2.5 — Results Display. Real source: GET /jobs/{id} (summary) + /jobs/{id}/buildings (rows).
// jobId → fetch real data; no jobId → Preview badge.
import { useEffect, useState } from 'react';
import { getJob, getJobBuildings } from '../api';

const COLUMNS = [
  { key: 'building_id', label: 'Building', fmt: v => v },
  { key: 'depth_ft', label: 'Depth (ft)', fmt: v => (v ?? 0).toFixed(1) },
  { key: 'dmg_pct_struct', label: 'Struct Dmg %', fmt: v => ((v ?? 0) * 100).toFixed(1) + '%' },
  { key: 'dmg_pct_content', label: 'Content Dmg %', fmt: v => ((v ?? 0) * 100).toFixed(1) + '%' },
  { key: 'bldg_loss_usd', label: 'Bldg Loss', fmt: v => '$' + (v ?? 0).toLocaleString() },
  { key: 'cont_loss_usd', label: 'Cont Loss', fmt: v => '$' + (v ?? 0).toLocaleString() },
];

export default function ResultsTable({ jobId }) {
  const [sortKey, setSortKey] = useState('bldg_loss_usd');
  const [sortAsc, setSortAsc] = useState(false);
  const [state, setState] = useState({ status: jobId ? 'loading' : 'idle', rows: [], summary: null });

  useEffect(() => {
    if (!jobId) return;
    let alive = true;
    setState({ status: 'loading', rows: [], summary: null });
    Promise.all([getJob(jobId), getJobBuildings(jobId)]).then(([j, b]) => {
      if (!alive) return;
      if (!j.ok || !b.ok) { setState({ status: 'error', rows: [], summary: null }); return; }
      const rows = b.data?.data || [];
      const summary = j.data?.data || null;
      setState({ status: rows.length ? 'ready' : 'empty', rows, summary });
    });
    return () => { alive = false; };
  }, [jobId]);

  const rows = state.rows;

  if (!jobId) {
    return (
      <div className="results-table-wrap">
        <div className="demo-banner"><span className="demo-badge">Preview</span>
          <span className="demo-banner-text">Run an analysis (or open a demo scenario) to see building-level results.</span>
        </div>
      </div>
    );
  }
  if (jobId && state.status === 'loading') return <div className="results-table-wrap">Loading job results…</div>;
  if (jobId && state.status === 'error') return <div className="results-table-wrap results-stub-note">Results unavailable — live lookup failed. Add or check your API key.</div>;
  if (jobId && state.status === 'empty') return <div className="results-table-wrap">No building results for this job.</div>;

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey] ?? 0, bv = b[sortKey] ?? 0;
    return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });
  const handleSort = (key) => key === sortKey ? setSortAsc(!sortAsc) : (setSortKey(key), setSortAsc(false));

  const s = state.summary;
  const totalLoss = s?.total_loss_usd ?? sorted.reduce((t, r) => t + (r.bldg_loss_usd ?? 0) + (r.cont_loss_usd ?? 0), 0);
  const count = s?.total_buildings ?? sorted.length;
  const meanDmg = s?.mean_dmg_pct ?? (sorted.reduce((t, r) => t + (r.dmg_pct_struct ?? 0), 0) / (sorted.length || 1));
  const maxDepth = s?.max_depth_ft ?? Math.max(0, ...sorted.map(r => r.depth_ft ?? 0));

  return (
    <div className="results-table-wrap">
      <div className="results-summary">
        <div className="result-stat"><span className="result-stat-label">Buildings</span><span className="result-stat-value">{count.toLocaleString()}</span></div>
        <div className="result-stat"><span className="result-stat-label">Total Loss</span><span className="result-stat-value">${Math.round(totalLoss).toLocaleString()}</span></div>
        <div className="result-stat"><span className="result-stat-label">Mean Damage</span><span className="result-stat-value">{(meanDmg * 100).toFixed(1)}%</span></div>
        <div className="result-stat"><span className="result-stat-label">Max Depth</span><span className="result-stat-value">{maxDepth.toFixed(1)} ft</span></div>
      </div>
      <div className="results-table-container">
        <table className="results-table">
          <thead><tr>{COLUMNS.map(c => (
            <th key={c.key} onClick={() => handleSort(c.key)} className="sortable-th">{c.label} {sortKey === c.key ? (sortAsc ? '↑' : '↓') : ''}</th>
          ))}</tr></thead>
          <tbody>{sorted.map(r => (
            <tr key={r.building_id}>{COLUMNS.map(c => (<td key={c.key}>{c.fmt(r[c.key])}</td>))}</tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
