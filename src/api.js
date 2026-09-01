// P1.1 — API Client Layer
// Public briefing copy: requests use an explicitly configured mock/test API.
// The default is localhost; do not add production credentials to this repository.

const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.REACT_APP_API_BASE || 'http://localhost:8787';

const STORAGE_KEY = 'floodcaster_api_key';

function getApiKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function setApiKey(key) {
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
}

// ── Demo session token (R-016 T2/T3) ─────────────────────────────────────
// Gated read routes (ADR-074 default-deny: /lookup, /rings, /zone,
// /certificates/lookup, ...) require an issued key. Public site visitors have
// none, so we mint a short-lived, demo-only, revocable token from the public
// /demo/session endpoint (server-side mint; the browser never holds a permanent
// key). Cached in memory until just before expiry. Mirrors the explorer pattern.
let _demoTok = null;   // { key, exp } — exp is epoch ms

async function getDemoToken() {
  const now = Date.now();
  if (_demoTok && _demoTok.key && now < _demoTok.exp) return _demoTok.key;
  try {
    const resp = await fetch(`${API_BASE}/demo/session`, { method: 'GET' });
    if (!resp.ok) return '';
    const b = await resp.json();
    const d = (b && b.data) || {};
    if (!d.key) return '';
    const ttlMs = (Number(d.expires_in) || 3600) * 1000;
    // Renew 60s before actual expiry to avoid a mid-request 403.
    _demoTok = { key: d.key, exp: now + ttlMs - 60000 };
    return d.key;
  } catch {
    return '';
  }
}

async function request(path, options = {}) {
  const { method = 'GET', body, auth = false, authType = 'flood', demo = false, timeout = 15000 } = options;
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const key = getApiKey();
    if (!key) {
      return {
        ok: false,
        status: 0,
        error: { code: 'NO_API_KEY', message: 'API key required. Add your key in Settings.' },
        data: null,
        headers: {},
      };
    }
    if (authType === 'cert') {
      headers['X-RapidAPI-Key'] = key;
    } else {
      headers['X-API-Key'] = key;
    }
  } else if (demo) {
    // Prefer a user-supplied key (real customer); else fall back to a demo token.
    const key = getApiKey() || await getDemoToken();
    if (key) headers['X-API-Key'] = key;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const resp = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    const quotaHeaders = {
      quotaLimit: resp.headers.get('X-Quota-Limit-Day'),
      quotaUsed: resp.headers.get('X-Quota-Used-Day'),
      quotaRemaining: resp.headers.get('X-Quota-Remaining-Day'),
    };

    if (!resp.ok) {
      let error;
      try {
        const body = await resp.json();
        error = body.error || body.detail || { code: `HTTP_${resp.status}`, message: resp.statusText };
      } catch {
        error = { code: `HTTP_${resp.status}`, message: resp.statusText || 'Request failed' };
      }
      return { ok: false, status: resp.status, error, data: null, headers: quotaHeaders };
    }

    const data = await resp.json();
    return { ok: true, status: resp.status, error: null, data, headers: quotaHeaders };
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return {
        ok: false, status: 0,
        error: { code: 'TIMEOUT', message: 'Request timed out' },
        data: null, headers: {},
      };
    }
    return {
      ok: false, status: 0,
      error: { code: 'NETWORK_ERROR', message: err.message || 'Network error' },
      data: null, headers: {},
    };
  }
}

const cert = {
  get: (path, opts) => request(path, { ...opts, method: 'GET', authType: 'cert' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body, authType: 'cert' }),
};

const flood = {
  get: (path, opts) => request(path, { ...opts, method: 'GET', authType: 'flood' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body, authType: 'flood' }),
};

// ── Self-serve commerce (COMMERCE_SPEC.md) ───────────────────────────────
// Databento-style adoption: sign up -> get a base key (free credits) -> use ->
// add a card to go Pro. The key is returned ONCE by /v1/signup; the caller must
// surface + store it (setApiKey) immediately.
async function signup(email) {
  return request('/v1/signup', { method: 'POST', body: email ? { email } : {} });
}

// tier + remaining credits for the stored key (X-API-Key plane).
function getAccount() {
  return request('/v1/account', { auth: true, authType: 'flood' });
}

// Start a Stripe Checkout to upgrade base -> pro; returns { checkout_url }.
function startCheckout() {
  return request('/v1/billing/checkout', { method: 'POST', auth: true, authType: 'flood' });
}

// Issue a certificate (metered: draws credits on base, billed on pro).
function issueCertificate(body) {
  return request('/v1/certificate', { method: 'POST', body, auth: true, authType: 'flood' });
}

// D5 — Rings of Risk (AI4G recurrence, MODEL_DERIVED_CONTEXT). Gated (ADR-074) -> demo token.
function getRings(lat, lon) {
  return request(`/rings?lat=${lat}&lon=${lon}`, { demo: true });
}

// D6 — Certificate history for a location. Gated (ADR-074) -> demo token.
function getCertificateHistory(lat, lon, radius = 100) {
  return request(`/certificates/lookup?lat=${lat}&lon=${lon}&radius=${radius}`, { demo: true });
}

// P2.5 / jobs — real job summary + building-level results. Gated read plane -> demo token.
function getJob(jobId) {
  return request(`/jobs/${jobId}`, { demo: true });
}

function getJobBuildings(jobId, limit = 500) {
  return request(`/jobs/${jobId}/buildings?limit=${limit}`, { demo: true });
}

export { cert, flood, getApiKey, setApiKey, getDemoToken, API_BASE, STORAGE_KEY, getRings, getCertificateHistory, getJob, getJobBuildings, signup, getAccount, startCheckout, issueCertificate };
