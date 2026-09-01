// P3.2 — RSCT Certificate Panel
// P3.3 — Certificate Verification
import { useState } from 'react';
import { cert as certApi } from '../api';

// Neutral stage labels + public decision triad only — the internal gate names/order
// and the multi-value internal decision set must not ship in the public bundle.
const GATE_NAMES = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4'];

const DECISION_COLORS = {
  EXECUTE: 'pass', CAUTION: 'warn', REFUSE: 'fail',
};

export default function RsctCert({ certificate }) {
  const [verifyState, setVerifyState] = useState(null); // null | 'checking' | 'valid' | 'invalid' | 'unavailable'

  if (!certificate) return null;

  const c = certificate;
  const gateReached = typeof c.gate_reached === 'number' ? c.gate_reached : 4;

  const handleVerify = async () => {
    if (!c.proof) {
      setVerifyState('unavailable');
      return;
    }
    setVerifyState('checking');
    const resp = await certApi.post('/certificates/verify', {
      certificate_id: c.id,
      proof: c.proof,
    }, { auth: true });

    if (!resp.ok) {
      setVerifyState('unavailable');
      return;
    }
    setVerifyState(resp.data?.valid ? 'valid' : 'invalid');
  };

  const copyHash = () => {
    if (c.proof?.signature) {
      navigator.clipboard.writeText(c.proof.signature);
    }
  };

  return (
    <div className="rsct-cert">
      <div className="cert-card-header">
        <h4>RSCT Certificate</h4>
        <span className={`verdict ${DECISION_COLORS[c.decision] || 'warn'}`}>
          {c.decision}
        </span>
      </div>

      {/* Simplex bar */}
      <div className="simplex-bar">
        <div className="simplex-r" style={{ width: `${c.R * 100}%` }}>
          R {(c.R * 100).toFixed(1)}%
        </div>
        <div className="simplex-s" style={{ width: `${(c.S || c.S_sup || 0) * 100}%` }}>
          S {((c.S || c.S_sup || 0) * 100).toFixed(1)}%
        </div>
        <div className="simplex-n" style={{ width: `${c.N * 100}%` }}>
          N {(c.N * 100).toFixed(1)}%
        </div>
      </div>

      {/* Metrics */}
      <div className="cert-metrics">
        <div className="cert-metric">
          <span className="cert-metric-label">kappa_compat</span>
          <span className="cert-metric-value">{(c.kappa_compat || 0).toFixed(4)}</span>
        </div>
        <div className="cert-metric">
          <span className="cert-metric-label">sigma</span>
          <span className="cert-metric-value">{(c.sigma || 0).toFixed(4)}</span>
        </div>
      </div>

      {/* Gate trail */}
      <div className="gate-trail">
        <span className="audit-label">Gate Trail</span>
        <div className="gate-dots">
          {GATE_NAMES.map((name, i) => (
            <div key={name} className={`gate-dot ${i < gateReached ? 'gate-pass' : 'gate-fail'}`}>
              <span className="gate-num">{i + 1}</span>
              <span className="gate-name">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {c.reason && <div className="cert-gate-reason">{c.reason}</div>}

      {/* Proof */}
      {c.proof && (
        <div className="proof-section">
          <span className="audit-label">HMAC Proof</span>
          <div className="proof-row">
            <code className="proof-hash">
              {c.proof.signature ? c.proof.signature.slice(0, 32) + '...' : 'none'}
            </code>
            <button className="btn-secondary btn-sm" onClick={copyHash} title="Copy">Copy</button>
            <button
              className={`btn-secondary btn-sm ${verifyState === 'valid' ? 'btn-verified' : verifyState === 'invalid' ? 'btn-invalid' : ''}`}
              onClick={handleVerify}
              disabled={verifyState === 'checking'}
            >
              {verifyState === 'checking' ? '...' :
               verifyState === 'valid' ? 'Verified' :
               verifyState === 'invalid' ? 'Invalid' :
               verifyState === 'unavailable' ? 'Unavailable' : 'Verify'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
