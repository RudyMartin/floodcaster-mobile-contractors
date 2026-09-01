// P3.1 — Evidence Certificate Panel
// Renders EvidenceCertificate from job results.
// Stub data until backend includes certificate in /run response.

const STATUS_COLORS = {
  AVAILABLE: 'pass', HIGH: 'pass', DETECTED: 'pass', ACTIVE: 'pass',
  ASSUMED: 'warn', LOW: 'warn', STALE: 'warn',
  MISSING: 'fail', UNAVAILABLE: 'fail',
};

const VERDICT_COLORS = {
  TRUST: 'pass', REVIEW: 'warn', ESCALATE: 'fail', SUPPRESS: 'suppress',
};

// Mock certificate until backend delivers real one
const MOCK_CERT = {
  verdict: 'TRUST',
  reason: 'All critical and supporting layers present',
  public_message: 'An estimated 1,234 buildings may be affected, with potential damage of $12.5M. This estimate is supported by multiple data sources.',
  layers: [
    { role: 'SCENARIO_HAZARD', status: 'AVAILABLE', source: 'deltares-floods', detail: 'RP=100yr, DEM=NASADEM, res=90m' },
    { role: 'TERRAIN_CORRECTION', status: 'AVAILABLE', source: 'cop-dem-glo-30', detail: 'median=15.2m' },
    { role: 'HISTORICAL_PLAUSIBILITY', status: 'HIGH', source: 'jrc-gsw', detail: '15.3% pixels historically wet' },
    { role: 'LIVE_CONFIRMATION', status: 'MISSING', source: null, detail: 'Sentinel-1 SAR not requested' },
    { role: 'RAINFALL_DRIVER', status: 'MISSING', source: null, detail: 'HRRR not requested' },
    { role: 'EXPOSURE', status: 'AVAILABLE', source: 'overture', detail: 'Overture Maps 2026-05-20.0' },
    { role: 'VULNERABILITY', status: 'ASSUMED', source: 'hazus', detail: 'FEMA HAZUS depth-damage curves' },
  ],
  data_hash: 'sha256:a1b2c3d4e5f6...7890',
};

export default function EvidenceCert({ certificate }) {
  const cert = certificate || MOCK_CERT;

  return (
    <div className="evidence-cert">
      <div className="evidence-header">
        <h4>Evidence Certificate</h4>
        <span className={`verdict ${VERDICT_COLORS[cert.verdict] || 'warn'}`}>
          {cert.verdict}
        </span>
      </div>
      <p className="evidence-reason">{cert.reason}</p>

      <div className="layer-table">
        {cert.layers.map(l => (
          <div className="layer-row" key={l.role}>
            <span className={`verdict ${STATUS_COLORS[l.status] || 'warn'}`}>
              {l.status}
            </span>
            <span className="layer-role">{l.role.replace(/_/g, ' ')}</span>
            <span className="layer-detail">
              {l.source && <code>{l.source}</code>}
              {l.detail && <span className="layer-detail-text">{l.detail}</span>}
            </span>
          </div>
        ))}
      </div>

      {cert.public_message && (
        <div className="evidence-public-msg">
          <span className="audit-label">Public Message</span>
          <p>{cert.public_message}</p>
        </div>
      )}

      {cert.data_hash && (
        <div className="evidence-hash">
          <span className="audit-label">Data Hash</span>
          <code>{cert.data_hash}</code>
        </div>
      )}

      {!certificate && (
        <div className="demo-banner results-stub-note">
          <span className="demo-badge">Preview</span>
          <span className="demo-banner-text">
            Sample layout — this is <strong>not a real certificate</strong>. Evidence certificates
            are emitted per analysis job; wiring is pending a backend field (tracked in rollout).
          </span>
        </div>
      )}
    </div>
  );
}
