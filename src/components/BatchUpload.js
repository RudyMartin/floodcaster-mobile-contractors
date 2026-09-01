// P4.3 — Batch Upload
import { useState } from 'react';
import { cert } from '../api';
import { SAMPLE_BATCH_RESULTS } from '../sampleData';

export default function BatchUpload({ demo = false }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResults(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(l => l.trim());
      const header = lines[0].split(',');
      const rows = lines.slice(1, 6).map(line => {
        const vals = line.split(',');
        const obj = {};
        header.forEach((h, i) => { obj[h.trim()] = vals[i]?.trim() || ''; });
        return obj;
      });
      setPreview(rows);
    };
    reader.readAsText(f);
  };

  const handleProcess = async () => {
    if (!file) return;
    if (demo) {
      // Preview only — show sample results, never call the live API.
      setError(null);
      setProgress(100);
      setResults(SAMPLE_BATCH_RESULTS);
      return;
    }
    setProcessing(true);
    setError(null);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split('\n').filter(l => l.trim());
      const header = lines[0].split(',').map(h => h.trim());
      const promptIdx = header.findIndex(h => h.toLowerCase() === 'prompt' || h.toLowerCase() === 'text');

      if (promptIdx === -1) {
        setError('CSV must have a "prompt" or "text" column');
        setProcessing(false);
        return;
      }

      const rows = lines.slice(1).map(l => l.split(','));
      const output = [];

      for (let i = 0; i < rows.length; i++) {
        const prompt = rows[i][promptIdx]?.trim();
        if (!prompt) {
          output.push({ row: i + 1, prompt: '', error: 'Empty prompt', R: '', S: '', N: '', decision: '' });
          continue;
        }

        const resp = await cert.post('/certify', { prompt }, { auth: true });
        if (resp.ok) {
          const d = resp.data;
          output.push({
            row: i + 1, prompt,
            R: d.R?.toFixed(4) || '', S: (d.S || d.S_sup || 0).toFixed(4),
            N: d.N?.toFixed(4) || '', decision: d.decision || '',
            error: '',
          });
        } else {
          output.push({ row: i + 1, prompt, error: resp.error?.message || 'Failed', R: '', S: '', N: '', decision: '' });
        }
        setProgress(Math.round(((i + 1) / rows.length) * 100));
      }

      setResults(output);
      setProcessing(false);
    };
    reader.readAsText(file);
  };

  const downloadCSV = () => {
    if (!results) return;
    const header = 'row,prompt,R,S,N,decision,error\n';
    const body = results.map(r =>
      `${r.row},"${r.prompt.replace(/"/g, '""')}",${r.R},${r.S},${r.N},${r.decision},${r.error}`
    ).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'batch_results.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="batch-upload">
      <h4>Batch Certify</h4>
      {demo && (
        <div className="demo-cta">
          Add an API key in <strong>Settings</strong> to certify your CSV live. Process shows sample results.
        </div>
      )}
      <div className="raster-file-row">
        <label className="raster-file-btn">
          {file ? file.name : 'Choose CSV file'}
          <input type="file" accept=".csv" onChange={handleFile} hidden />
        </label>
        {file && !results && (
          <button className="btn-primary" onClick={handleProcess} disabled={processing}>
            {processing ? `Processing ${progress}%...` : 'Process'}
          </button>
        )}
      </div>

      {processing && (
        <div className="upload-progress">
          <div className="upload-bar"><div className="upload-fill" style={{ width: `${progress}%` }} /></div>
          <span>{progress}%</span>
        </div>
      )}

      {preview.length > 0 && !results && (
        <div className="results-table-container" style={{ marginTop: '0.75rem' }}>
          <span className="audit-label">Preview (first 5 rows)</span>
          <table className="results-table">
            <thead><tr>{Object.keys(preview[0]).map(k => <th key={k}>{k}</th>)}</tr></thead>
            <tbody>
              {preview.map((r, i) => (
                <tr key={i}>{Object.values(r).map((v, j) => <td key={j}>{v}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {results && (
        <>
          {demo && <div className="results-stub-note">Sample results — not a live batch run.</div>}
          <div className="results-table-container" style={{ marginTop: '0.75rem' }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th><th>Prompt</th><th>R</th><th>S</th><th>N</th><th>Decision</th><th>Error</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.row} className={r.error ? 'row-error' : ''}>
                    <td>{r.row}</td>
                    <td>{r.prompt.slice(0, 40)}{r.prompt.length > 40 ? '...' : ''}</td>
                    <td>{r.R}</td><td>{r.S}</td><td>{r.N}</td>
                    <td><span className={`verdict ${r.decision === 'EXECUTE' ? 'pass' : r.decision ? 'fail' : ''}`}>{r.decision}</span></td>
                    <td className="error-cell">{r.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn-secondary" onClick={downloadCSV} style={{ marginTop: '0.5rem' }}>
            Download Results CSV
          </button>
        </>
      )}

      {error && <div className="cert-error" style={{ marginTop: '0.75rem' }}><span className="verdict fail">ERROR</span><span>{error}</span></div>}
    </div>
  );
}
