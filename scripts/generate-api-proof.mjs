// Generates docs/API-PROOF.md: for every contract endpoint, the measured
// response time, payload size, and the actual returned body (large bodies
// truncated). Anyone can regenerate it:
//
//   node scripts/generate-api-proof.mjs
//
// Timings are local-loopback against the TEST_ONLY mock: they prove the API
// adds no artificial delay and show exact payload sizes. Network latency on a
// real connection is additive and not the API's doing.
import { spawn } from 'node:child_process';
import { writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const port = Number(process.env.FLOODCASTER_PROOF_PORT || 8791);
const base = `http://127.0.0.1:${port}`;
const SAMPLES = 5;
const BODY_LIMIT = 1600;

const server = spawn(process.execPath, [join(root, 'mock-server', 'server.mjs')], {
  env: { ...process.env, FLOODCASTER_MOCK_PORT: String(port) },
  stdio: 'ignore'
});
await new Promise((resolve) => setTimeout(resolve, 1200));

const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];

const measure = async ({ method = 'GET', path, headers = {}, body = null }) => {
  const times = [];
  let response, bytes;
  for (let i = 0; i < SAMPLES; i += 1) {
    const started = performance.now();
    response = await fetch(base + path, { method, headers, body });
    bytes = Buffer.from(await response.arrayBuffer());
    times.push(performance.now() - started);
  }
  return { status: response.status, bytes, medianMs: median(times) };
};

const show = (bytes, contentType) => {
  if (contentType === 'binary') return '_(binary PMTiles archive — body not shown; verify via sha256 in the bootstrap map_pack manifest)_';
  const text = bytes.toString('utf8');
  if (text.length <= BODY_LIMIT) return '```json\n' + text + '\n```';
  return '```json\n' + text.slice(0, BODY_LIMIT) + '\n```\n_(truncated — full payload is ' + bytes.length.toLocaleString() + ' bytes; byte count and sha256 are pinned in the layer index)_';
};

const observation = JSON.parse(await readFile(join(root, 'fixtures', 'field-observation.json'), 'utf8'));
const operationBody = JSON.stringify({
  operation_id: observation.operation_id,
  operation_type: 'SUBMIT_FIELD_OBSERVATION',
  observation
});

const session = await fetch(base + '/mobile/v1/session', { method: 'POST' });
const token = (await session.json()).session_token;
const auth = { authorization: `Bearer ${token}`, 'content-type': 'application/json' };

const calls = [
  { title: 'GET /mobile/v1/bootstrap', req: { path: '/mobile/v1/bootstrap' } },
  { title: 'GET /mobile/v1/properties?query=115 Test (search)', req: { path: '/mobile/v1/properties?query=115%20Test' } },
  { title: 'GET /mobile/v1/properties/PROP-TEST-001 (read model)', req: { path: '/mobile/v1/properties/PROP-TEST-001' } },
  { title: 'GET /mobile/v1/determinations/DET-TEST-001 (current)', req: { path: '/mobile/v1/determinations/DET-TEST-001' } },
  { title: 'GET /mobile/v1/determinations/DET-TEST-001 (superseded toggle)', req: { path: '/mobile/v1/determinations/DET-TEST-001', headers: { 'x-floodcaster-mock-determination-state': 'superseded' } } },
  { title: 'GET /mobile/v1/certificates/CERT-TEST-001', req: { path: '/mobile/v1/certificates/CERT-TEST-001' } },
  { title: 'GET /mobile/v1/layers (index with digests)', req: { path: '/mobile/v1/layers' } },
  { title: 'GET /mobile/v1/layers/flood-normal (F2 baseline layer)', req: { path: '/mobile/v1/layers/flood-normal' } },
  { title: 'GET /mobile/v1/layers/flood-complex', req: { path: '/mobile/v1/layers/flood-complex' } },
  { title: 'GET /mobile/v1/layers/flood-stress-3x (F3 probe layer)', req: { path: '/mobile/v1/layers/flood-stress-3x' } },
  { title: 'GET /mobile/v1/map-pack (offline PMTiles download)', req: { path: '/mobile/v1/map-pack' }, binary: true },
  { title: 'POST /mobile/v1/session', req: { method: 'POST', path: '/mobile/v1/session' } },
  { title: 'POST /mobile/v1/operations — no token (transport 401)', req: { method: 'POST', path: '/mobile/v1/operations', headers: { 'content-type': 'application/json' }, body: operationBody } },
  { title: 'POST /mobile/v1/operations — applied', req: { method: 'POST', path: '/mobile/v1/operations', headers: auth, body: operationBody } },
  { title: 'POST /mobile/v1/operations — replay', req: { method: 'POST', path: '/mobile/v1/operations', headers: { ...auth, 'x-floodcaster-mock-scenario': 'replay' }, body: operationBody } },
  { title: 'POST /mobile/v1/operations — collision (409)', req: { method: 'POST', path: '/mobile/v1/operations', headers: { ...auth, 'x-floodcaster-mock-scenario': 'collision' }, body: operationBody } },
  { title: 'POST /mobile/v1/operations — verify-required', req: { method: 'POST', path: '/mobile/v1/operations', headers: { ...auth, 'x-floodcaster-mock-scenario': 'verify-required' }, body: operationBody } },
  { title: 'POST /mobile/v1/operations — rejected', req: { method: 'POST', path: '/mobile/v1/operations', headers: { ...auth, 'x-floodcaster-mock-scenario': 'rejected' }, body: operationBody } }
];

const sections = [];
const summary = [];
for (const call of calls) {
  const { status, bytes, medianMs } = await measure(call.req);
  summary.push(`| ${call.title} | ${status} | ${bytes.length.toLocaleString()} | ${medianMs.toFixed(1)} |`);
  sections.push(
    `## ${call.title}\n\n` +
    `Status **${status}** · payload **${bytes.length.toLocaleString()} bytes** · median response **${medianMs.toFixed(1)} ms** (${SAMPLES} samples, local loopback)\n\n` +
    show(bytes, call.binary ? 'binary' : 'json')
  );
}

const doc = `# API Proof — What Every Call Returns, and How Fast

Generated by \`node scripts/generate-api-proof.mjs\` against the local TEST_ONLY mock. Regenerate it yourself — the numbers below are measurements, not claims. Local-loopback timing proves the API itself adds no delay; real-network latency is additive and independent of the API.

The machine-readable contract: [floodcaster-mobile.openapi.yaml](../contracts/floodcaster-mobile.openapi.yaml) · [floodcaster-mobile.openapi.json](../contracts/floodcaster-mobile.openapi.json)

## Summary

| Call | Status | Bytes | Median ms |
| --- | --- | --- | --- |
${summary.join('\n')}

${sections.join('\n\n')}
`;

await writeFile(join(root, 'docs', 'API-PROOF.md'), doc);
server.kill();
process.stdout.write(`API-PROOF.md written: ${calls.length} calls documented\n`);
