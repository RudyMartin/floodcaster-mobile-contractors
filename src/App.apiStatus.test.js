import { apiStatusFrom } from './App';

// The live /health envelope: { data: { status: 'healthy', services: {...} }, meta: {...} }
test('online when the enveloped health status is healthy', () => {
  const resp = { ok: true, data: { data: { status: 'healthy', services: {} }, meta: {} } };
  expect(apiStatusFrom(resp)).toBe('online');
});

test('offline when the request failed', () => {
  expect(apiStatusFrom({ ok: false, data: null })).toBe('offline');
});

test('offline for the un-enveloped (wrong-depth) shape — regression guard for the old bug', () => {
  // The old code read resp.data.status; the live API nests it under resp.data.data.status.
  expect(apiStatusFrom({ ok: true, data: { status: 'healthy' } })).toBe('offline');
});
