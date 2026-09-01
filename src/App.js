import { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import './App.css';
import { cert, API_BASE } from './api';
import { AuthProvider, useAuth } from './AuthContext';

import ErrorBoundary from './components/ErrorBoundary';

// Address search
import AddressSearch from './components/AddressSearch';

// Phase 2 components
import BboxInput from './components/BboxInput';
import RasterUpload from './components/RasterUpload';
import JobRunner from './components/JobRunner';
import ResultsTable from './components/ResultsTable';
import MapView from './components/MapView';
import FloodReport from './components/FloodReport';

// Phase 3 components
import EvidenceCert from './components/EvidenceCert';
import RsctCert from './components/RsctCert';
import SemanticQuery from './components/SemanticQuery';
import DecisionTrace from './components/DecisionTrace';

// Phase 4 components
import CertifyPlayground from './components/CertifyPlayground';
import BatchUpload from './components/BatchUpload';
import QuotaDisplay from './components/QuotaDisplay';

// Demo Mode
import DemoBanner from './components/DemoBanner';
import { SAMPLE_RSCT_CERT } from './sampleData';

// Self-serve commerce (COMMERCE_SPEC.md)
import Pricing from './components/Pricing';

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

// Health envelope is { data: { status }, meta } — status lives at resp.data.data.status,
// not resp.data.status (same {data,meta} unwrap as the other reads).
export function apiStatusFrom(resp) {
  return resp?.ok && resp.data?.data?.status === 'healthy' ? 'online' : 'offline';
}

function AppShell() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    cert.get('/health').then(resp => setApiStatus(apiStatusFrom(resp)));
  }, []);

  return (
    <div className="app">
      <Nav apiStatus={apiStatus} />
      <Routes>
        <Route path="/" element={<HomePage apiStatus={apiStatus} />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/account" element={<Pricing />} />
        <Route path="/governance" element={<RequireAuth><GovernancePage /></RequireAuth>} />
        <Route path="/tools" element={<RequireAuth><ToolsPage /></RequireAuth>} />
      </Routes>
      <Footer />
    </div>
  );
}

// ── Nav ─────────────────────────────────────────────────────────────────────

// Governed demo panels (Governance/Tools) require auth — they surface certification
// internals that must not render to anonymous visitors on a public branded domain.
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

