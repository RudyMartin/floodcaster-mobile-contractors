import { useState } from 'react';
import { signup, getAccount, startCheckout, API_BASE } from '../api';
import { useAuth } from '../AuthContext';
import './Pricing.css';

// Display prices mirror the worker's wrangler vars (docs/COMMERCE_SPEC.md).
// 1 credit = $0.01. Change both together if the inventor retunes pricing.
const FREE_CREDITS = 1000;      // $10 free grant
const FREE_TTL_MONTHS = 6;
const CERT_CREDITS = 125;       // $1.25 per certificate
const CREDIT_CENTS = 1;

const usd = (credits) => `$${((credits * CREDIT_CENTS) / 100).toFixed(2)}`;

// ── One-time "here is your key" panel with a copy-paste quickstart ───────────
function KeyIssued({ apiKey }) {
  const [copied, setCopied] = useState(false);
  const curl = `curl -X POST ${API_BASE}/v1/certificate \\
  -H "X-API-Key: ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"lat": 29.76, "lon": -95.37}'`;

  return (
    <div className="pricing-key">
      <div className="pricing-key-head">
        <strong>Your API key — copy it now, it won't be shown again</strong>
      </div>
      <div className="pricing-key-row">
        <code className="pricing-key-value">{apiKey}</code>
        <button
          className="pricing-btn pricing-btn-ghost"
          onClick={() => { navigator.clipboard?.writeText(apiKey); setCopied(true); }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="pricing-muted">
        You have {FREE_CREDITS.toLocaleString()} free credits ({usd(FREE_CREDITS)}),
        good for {FREE_TTL_MONTHS} months. Each certificate costs {CERT_CREDITS} credits
        ({usd(CERT_CREDITS)}).
      </p>
      <div className="pricing-quickstart">
        <div className="pricing-quickstart-label">Issue your first certificate</div>
        <pre><code>{curl}</code></pre>
      </div>
    </div>
  );
}

// ── Signed-in account readout + upgrade CTA ──────────────────────────────────
function AccountPanel() {
  const { tier } = useAuth();
  const [acct, setAcct] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const refresh = async () => {
    setBusy(true); setErr(null);
    const r = await getAccount();
    setBusy(false);
    if (r.ok) setAcct(r.data.data); else setErr(r.error?.message || 'Could not load account');
  };

  const upgrade = async () => {
    setBusy(true); setErr(null);
    const r = await startCheckout();
    setBusy(false);
    if (r.ok && r.data.data?.checkout_url) window.location.href = r.data.data.checkout_url;
    else setErr(r.error?.message || 'Checkout is not available yet');
  };

  return (
    <div className="pricing-account">
      <div className="pricing-account-row">
        <span className={`tier-badge tier-${tier}`}>{tier === 'pro' ? 'Pro' : 'Free'}</span>
        <button className="pricing-btn pricing-btn-ghost" onClick={refresh} disabled={busy}>
          {busy ? '…' : 'Check credits'}
        </button>
        {tier !== 'pro' && (
          <button className="pricing-btn pricing-btn-primary" onClick={upgrade} disabled={busy}>
            Add a card → go Pro
          </button>
        )}
      </div>
      {acct && (
        <p className="pricing-muted">
          Credits remaining:{' '}
          <strong>
            {acct.credits_remaining === 'unlimited'
              ? 'unlimited (metered)'
              : Number(acct.credits_remaining ?? 0).toLocaleString()}
          </strong>
        </p>
      )}
      {err && <p className="pricing-error">{err}</p>}
    </div>
  );
}

export default function Pricing() {
  const { apiKey, setApiKey } = useAuth();
  const [email, setEmail] = useState('');
  const [issuedKey, setIssuedKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const doSignup = async () => {
    setBusy(true); setErr(null);
    const r = await signup(email);
    setBusy(false);
    if (r.ok && r.data.data?.key) {
      const key = r.data.data.key;
      setIssuedKey(key);
      setApiKey(key);              // persist immediately (localStorage via AuthContext)
    } else {
      setErr(r.error?.message || 'Sign-up failed — please try again');
    }
  };

  const tiers = [
    {
      name: 'Free', price: usd(FREE_CREDITS), cadence: 'in credits, on us',
      blurb: 'Start instantly. No card. Credits expire in 6 months.',
      features: [
        `${FREE_CREDITS.toLocaleString()} credits (${usd(FREE_CREDITS)})`,
        `${CERT_CREDITS} credits per certificate`,
        'Full API + certificate access',
        'No credit card required',
      ],
      cta: 'self',
    },
    {
      name: 'Pro', price: `${usd(CERT_CREDITS)}`, cadence: 'per certificate, pay as you go',
      highlight: true,
      blurb: 'Monthly included allowance, then billed only for what you use.',
      features: [
        'Monthly included credit allowance',
        'Postpaid overage — pay only for usage',
        'Heavy compute (scenario loss, batch)',
        'Card on file via Stripe',
      ],
      cta: 'upgrade',
    },
    {
      name: 'Enterprise', price: 'Custom', cadence: 'invoice / net terms',
      blurb: 'Contracted access for carriers, reinsurers, and lenders.',
      features: [
        'Negotiated quotas + SLA',
        'SSO / mTLS, DPA',
        'Invoice, ACH / wire, net terms',
        'Custom adapters & integration (Solutions)',
      ],
      cta: 'contact',
    },
  ];

  return (
    <div className="pricing-page">
      <header className="pricing-hero">
        <h1>Start free. Pay only for what you use.</h1>
        <p>Governed flood intelligence over a simple API. A key in seconds — no sales call.</p>
      </header>

      <section className="pricing-signup">
        {!apiKey && !issuedKey && (
          <div className="pricing-signup-form">
            <input
              type="email"
              placeholder="you@company.com (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="email"
            />
            <button className="pricing-btn pricing-btn-primary" onClick={doSignup} disabled={busy}>
              {busy ? 'Issuing…' : 'Get a free API key'}
            </button>
          </div>
        )}
        {issuedKey && <KeyIssued apiKey={issuedKey} />}
        {apiKey && !issuedKey && <AccountPanel />}
        {err && <p className="pricing-error">{err}</p>}
      </section>

      <section className="pricing-tiers">
        {tiers.map((t) => (
          <div key={t.name} className={`pricing-tier ${t.highlight ? 'pricing-tier-hot' : ''}`}>
            <div className="pricing-tier-name">{t.name}</div>
            <div className="pricing-tier-price">{t.price}</div>
            <div className="pricing-tier-cadence">{t.cadence}</div>
            <p className="pricing-tier-blurb">{t.blurb}</p>
            <ul>{t.features.map((f) => <li key={f}>{f}</li>)}</ul>
            {t.cta === 'self' && !apiKey && (
              <button className="pricing-btn pricing-btn-primary" onClick={doSignup} disabled={busy}>
                Get started free
              </button>
            )}
            {t.cta === 'self' && apiKey && <div className="pricing-tier-note">You're on Free</div>}
            {t.cta === 'upgrade' && <AccountUpgradeButton />}
            {t.cta === 'contact' && (
              <a className="pricing-btn pricing-btn-ghost" href="/contact">
                Contact sales
              </a>
            )}
          </div>
        ))}
      </section>
      <p className="pricing-foot pricing-muted">
        Prices in credits (1 credit = {CREDIT_CENTS}¢). Enterprise & custom integration are
        contracted — <a href="/contact">talk to Solutions</a>.
      </p>
    </div>
  );
}

// Small dedicated upgrade button so the Pro card can trigger checkout directly.
function AccountUpgradeButton() {
  const { apiKey, tier } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  if (!apiKey) return <div className="pricing-tier-note">Sign up first</div>;
  if (tier === 'pro') return <div className="pricing-tier-note">You're on Pro</div>;
  const go = async () => {
    setBusy(true); setErr(null);
    const r = await startCheckout();
    setBusy(false);
    if (r.ok && r.data.data?.checkout_url) window.location.href = r.data.data.checkout_url;
    else setErr(r.error?.message || 'Checkout not available yet');
  };
  return (
    <>
      <button className="pricing-btn pricing-btn-primary" onClick={go} disabled={busy}>
        {busy ? '…' : 'Upgrade to Pro'}
      </button>
      {err && <p className="pricing-error">{err}</p>}
    </>
  );
}
