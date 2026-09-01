// P2.3 — Job Submission
// P2.4 — Job Status Polling
import { useState, useEffect, useRef } from 'react';
import { flood } from '../api';

const POLL_INTERVAL = 10000;
const TERMINAL = ['COMPLETED', 'FAILED'];

export default function JobRunner({ bbox, rasterKey, onResults }) {
  const [floodType, setFloodType] = useState('R');
  const [job, setJob] = useState(null); // { job_id, status, s3_output, error, ... }
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const pollRef = useRef(null);

  const canSubmit = bbox && rasterKey && !submitting && !job;

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const resp = await flood.post('/run', {
      bbox,
      s3_raster: rasterKey,
      flood_type: floodType,
    }, { auth: true });

    setSubmitting(false);

    if (!resp.ok) {
      setSubmitError(resp.error?.message || 'Submission failed');
      return;
    }

    setJob({
      job_id: resp.data.data.job_id,
      task_arn: resp.data.data.task_arn,
      s3_output: resp.data.data.s3_output,
      status: 'PENDING',
      created_at: resp.data.meta?.timestamp || new Date().toISOString(),
      stopped_reason: null,
    });
  };

  // Poll status
  useEffect(() => {
    if (!job || TERMINAL.includes(job.status)) return;

    const poll = async () => {
      const resp = await flood.get(`/status/${job.job_id}`, { auth: true });
      if (resp.ok && resp.data?.data) {
        const d = resp.data.data;
        setJob(prev => ({
          ...prev,
          status: d.status,
          stopped_reason: d.stopped_reason || null,
        }));
        if (d.status === 'COMPLETED' && onResults) {
          onResults({ s3_output: d.s3_output || job.s3_output, job_id: d.job_id || job.job_id });
        }
      }
    };

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.job_id, job?.status]);

  const reset = () => {
    clearInterval(pollRef.current);
    setJob(null);
    setSubmitError(null);
  };

  const statusClass = (s) => {
    if (s === 'COMPLETED') return 'pass';
    if (s === 'FAILED') return 'fail';
    return 'warn';
  };

  return (
    <div className="job-runner">
      {!job && (
        <div className="job-submit-row">
          <label className="flood-type-label">
            <span>Flood Type</span>
            <select value={floodType} onChange={e => setFloodType(e.target.value)}>
              <option value="R">Riverine</option>
              <option value="C">Coastal</option>
            </select>
          </label>
          <button
            className="btn-primary job-submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? 'Submitting...' : 'Run Analysis'}
          </button>
        </div>
      )}

      {submitError && (
        <div className="cert-error">
          <span className="verdict fail">ERROR</span>
          <span>{submitError}</span>
        </div>
      )}

      {job && (
        <div className="job-status-card">
          <div className="job-status-header">
            <h4>Job {job.job_id.slice(0, 12)}</h4>
            <span className={`verdict ${statusClass(job.status)}`}>{job.status}</span>
          </div>
          <div className="audit-grid">
            <span className="audit-label">Job ID</span>
            <code>{job.job_id}</code>
            <span className="audit-label">Submitted</span>
            <code>{job.created_at}</code>
            <span className="audit-label">Output</span>
            <code>{job.s3_output}</code>
          </div>

          {job.status === 'PENDING' || job.status === 'RUNNING' ? (
            <div className="job-polling">
              <div className="status-dot checking" style={{ display: 'inline-block' }} />
              <span>Polling every {POLL_INTERVAL / 1000}s...</span>
            </div>
          ) : null}

          {job.status === 'FAILED' && job.stopped_reason && (
            <div className="cert-gate-reason">{job.stopped_reason}</div>
          )}

          {TERMINAL.includes(job.status) && (
            <button className="btn-secondary" onClick={reset} style={{ marginTop: '0.75rem' }}>
              New Job
            </button>
          )}
        </div>
      )}
    </div>
  );
}