function Nav({ apiStatus }) {
  const { tier, isAuthenticated } = useAuth();
  const [showSettings, setShowSettings] = useState(false);

  const tabs = [
    { key: 'home', label: 'Zone Governance', path: '/' },
    { key: 'analysis', label: 'Building Loss', path: '/analysis' },
    { key: 'pricing', label: 'Pricing', path: '/pricing' },
    { key: 'governance', label: 'Certificates', path: '/governance', requiresTier: true },
    { key: 'tools', label: 'Tools', path: '/tools', requiresTier: true },
  ];

  return (
    <nav className="nav">
      <a href="https://floodcaster.com/" className="nav-brand">
        <img src="/favicon.svg" alt="" className="nav-logo" width="28" height="28" />
        <h1>Floodcaster</h1>
        <span>Intelligence</span>
      </a>
      <div className="nav-tabs">
        {tabs.filter(t => !t.requiresTier || isAuthenticated).map(t => (
          <NavLink
            key={t.key}
            to={t.path}
            end={t.path === '/'}
            className={({ isActive }) => `nav-tab ${isActive ? 'nav-tab-active' : ''}`}
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <div className="nav-right">
        {tier !== 'unauthenticated' && (
          <span className={`tier-badge tier-${tier}`}>
            {tier === 'pro' ? 'Pro' : 'Free'}
          </span>
        )}
        <div className="nav-status">
          <div className={`status-dot ${apiStatus}`} />
          <span>API {apiStatus}</span>
        </div>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="API Settings"
        >
          Settings
        </button>
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </nav>
  );
}

// ── Settings Panel (P1.2 Auth UI) ───────────────────────────────────────────

function SettingsPanel({ onClose }) {
  const { apiKey, setApiKey, clearApiKey, tier, quota } = useAuth();
  const [input, setInput] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setApiKey(input.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={e => e.stopPropagation()}>
        <div className="settings-header">
          <h3>API Settings</h3>
          <button className="settings-close" onClick={onClose}>x</button>
        </div>

        <form onSubmit={handleSave}>
          <label className="settings-label">
            <span>API Key</span>
            <input
              type="password"
              className="settings-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter your API key"
              autoComplete="off"
            />
          </label>
          <div className="settings-actions">
            <button type="submit" className="btn-primary">
              {saved ? 'Saved' : 'Save'}
            </button>
            {apiKey && (
              <button type="button" className="btn-secondary" onClick={() => {
                clearApiKey();
                setInput('');
              }}>
                Clear Key
              </button>
            )}
          </div>
        </form>

        <div className="settings-status">
          <div className="settings-row">
            <span>Tier</span>
            <span className={`tier-badge tier-${tier}`}>
              {tier === 'unauthenticated' ? 'Not connected' : tier === 'pro' ? 'Pro' : 'Free'}
            </span>
          </div>
          {quota.limit !== null && (
            <>
              <div className="settings-row">
                <span>Daily quota</span>
                <span>{quota.used} / {quota.limit}</span>
              </div>
              <div className="quota-bar">
                <div
                  className={`quota-fill ${quota.remaining !== null && quota.limit && (quota.used / quota.limit) > 0.8 ? 'quota-warn' : ''}`}
                  style={{ width: `${Math.min(100, ((quota.used || 0) / (quota.limit || 1)) * 100)}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Home Page ──────────────────────────────────────────────────────────────

function HomePage({ apiStatus }) {
  return (
    <>
      <Hero />
      <Constructs />
      <ForecastEngines />
      <Pipeline />
      <CertInspector />
      <ApiSection apiStatus={apiStatus} />
    </>
  );
}

// ── Analysis Page (Phase 2: Free Tier) ────────────────────────────────────

function AnalysisPage() {
  const [bbox, setBbox] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [rasterKey, setRasterKey] = useState(null);
  const [jobResult, setJobResult] = useState(null);

  const handleAddressSelect = (result) => {
    setSelectedAddress(result);
    // Auto-generate ~0.02° bbox around the address (~2km)
    const buffer = 0.01;
    setBbox([
      result.lon - buffer,
      result.lat - buffer,
      result.lon + buffer,
      result.lat + buffer,
    ]);
  };

  const completedJobId = jobResult?.job_id || null;

  return (
    <div className="page-content">
      <h2 className="page-title">Flood Loss Analysis</h2>
      <p className="page-desc">
        Search an address or define a study area, upload a flood depth raster, and run HAZUS-based loss estimation.
      </p>

      <div className="analysis-layout">
        <div className="analysis-inputs">
          <AddressSearch onSelect={handleAddressSelect} />

          {selectedAddress && (
            <div className="address-selected">
              <span className="address-selected-label">Location</span>
              <span className="address-selected-name">{selectedAddress.display_name}</span>
              <span className="address-selected-coords">
                {selectedAddress.lat.toFixed(4)}, {selectedAddress.lon.toFixed(4)}
              </span>
            </div>
          )}

          {selectedAddress && (
            <ErrorBoundary label="Flood report">
              <FloodReport
                lat={selectedAddress.lat}
                lon={selectedAddress.lon}
                address={selectedAddress.display_name}
              />
            </ErrorBoundary>
          )}

          <BboxInput onBboxChange={setBbox} initialBbox={bbox} />
          <RasterUpload onRasterKey={setRasterKey} />
          <JobRunner bbox={bbox} rasterKey={rasterKey} onResults={setJobResult} />
        </div>

        <div className="analysis-map-panel">
          <ErrorBoundary label="Map">
            <MapView bbox={bbox} jobId={completedJobId} />
          </ErrorBoundary>
        </div>
      </div>

      {(completedJobId || import.meta.env.VITE_DEMO_JOB_ID) && (
        <div className="analysis-results">
          <ResultsTable jobId={completedJobId || import.meta.env.VITE_DEMO_JOB_ID} />
        </div>
      )}
    </div>
  );
}

// ── Governance Page (Phase 3: Paid Tier) ──────────────────────────────────

function GovernancePage() {
  const { demoMode } = useAuth();
  const [tab, setTab] = useState('evidence');

  const tabs = [
    { key: 'evidence', label: 'Evidence Certificate' },
    { key: 'rsct', label: 'RSCT Certificate' },
    { key: 'query', label: 'Governed Query' },
    { key: 'traces', label: 'Decision Traces' },
  ];

  return (
    <div className="page-content">
      <h2 className="page-title">Certificate Governance</h2>
      {demoMode && (
        <DemoBanner>
          Preview of the certificate-governed workflow with sample data. Add an
          API key in <strong>Settings</strong> to certify live job results,
          run governed queries, and retrieve real decision traces.
        </DemoBanner>
      )}
      <div className="sub-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tab === 'evidence' && <EvidenceCert />}
        {tab === 'rsct' && <RsctCertDemo />}
        {tab === 'query' && <SemanticQuery />}
        {tab === 'traces' && <DecisionTrace />}
      </div>
    </div>
  );
}

// Wrapper to preview RsctCert with sample data
function RsctCertDemo() {
  return (
    <div>
      <RsctCert certificate={SAMPLE_RSCT_CERT} />
      <div className="results-stub-note" style={{ marginTop: '0.75rem' }}>
        Sample RSCT certificate. Use the Certify Playground with an API key for live results.
      </div>
    </div>
  );
}

// ── Tools Page (Phase 4: Power User) ──────────────────────────────────────

function ToolsPage() {
  const { demoMode } = useAuth();
  const [tab, setTab] = useState('playground');

  const tabs = [
    { key: 'playground', label: 'Certify Playground' },
    { key: 'batch', label: 'Batch Upload' },
    { key: 'quota', label: 'Quota' },
  ];

  return (
    <div className="page-content">
      <h2 className="page-title">Power User Tools</h2>
      {demoMode && (
        <DemoBanner>
          Preview of the certification tools with sample results. Add an API key
          in <strong>Settings</strong> to certify your own text, run batch jobs,
          and view live quota.
        </DemoBanner>
      )}
      <div className="sub-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'tab-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {tab === 'playground' && <CertifyPlayground demo={demoMode} />}
        {tab === 'batch' && <BatchUpload demo={demoMode} />}
        {tab === 'quota' && <QuotaDisplay demo={demoMode} />}
      </div>
    </div>
  );
}

// ── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="hero">
      <h2>
        Governed{' '}
        <span className="highlight">Flood Intelligence</span>
      </h2>
      <p>
        Estimate building-level flood losses with HAZUS damage curves. Governed,
        auditable, keyed -- every determination is replayable, with evidence
        provenance that shows <em>why</em> an answer should be trusted.
      </p>
    </section>
  );
}

// ── Constructs ──────────────────────────────────────────────────────────────

// Deployed geo_cert engine's certifiable targets (source: yrsn-train
// apps/geo_cert/models/v2/train_and_export_v2.py SUPPORTED_TASK_NAMES minus
// policy-refused UNSUPPORTED_TASKS). Flood targets (flood_sfha, flood_loss_rate,
// flood_event_rate) join this list when geo_cert_flood_v1 ships (R-080).
const SUPPORTED_GEO_TARGETS = [
  'elevation', 'home_value', 'population_density', 'night_lights', 'tree_cover',
  'annual_checkup', 'arthritis', 'asthma', 'bp_medicated', 'cancer',
  'chronic_kidney_disease', 'copd', 'coronary_heart_disease', 'diabetes',
  'high_blood_pressure', 'high_cholesterol', 'mental_health_not_good', 'obesity',
  'physical_health_not_good', 'physical_inactivity', 'smoking', 'stroke',
];

function Constructs() {
  const constructs = [
    { name: 'JRC Surface Water', desc: 'Satellite-observed historical water presence (Pekel et al. 2016)', status: 'live' },
    { name: 'Deltares Depth', desc: 'Physics-based modeled inundation at return periods (Ward et al. 2020)', status: 'live' },
    { name: 'FEMA Flood Zones', desc: 'Regulatory exposure designations from FIRMs', status: 'coming' },
    { name: 'FAST/Hazus Damage', desc: 'Engineering damage model with structural vulnerability', status: 'live' },
    { name: 'NFIP Claims', desc: 'Administrative insurance loss reflecting uptake behavior', status: 'coming' },
  ];

  return (
    <section className="constructs">
      <h3>Five Incompatible Flood Constructs</h3>
      <div className="construct-grid">
        {constructs.map(c => (
          <div className={`construct-card ${c.status === 'coming' ? 'construct-coming' : ''}`} key={c.name}>
            <div className="construct-header">
              <h4>{c.name}</h4>
              <span className={`construct-status construct-status-${c.status}`}>
                {c.status === 'live' ? 'Live' : 'Coming soon'}
              </span>
            </div>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Forecast Engines ────────────────────────────────────────────────────────
// Dynamic hydrology engines consumed as governed spokes — a different axis from
// the five constructs (risk-measurement surfaces). Badges are claims: a tile
// flips to Live only when its adapter answers through a served endpoint.

function ForecastEngines() {
  const engines = [
    {
      name: 'NWS / USGS Gauge Forecasts',
      desc: 'Observed stage and forecast crest adapters; crest-margin math is live on the MCP tool surface today.',
      status: 'coming',
    },
    {
      name: 'Google Riverine (ME-LSTM)',
      desc: 'The open-sourced Flood Hub engine (Apache 2.0) — daily river flow from static basin features + multi-source weather.',
      status: 'coming',
    },
    {
      name: 'NWM + Learned Error Correction',
      desc: 'Hybrid physics + AI over NOAA’s National Water Model — reducible vs irreducible error, certified per forecast (Tran et al., AGU Advances 2025).',
      status: 'coming',
    },
    {
      name: 'Flash Flood 24h',
      desc: '24-hour flash-flood risk from global precipitation + AI weather products, pending source verification.',
      status: 'coming',
    },
  ];

  return (
    <section className="constructs">
      <h3>Forecast Engines</h3>
      <div className="construct-grid">
        {engines.map(e => (
          <div className={`construct-card ${e.status === 'coming' ? 'construct-coming' : ''}`} key={e.name}>
            <div className="construct-header">
              <h4>{e.name}</h4>
              <span className={`construct-status construct-status-${e.status}`}>
                {e.status === 'live' ? 'Live' : 'Planned'}
              </span>
            </div>
            <p>{e.desc}</p>
          </div>
        ))}
      </div>
      <p className="constructs-note">
        Open engines are consumed as governed spokes — certificates carry source
        attribution and multi-model discrepancy, not endorsement.
      </p>
    </section>
  );
}

// ── Pipeline ────────────────────────────────────────────────────────────────

function Pipeline() {
  const steps = [
    { title: 'Admit Evidence', desc: 'Every source is content-hashed and dated at ingest; anything stale or unverifiable is refused, not silently used.' },
    { title: 'Score Each Source', desc: 'Each flood data source is assessed for reliability on its own terms before any are combined.' },
    { title: 'Compare Against the Record', desc: 'Results are checked against the historical and modeled record for the location.' },
    { title: 'Flag Unsupported Results', desc: "An answer that isn't backed by valid evidence is flagged, never passed through as fact." },
    { title: 'Issue a Determination', desc: 'Certified, review, or withheld — each with the full evidence trail attached.' },
  ];

  return (
    <section className="pipeline">
      <h3>Certification Pipeline</h3>
      <div className="pipeline-steps">
        {steps.map((s, i) => (
          <div className="pipeline-step" key={s.title}>
            <div className="step-indicator">
              <div className="step-dot" />
              {i < steps.length - 1 && <div className="step-line" />}
            </div>
            <div className="step-content">
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Certificate Inspector ───────────────────────────────────────────────────

function CertInspector() {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    zcta_id: '77002',
    target: 'elevation',
    y_pred: '1000',
    y_true: '1200',
    embedding_arm: 'graphsage_v1',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const resp = await cert.post('/certify/geo', {
      zcta_id: form.zcta_id,
      target: form.target,
      y_pred: parseFloat(form.y_pred),
      y_true: parseFloat(form.y_true),
      embedding_arm: form.embedding_arm,
    }, { auth: isAuthenticated });

    setLoading(false);

    if (!resp.ok) {
      setError(resp.error?.message || 'Request failed');
      return;
    }
    setResult(resp.data);
  };

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const decisionClass = (d) =>
    d === 'EXECUTE' ? 'pass' : d === 'REFUSE' ? 'fail' : 'warn';

  return (
    <section className="cert-inspector">
      <h3>Certificate Inspector</h3>
      <p className="cert-inspector-desc">
        Submit a ZCTA prediction to receive an RSCT geo certificate with simplex
        decomposition, gate decisions, and provenance.
      </p>

      <div className="cert-inspector-layout">
        <form className="cert-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              <span>ZCTA</span>
              <input value={form.zcta_id} onChange={update('zcta_id')}
                placeholder="77002" maxLength={5} pattern="\d{5}" required />
            </label>
            <label>
              <span>Target</span>
              <select value={form.target} onChange={update('target')} required>
                {SUPPORTED_GEO_TARGETS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>y_pred</span>
              <input type="number" step="any" value={form.y_pred}
                onChange={update('y_pred')} required />
            </label>
            <label>
              <span>y_true</span>
              <input type="number" step="any" value={form.y_true}
                onChange={update('y_true')} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              <span>Embedding Arm</span>
              <select value={form.embedding_arm} onChange={update('embedding_arm')}>
                <option value="graphsage_v1">GraphSAGE v1</option>
                <option value="pca32_v1">PCA32 v1</option>
                <option value="spatial_lag_v1">Spatial Lag v1</option>
                <option value="geo_v1">Geo v1</option>
                <option value="domain_v1">Domain v1</option>
              </select>
            </label>
          </div>
          <button type="submit" className="cert-submit" disabled={loading}>
            {loading ? 'Certifying...' : 'Certify'}
          </button>
        </form>

        <div className="cert-results">
          {error && (
            <div className="cert-error">
              <span className="verdict fail">ERROR</span>
              <span>{error}</span>
            </div>
          )}

          {result && (
            <>
              <div className="cert-card">
                <div className="cert-card-header">
                  <h4>RSCT Certificate</h4>
                  <span className={`verdict ${decisionClass(result.certificate.decision)}`}>
                    {result.certificate.decision}
                  </span>
                </div>

                <div className="simplex-bar" role="img"
                  aria-label={`Simplex: relevance ${(result.certificate.R * 100).toFixed(1)}%, support ${(result.certificate.S_sup * 100).toFixed(1)}%, novelty ${(result.certificate.N * 100).toFixed(1)}%`}>
                  <div className="simplex-r" style={{ width: `${result.certificate.R * 100}%` }}
                    title={`R Relevance ${(result.certificate.R * 100).toFixed(1)}%`} />
                  <div className="simplex-s" style={{ width: `${result.certificate.S_sup * 100}%` }}
                    title={`S Support ${(result.certificate.S_sup * 100).toFixed(1)}%`} />
                  <div className="simplex-n" style={{ width: `${result.certificate.N * 100}%` }}
                    title={`N Novelty ${(result.certificate.N * 100).toFixed(1)}%`} />
                </div>
                <div className="simplex-legend">
                  <span className="simplex-key"><i className="dot dot-r" />Relevance
                    <b>{(result.certificate.R * 100).toFixed(1)}%</b></span>
                  <span className="simplex-key"><i className="dot dot-s" />Support
                    <b>{(result.certificate.S_sup * 100).toFixed(1)}%</b></span>
                  <span className="simplex-key"><i className="dot dot-n" />Novelty
                    <b>{(result.certificate.N * 100).toFixed(1)}%</b></span>
                </div>

                <div className="cert-metrics">
                  <div className="cert-metric">
                    <span className="cert-metric-label">alpha</span>
                    <span className="cert-metric-value">{result.certificate.alpha.toFixed(4)}</span>
                  </div>
                  <div className="cert-metric">
                    <span className="cert-metric-label">kappa_compat</span>
                    <span className="cert-metric-value">{result.certificate.kappa_compat.toFixed(4)}</span>
                  </div>
                  <div className="cert-metric">
                    <span className="cert-metric-label">sigma</span>
                    <span className="cert-metric-value">{result.certificate.sigma.toFixed(4)}</span>
                  </div>
                  <div className="cert-metric">
                    <span className="cert-metric-label">gate</span>
                    <span className="cert-metric-value">
                      {result.certificate.gate_reached === 'NONE'
                        ? 'ALL PASSED'
                        : result.certificate.gate_reached.replace('GATE_', '').replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {result.certificate.gate_reason && (
                  <div className="cert-gate-reason">
                    {result.certificate.gate_reason}
                  </div>
                )}
              </div>

              <div className="cert-card cert-audit">
                <h4>Audit</h4>
                <div className="audit-grid">
                  <span className="audit-label">Certificate ID</span>
                  <code>{result.certificate_id}</code>
                  <span className="audit-label">Dataset</span>
                  <code>{result.audit.dataset_version}</code>
                  <span className="audit-label">Policy</span>
                  <code>{result.audit.policy_id}</code>
                  <span className="audit-label">ZCTA</span>
                  <code>{result.metadata.zcta_id}</code>
                  <span className="audit-label">Arm</span>
                  <code>{result.metadata.embedding_arm}</code>
                </div>
              </div>
            </>
          )}

          {!result && !error && !loading && (
            <div className="cert-placeholder">
              Submit a ZCTA to inspect its certificate
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── API Section ─────────────────────────────────────────────────────────────

function ApiSection({ apiStatus }) {
  return (
    <section className="api-section">
      <h3>Live API</h3>
      <div className="api-card">
        <div className="api-endpoint">
          <span className="api-method">GET</span>
          <span className="api-url">{API_BASE}/health</span>
          <span className={`verdict ${apiStatus === 'online' ? 'pass' : apiStatus === 'checking' ? 'warn' : 'fail'}`}>
            {apiStatus}
          </span>
        </div>
        <div className="api-response">
          <pre>{`{
  `}<span className="key">"status"</span>{`: `}<span className="string">"healthy"</span>{`,
  `}<span className="key">"service"</span>{`: `}<span className="string">"floodcaster-api"</span>{`
}`}</pre>
        </div>
      </div>
    </section>
  );
}

// ── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="footer">
      <p>
        <a href="https://nextshiftconsulting.com/privacy-policy">Privacy</a>
        {' '}&middot;{' '}
        <a href="https://nextshiftconsulting.com/terms-of-service">Terms</a>
      </p>
      <p className="footer-fine">
        &copy; 2026 Next Shift Consulting LLC &middot; U.S. Patent Application No. 19/575,615 &middot; patent pending
      </p>
    </footer>
  );
}

export default App;
