// D6 — Certificate history for an address (durable registry lookup).
// Summary rows only; full payload and verification stay on the existing
// P3.2/P3.3 certificate flow (GET /certificates/{id} + verify).
import { useEffect, useState } from 'react';
import { getCertificateHistory } from '../api';

export default function CertHistory({ lat, lon }) {
  const [resp, setResp] = useState(null);

  useEffect(() => {
    let alive = true;
    getCertificateHistory(Number(lat), Number(lon)).then((r) => { if (alive) setResp(r); });
    return () => { alive = false; };
  }, [lat, lon]);

  if (!resp) return <div className="cert-history">Loading certificate history…</div>;
  if (!resp.ok) {
    return (
      <div className="cert-history">
        <span className="demo-badge">Preview</span>
        Certificate history — live lookup pending backend availability.
      </div>
    );
  }

  // API envelope is { data: {...}, meta }; payload lives at resp.data.data.
  const certs = resp.data?.data?.certificates || [];
  if (certs.length === 0) {
    return (
      <div className="cert-history">
        No certificates issued for this location.
      </div>
    );
  }

  return (
    <div className="cert-history">
      <h3>Certificate History</h3>
      <table className="cert-history-table">
        <thead>
          <tr>
            <th>ID</th><th>Kind</th><th>Outcome</th>
            <th>Issued</th><th>Anchor</th>
          </tr>
        </thead>
        <tbody>
          {certs.map((c) => (
            <tr key={c.certificate_id}>
              <td>
                <code>{c.certificate_id.slice(0, 13)}</code>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() =>
                    navigator.clipboard.writeText(c.certificate_id)
                  }
                >
                  copy
                </button>
              </td>
              <td>{c.cert_kind}</td>
              <td>{c.decision || c.verdict || '—'}</td>
              <td>{new Date(c.issued_at).toLocaleDateString()}</td>
              <td>{c.anchor_ref ? `anchored ${c.anchor_ref.slice(0, 10)}` : 'not anchored'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
