// P4.4 — Quota Dashboard
import { useAuth } from '../AuthContext';
import { SAMPLE_QUOTA } from '../sampleData';

export default function QuotaDisplay({ demo = false }) {
  const { tier: liveTier, quota: liveQuota, isAuthenticated } = useAuth();

  if (!isAuthenticated && !demo) {
    return (
      <div className="quota-display">
        <h4>API Quota</h4>
        <div className="quota-unauthenticated">
          Set your API key in Settings to view quota usage.
        </div>
      </div>
    );
  }

  const showSample = demo && !isAuthenticated;
  const tier = showSample ? SAMPLE_QUOTA.tier : liveTier;
  const quota = showSample ? SAMPLE_QUOTA : liveQuota;

  const pct = quota.limit ? Math.min(100, ((quota.used || 0) / quota.limit) * 100) : 0;
  const isWarn = pct > 80;

  return (
    <div className="quota-display">
      <h4>API Quota</h4>
      {showSample && (
        <div className="demo-cta">
          Sample quota. Add an API key in <strong>Settings</strong> to view your live usage.
        </div>
      )}
      <div className="quota-stats">
        <div className="result-stat">
          <span className="result-stat-label">Tier</span>
          <span className={`tier-badge tier-${tier}`}>
            {tier === 'pro' ? 'Pro' : 'Free'}
          </span>
        </div>
        <div className="result-stat">
          <span className="result-stat-label">Used Today</span>
          <span className="result-stat-value">{quota.used ?? '-'}</span>
        </div>
        <div className="result-stat">
          <span className="result-stat-label">Daily Limit</span>
          <span className="result-stat-value">{quota.limit ?? '-'}</span>
        </div>
        <div className="result-stat">
          <span className="result-stat-label">Remaining</span>
          <span className={`result-stat-value ${isWarn ? 'quota-warn-text' : ''}`}>
            {quota.remaining ?? '-'}
          </span>
        </div>
      </div>

      {quota.limit !== null && (
        <div className="quota-bar-large">
          <div className="upload-bar">
            <div
              className={`upload-fill ${isWarn ? 'quota-warn-fill' : ''}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="quota-pct">{pct.toFixed(0)}% used</span>
        </div>
      )}
    </div>
  );
}
