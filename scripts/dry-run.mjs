// Contract dry-run: boots the TEST_ONLY mock and walks every API scenario the
// acceptance script depends on. Run before handing materials to a contractor,
// or as a contractor to sanity-check your environment:
//
//   node scripts/dry-run.mjs
//
// Exits nonzero if any step fails. This exercises the mock/contract layer only
// (acceptance script parts A, D, E); device behavior (parts B, C, F) cannot be
// proven here.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const port = Number(process.env.FLOODCASTER_DRYRUN_PORT || 8790);
const base = `http://127.0.0.1:${port}`;

const results = [];
const step = async (name, fn) => {
  try {
    await fn();
    results.push([name, 'PASS', '']);
  } catch (error) {
    results.push([name, 'FAIL', error.message]);
  }
};
const expect = (condition, message) => {
  if (!condition) throw new Error(message);
};

const server = spawn(process.execPath, [join(root, 'mock-server', 'server.mjs')], {
  env: { ...process.env, FLOODCASTER_MOCK_PORT: String(port) },
  stdio: 'ignore'
});
await new Promise((resolve) => setTimeout(resolve, 1200));

const json = async (path, options = {}) => {
  const response = await fetch(base + path, options);
  return { status: response.status, body: await response.json() };
};

try {
  await step('A1 bootstrap loads', async () => {
    const { status, body } = await json('/mobile/v1/bootstrap');
    expect(status === 200 && body.environment === 'TEST_ONLY', `status ${status}`);
  });

  await step('A2 property search finds the scripted property', async () => {
    const { status, body } = await json('/mobile/v1/properties?query=PROP-TEST-001');
    expect(status === 200 && body.results.some((r) => r.property_id === 'PROP-TEST-001'), 'not found');
  });

  await step('A2 read model serves corpus geometry', async () => {
    const { status, body } = await json('/mobile/v1/properties/PROP-TEST-001');
    expect(status === 200 && body.geometry.type === 'Polygon', 'no polygon geometry');
    expect(body.determination_ids.includes('DET-TEST-001'), 'missing determination link');
  });

  await step('A2 unknown property is 404, not fabricated', async () => {
    const { status } = await json('/mobile/v1/properties/PROP-TEST-999');
    expect(status === 404, `status ${status}`);
  });

  await step('A3 determination and certificate resolve', async () => {
    const det = await json('/mobile/v1/determinations/DET-TEST-001');
    expect(det.status === 200 && det.body.verification.status === 'CURRENT', 'determination not current');
    const cert = await json('/mobile/v1/certificates/CERT-TEST-001');
    expect(cert.status === 200, `certificate status ${cert.status}`);
  });

  await step('F2 layer index digests match streamed bytes', async () => {
    const { body } = await json('/mobile/v1/layers');
    expect(body.layers.length === 3, 'expected 3 layers');
    for (const layer of body.layers) {
      const bytes = Buffer.from(await (await fetch(`${base}/mobile/v1/layers/${layer.layer_name}`)).arrayBuffer());
      expect(bytes.length === layer.size_bytes, `${layer.layer_name} size mismatch`);
      const digest = createHash('sha256').update(bytes).digest('hex');
      expect(digest === layer.sha256, `${layer.layer_name} digest mismatch`);
    }
  });

  const observation = JSON.parse(await readFile(join(root, 'fixtures', 'field-observation.json'), 'utf8'));
  const operationBody = JSON.stringify({
    operation_id: observation.operation_id,
    operation_type: 'SUBMIT_FIELD_OBSERVATION',
    observation
  });
  const submit = (headers = {}) => json('/mobile/v1/operations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: operationBody
  });

  await step('C6/D1 unauthenticated submit is a transport 401', async () => {
    const { status, body } = await submit();
    expect(status === 401 && body.error === 'AUTH_REQUIRED', `${status} ${body.error}`);
  });

  const session = await json('/mobile/v1/session', { method: 'POST' });
  const auth = { authorization: `Bearer ${session.body.session_token}` };

  await step('D1 session issues token with explicit expiry', async () => {
    expect(session.status === 201 && session.body.expires_at, 'no expiry');
  });

  await step('C6 forced expiry is AUTH_EXPIRED, not a domain outcome', async () => {
    const { status, body } = await submit({ ...auth, 'x-floodcaster-mock-session-state': 'expired' });
    expect(status === 401 && body.error === 'AUTH_EXPIRED', `${status} ${body.error}`);
  });

  await step('D2/D3 submit acknowledges with separate domain outcome', async () => {
    const { status, body } = await submit(auth);
    expect(status === 200 && body.transport_state === 'ACKNOWLEDGED', 'not acknowledged');
    expect(body.domain_outcome === 'APPLIED' && body.replay === false, 'unexpected outcome');
  });

  await step('D4 replay returns original disposition, replay=true', async () => {
    const { body } = await submit({ ...auth, 'x-floodcaster-mock-scenario': 'replay' });
    expect(body.replay === true, 'replay not flagged');
  });

  await step('D5 collision is 409 and surfaced', async () => {
    const { status } = await submit({ ...auth, 'x-floodcaster-mock-scenario': 'collision' });
    expect(status === 409, `status ${status}`);
  });

  await step('D6 rejected and verify-required render as domain outcomes', async () => {
    for (const scenario of ['rejected', 'verify-required']) {
      const { status, body } = await submit({ ...auth, 'x-floodcaster-mock-scenario': scenario });
      expect(status === 200 && body.transport_state === 'ACKNOWLEDGED', `${scenario}: transport not separate`);
      expect(['REJECTED', 'VERIFY_REQUIRED'].includes(body.domain_outcome), `${scenario}: ${body.domain_outcome}`);
    }
  });

  await step('E1 supersession toggle demotes the determination', async () => {
    const { body } = await json('/mobile/v1/determinations/DET-TEST-001', {
      headers: { 'x-floodcaster-mock-determination-state': 'superseded' }
    });
    expect(body.verification.status === 'SUPERSEDED' && body.verification.superseded_by, 'not demoted');
  });

  await step('invalid operation body is rejected', async () => {
    const { status } = await json('/mobile/v1/operations', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...auth },
      body: JSON.stringify({ operation_id: 'OP-TEST-XXX' })
    });
    expect(status === 400, `status ${status}`);
  });
} finally {
  server.kill();
}

const width = Math.max(...results.map(([name]) => name.length));
let failed = 0;
for (const [name, verdict, detail] of results) {
  if (verdict === 'FAIL') failed += 1;
  process.stdout.write(`${verdict}  ${name.padEnd(width)}  ${detail}\n`);
}
process.stdout.write(`\n${results.length - failed}/${results.length} contract scenarios pass\n`);
process.exit(failed === 0 ? 0 : 1);
