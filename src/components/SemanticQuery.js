// P3.4 — Semantic Query Bar
// Stub: backend semantic query endpoint not yet public.
import { useState } from 'react';

// Stub: classify intent locally by keyword matching
function classifyIntent(text) {
  const t = text.toLowerCase();
  if (t.includes('risk') || t.includes('severe')) return 'CURRENT_RISK';
  if (t.includes('missing') || t.includes('stale')) return 'MISSING_OR_STALE_EVIDENCE';
  if (t.includes('nfhl') || t.includes('exceedance') || t.includes('flood zone')) return 'NFHL_FORECAST_EXCEEDANCE';
  if (t.includes('history') || t.includes('trace') || t.includes('replay')) return 'HISTORICAL_TRACE';
  if (t.includes('public') || t.includes('message') || t.includes('audit')) return 'PUBLIC_MESSAGE_AUDIT';
  return 'UNSUPPORTED';
}

// Mock results for each intent
const MOCK_RESULTS = {
  CURRENT_RISK: [
    { location: 'Houston-Brazos', risk_level: 'SEVERE', crest_margin_ft: 3.2, module_status: 'EXECUTE' },
    { location: 'Houston-Buffalo', risk_level: 'MODERATE', crest_margin_ft: 1.1, module_status: 'EXECUTE' },
  ],
  MISSING_OR_STALE_EVIDENCE: [
    { source: 'Sentinel-1 SAR', status: 'MISSING', last_seen: null, reason: 'Not requested' },
    { source: 'HRRR Precip', status: 'MISSING', last_seen: null, reason: 'Not requested' },
  ],
  NFHL_FORECAST_EXCEEDANCE: [
    { location: 'Houston-Brazos', nfhl_zone: 'AE', in_floodplain: true, forecast_exceeds: true },
  ],
  HISTORICAL_TRACE: [
    { trace_id: 'tr-001', scenario: 'harvey_2017', produced_at: '2017-08-27T14:00:00Z', decisions: 3 },
  ],
  PUBLIC_MESSAGE_AUDIT: [
    { message_id: 'msg-001', text: 'Flood risk is severe...', risk_level: 'SEVERE', issued: '2026-06-17T10:00:00Z' },
  ],
};

export default function SemanticQuery() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [intent, setIntent] = useState(null);
  const [latency, setLatency] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const start = performance.now();
    const classified = classifyIntent(query);
    setIntent(classified);

    if (classified === 'UNSUPPORTED') {
      setResult(null);
      setLatency(Math.round(performance.now() - start));
      return;
    }

    // Stub: simulate network delay
    await new Promise(r => setTimeout(r, 300));
    setResult(MOCK_RESULTS[classified] || []);
    setLatency(Math.round(performance.now() - start));
  };

  return (
    <div className="semantic-query">
      <h4>Governed Query</h4>
      <form className="query-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="query-input"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Which locations have severe flood risk?"
        />
        <button type="submit" className="btn-primary">Query</button>
      </form>

      {intent === 'UNSUPPORTED' && (
        <div className="cert-error" style={{ marginTop: '0.75rem' }}>
          <span className="verdict fail">UNSUPPORTED</span>
          <span>Query not supported. Governed surface rejects unrecognized intents.</span>
        </div>
      )}

      {intent && intent !== 'UNSUPPORTED' && (
        <div className="query-meta">
          <span className="verdict pass">{intent.replace(/_/g, ' ')}</span>
          {latency !== null && <span className="query-latency">{latency}ms</span>}
        </div>
      )}

      {result && result.length > 0 && (
        <div className="results-table-container" style={{ marginTop: '0.75rem' }}>
          <table className="results-table">
            <thead>
              <tr>
                {Object.keys(result[0]).map(k => (
                  <th key={k}>{k.replace(/_/g, ' ')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((v, j) => (
                    <td key={j}>{v === null ? '-' : v === true ? 'Yes' : v === false ? 'No' : String(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="results-stub-note">
        Sample governed query — intent classification runs locally. Live governed
        queries require an API key and backend availability.
      </div>
    </div>
  );
}
