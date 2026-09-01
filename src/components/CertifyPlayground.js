// P4.1 — Interactive Certify Playground
// P4.2 — Pair Certify
import { useState } from 'react';
import { cert } from '../api';
import RsctCert from './RsctCert';
import { SAMPLE_RSCT_CERT } from '../sampleData';

export default function CertifyPlayground({ demo = false }) {
  const [mode, setMode] = useState('single'); // 'single' | 'pair'
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [premiseEmb, setPremiseEmb] = useState('');
  const [hypothesisEmb, setHypothesisEmb] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSingle = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    if (demo) {
      // Preview only — never call the live API without a key.
      setError(null);
      setResult(SAMPLE_RSCT_CERT);
      setLatency(null);
      return;
    }
    setLoading(true);
    setError(null);
    const start = performance.now();

    const resp = await cert.post('/certify', {
      prompt: prompt.trim(),
      ...(context.trim() ? { context: context.trim() } : {}),
    }, { auth: true });

    setLatency(Math.round(performance.now() - start));
    setLoading(false);

    if (!resp.ok) {
      setError(resp.error?.message || 'Certification failed');
      setResult(null);
      return;
    }
    setResult(resp.data);
    setHistory(prev => [{ prompt: prompt.trim(), result: resp.data, time: new Date().toISOString() }, ...prev].slice(0, 20));
  };

  const handlePair = async (e) => {
    e.preventDefault();
    if (demo) {
      setError(null);
      setResult(SAMPLE_RSCT_CERT);
      setLatency(null);
      return;
    }
    setLoading(true);
    setError(null);
    const start = performance.now();

    let premise, hypothesis;
    try {
      premise = JSON.parse(premiseEmb);
      hypothesis = JSON.parse(hypothesisEmb);
    } catch {
      setError('Embeddings must be valid JSON arrays');
      setLoading(false);
      return;
    }

    const resp = await cert.post('/certify/pair', {
      premise_embedding: premise,
      hypothesis_embedding: hypothesis,
    }, { auth: true });

    setLatency(Math.round(performance.now() - start));
    setLoading(false);

    if (!resp.ok) {
      setError(resp.error?.message || 'Pair certification failed');
      setResult(null);
      return;
    }
    setResult(resp.data);
  };

  return (
    <div className="playground">
      {demo && (
        <div className="demo-cta">
          Add an API key in <strong>Settings</strong> to run this live. Below is a sample certification.
        </div>
      )}
      <div className="playground-tabs">
        <button className={`tab ${mode === 'single' ? 'tab-active' : ''}`} onClick={() => setMode('single')}>
          Single Certify
        </button>
        <button className={`tab ${mode === 'pair' ? 'tab-active' : ''}`} onClick={() => setMode('pair')}>
          Pair Certify
        </button>
      </div>

      {mode === 'single' && (
        <form className="playground-form" onSubmit={handleSingle}>
          <textarea
            className="playground-input"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Enter text to certify..."
            rows={3}
          />
          <input
            className="settings-input"
            value={context}
            onChange={e => setContext(e.target.value)}
            placeholder="Optional context"
          />
          <button className="btn-primary" type="submit" disabled={loading || !prompt.trim()}>
            {loading ? 'Certifying...' : 'Certify'}
          </button>
        </form>
      )}

      {mode === 'pair' && (
        <form className="playground-form" onSubmit={handlePair}>
          <textarea
            className="playground-input"
            value={premiseEmb}
            onChange={e => setPremiseEmb(e.target.value)}
            placeholder="Premise embedding [0.1, 0.2, ...]"
            rows={2}
          />
          <textarea
            className="playground-input"
            value={hypothesisEmb}
            onChange={e => setHypothesisEmb(e.target.value)}
            placeholder="Hypothesis embedding [0.3, 0.4, ...]"
            rows={2}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Certifying...' : 'Certify Pair'}
          </button>
        </form>
      )}

      {error && (
        <div className="cert-error" style={{ marginTop: '0.75rem' }}>
          <span className="verdict fail">ERROR</span>
          <span>{error}</span>
        </div>
      )}

      {latency !== null && (
        <div className="query-meta" style={{ marginTop: '0.5rem' }}>
          <span className="query-latency">{latency}ms</span>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '0.75rem' }}>
          {demo && <div className="results-stub-note">Sample certification — not a live result.</div>}
          <RsctCert certificate={result} />
          {result.classifier_source && (
            <div className="audit-grid" style={{ marginTop: '0.5rem' }}>
              <span className="audit-label">Classifier</span>
              <code>{result.classifier_source}</code>
              {result.is_informative !== undefined && (
                <>
                  <span className="audit-label">Informative</span>
                  <code>{result.is_informative ? 'Yes' : 'No'}</code>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {mode === 'single' && history.length > 0 && (
        <div className="playground-history">
          <span className="audit-label">Recent ({history.length})</span>
          {history.map((h, i) => (
            <div key={i} className="history-row" onClick={() => { setPrompt(h.prompt); setResult(h.result); }}>
              <span className={`verdict ${h.result?.decision === 'EXECUTE' ? 'pass' : 'warn'}`}>
                {h.result?.decision || '?'}
              </span>
              <span className="history-prompt">{h.prompt.slice(0, 60)}{h.prompt.length > 60 ? '...' : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
