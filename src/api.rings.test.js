import { vi } from 'vitest';
import { getRings, getCertificateHistory } from './api';

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function okResponse(body) {
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: new Map(),
    json: () => Promise.resolve(body),
  });
}

// R-016 T2: gated reads now attach a demo token, so a GET /demo/session mint may
// precede the route call. Find the route call among all fetches (robust to that).
function urlContaining(fragment) {
  const call = global.fetch.mock.calls.find((c) => String(c[0]).includes(fragment));
  return call ? String(call[0]) : undefined;
}

test('getRings hits /rings with coords', async () => {
  global.fetch.mockReturnValue(okResponse({ data: { coverage: false } }));
  await getRings(29.76, -95.36);
  expect(urlContaining('/rings')).toContain('/rings?lat=29.76&lon=-95.36');
});

test('getCertificateHistory hits /certificates/lookup with radius', async () => {
  global.fetch.mockReturnValue(okResponse({ data: { certificates: [] } }));
  await getCertificateHistory(29.76, -95.36, 250);
  expect(urlContaining('/certificates/lookup')).toContain('/certificates/lookup?lat=29.76&lon=-95.36&radius=250');
});

test('gated reads attach a demo token from /demo/session', async () => {
  global.fetch.mockImplementation((u) =>
    okResponse(String(u).includes('/demo/session')
      ? { data: { key: 'demo_key_123', expires_in: 3600 } }
      : { data: { coverage: false } }));
  await getRings(29.76, -95.36);
  const ringsCall = global.fetch.mock.calls.find((c) => String(c[0]).includes('/rings'));
  expect(ringsCall[1].headers['X-API-Key']).toBe('demo_key_123');
});
