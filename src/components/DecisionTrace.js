// P3.5 — Decision Trace Browser
// Stub: renders mock traces until backend exposes retrieval API.
import { useState } from 'react';

const MOCK_TRACES = [
  {
    trace_id: 'tr-20170827-001',
    scenario_id: 'harvey_2017_brazos',
    produced_at: '2017-08-27T14:30:00Z',
    module_id: 'rules_scorer_v1',
    module_status: 'EXECUTE',
    data_hash: 'sha256:3f8a1b...c9d2',
    artifact_hash: 'sha256:7e2c4d...a1f8',
    is_replay: true,
    sources: [
      { name: 'NWS NWPS', type: 'forecast', fetched_at: '2017-08-27T14:00:00Z', hash: 'sha256:aa11...' },
      { name: 'USGS NWIS', type: 'gauge', fetched_at: '2017-08-27T14:15:00Z', hash: 'sha256:bb22...' },
      { name: 'FEMA NFHL', type: 'boundary', fetched_at: '2017-08-27T14:00:00Z', hash: 'sha256:cc33...' },
    ],
    engines: [
      { name: 'crest_margin', version: '0.5.0', output: '3.2 ft' },
      { name: 'nws_severity', version: '0.5.0', output: 'MAJOR' },
      { name: 'rate_of_rise', version: '0.5.0', output: '0.8 ft/hr' },
    ],
    violations: [],
  },
  {
    trace_id: 'tr-20170827-002',
    scenario_id: 'harvey_2017_buffalo',
    produced_at: '2017-08-27T15:00:00Z',
    module_id: 'rules_scorer_v1',
    module_status: 'EXECUTE',
    data_hash: 'sha256:5a9b2c...e3f4',
    artifact_hash: 'sha256:1d6e8f...b5a7',
    is_replay: true,
    sources: [
      { name: 'NWS NWPS', type: 'forecast', fetched_at: '2017-08-27T14:45:00Z', hash: 'sha256:dd44...' },
      { name: 'USGS NWIS', type: 'gauge', fetched_at: '2017-08-27T14:50:00Z', hash: 'sha256:ee55...' },
    ],
    engines: [
      { name: 'crest_margin', version: '0.5.0', output: '1.1 ft' },
      { name: 'nws_severity', version: '0.5.0', output: 'MODERATE' },
    ],
    violations: [{ rule: 'STALE_SOURCE', detail: 'Gauge reading >30min old' }],
  },
];

export default function DecisionTrace() {
  const [expanded, setExpanded] = useState(null);
  const traces = MOCK_TRACES;

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  return (
    <div className="decision-trace">
      <h4>Decision Traces</h4>
      <div className="trace-list">
        {traces.map(t => (
          <div key={t.trace_id} className="trace-item">
            <div className="trace-header" onClick={() => toggle(t.trace_id)}>
              <div className="trace-header-left">
                {t.is_replay && <span className="verdict warn" style={{ marginRight: '0.5rem' }}>REPLAY</span>}
                <span className="trace-scenario">{t.scenario_id}</span>
              </div>
              <div className="trace-header-right">
                <span className={`verdict ${t.module_status === 'EXECUTE' ? 'pass' : 'fail'}`}>
                  {t.module_status}
                </span>
                <code className="trace-time">{t.produced_at}</code>
                <span className="trace-expand">{expanded === t.trace_id ? '-' : '+'}</span>
              </div>
            </div>

            {expanded === t.trace_id && (
              <div className="trace-detail">
                <div className="audit-grid">
                  <span className="audit-label">Trace ID</span>
                  <code>{t.trace_id}</code>
                  <span className="audit-label">Module</span>
                  <code>{t.module_id}</code>
                  <span className="audit-label">Data Hash</span>
                  <code>{t.data_hash}</code>
                  <span className="audit-label">Artifact Hash</span>
                  <code>{t.artifact_hash}</code>
                </div>

                <div className="trace-section">
                  <span className="audit-label">Source Snapshots</span>
                  {t.sources.map(s => (
                    <div key={s.name} className="trace-source-row">
                      <span>{s.name}</span>
                      <code>{s.hash}</code>
                      <span className="trace-time-small">{s.fetched_at}</span>
                    </div>
                  ))}
                </div>

                <div className="trace-section">
                  <span className="audit-label">Engine Records</span>
                  {t.engines.map(e => (
                    <div key={e.name} className="trace-source-row">
                      <span>{e.name} v{e.version}</span>
                      <code>{e.output}</code>
                    </div>
                  ))}
                </div>

                {t.violations.length > 0 && (
                  <div className="trace-section">
                    <span className="audit-label">Violations</span>
                    {t.violations.map((v, i) => (
                      <div key={i} className="cert-gate-reason">{v.rule}: {v.detail}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="demo-banner results-stub-note">
        <span className="demo-badge">Preview</span>
        <span className="demo-banner-text">
          Sample decision traces. Live trace retrieval is not yet available (no backend
          endpoint); tracked in rollout.
        </span>
      </div>
    </div>
  );
}
