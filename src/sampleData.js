// Shared sample/preview data for Demo Mode.
// Rendered to unauthenticated visitors so the certificate-governed workflow
// is visible without an API key. Never sent to a backend; live execution
// (real certification, quota, governed queries, trace retrieval) still
// requires a valid key.

export const SAMPLE_RSCT_CERT = {
  id: 'sample-cert-0001',
  R: 0.62,
  S_sup: 0.23,
  N: 0.15,
  decision: 'EXECUTE',
  kappa_compat: 0.527,
  sigma: 0.12,
  gate_reached: 4,
  reason: null,
  proof: {
    signature: 'hmac-sha256:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    algorithm: 'hmac-sha256',
  },
  classifier_source: 'floodcaster_v1',
  is_informative: true,
};

export const SAMPLE_QUOTA = { tier: 'free', used: 12, limit: 100, remaining: 88 };

export const SAMPLE_BATCH_RESULTS = [
  { row: 1, prompt: 'Riverine flood risk near Buffalo Bayou', R: '0.6200', S: '0.2300', N: '0.1500', decision: 'EXECUTE', error: '' },
  { row: 2, prompt: 'Coastal surge exposure, Galveston Island', R: '0.5400', S: '0.3100', N: '0.1500', decision: 'EXECUTE', error: '' },
  { row: 3, prompt: 'asdf qwerty lorem ipsum', R: '0.1800', S: '0.2200', N: '0.6000', decision: 'BLOCK', error: '' },
];
