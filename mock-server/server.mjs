import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(here, '..', 'fixtures');
const port = Number(process.env.FLOODCASTER_MOCK_PORT || 8787);

const fixture = async (name) => JSON.parse(await readFile(join(fixtureDir, name), 'utf8'));

const send = (response, status, body) => {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type,authorization,x-floodcaster-mock-scenario,x-floodcaster-mock-determination-state,x-floodcaster-mock-session-state'
  });
  response.end(JSON.stringify(body, null, 2));
};

const sessionTtlSeconds = Number(process.env.FLOODCASTER_MOCK_SESSION_TTL_SECONDS || 300);
const sessions = new Map();
let sessionCounter = 0;

const authenticate = (request) => {
  if (request.headers['x-floodcaster-mock-session-state'] === 'expired') return { ok: false, error: 'AUTH_EXPIRED' };
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !sessions.has(token)) return { ok: false, error: 'AUTH_REQUIRED' };
  if (Date.now() > sessions.get(token)) {
    sessions.delete(token);
    return { ok: false, error: 'AUTH_EXPIRED' };
  }
  return { ok: true };
};

const readJson = async (request) => {
  let body = '';
  for await (const chunk of request) body += chunk;
  return JSON.parse(body || '{}');
};

const routes = new Map([
  ['GET /mobile/v1/bootstrap', 'bootstrap.json'],
  ['GET /mobile/v1/properties/PROP-TEST-001', 'property.json'],
  ['GET /mobile/v1/certificates/CERT-TEST-001', 'certificate.json']
]);

const operationFixtures = {
  applied: 'operation-applied.json',
  'verify-required': 'operation-verify-required.json',
  rejected: 'operation-rejected.json',
  replay: 'operation-replay.json',
  collision: 'operation-collision.json'
};

createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204, {});

  try {
    const key = `${request.method} ${new URL(request.url, 'http://localhost').pathname}`;
    if (routes.has(key)) return send(response, 200, await fixture(routes.get(key)));

    if (key === 'GET /mobile/v1/determinations/DET-TEST-001') {
      const state = request.headers['x-floodcaster-mock-determination-state'];
      return send(response, 200, await fixture(state === 'superseded' ? 'superseded-determination.json' : 'issued-determination.json'));
    }

    if (key === 'POST /mobile/v1/session') {
      sessionCounter += 1;
      const token = `MOCK-SESSION-${String(sessionCounter).padStart(4, '0')}`;
      const expiresAt = Date.now() + sessionTtlSeconds * 1000;
      sessions.set(token, expiresAt);
      return send(response, 201, {
        environment: 'TEST_ONLY',
        session_token: token,
        expires_at: new Date(expiresAt).toISOString()
      });
    }

    if (key === 'POST /mobile/v1/operations') {
      const auth = authenticate(request);
      if (!auth.ok) return send(response, 401, { environment: 'TEST_ONLY', error: auth.error });
      const body = await readJson(request);
      if (body.operation_type !== 'SUBMIT_FIELD_OBSERVATION' || body.observation?.artifact_class !== 'FIELD_OBSERVATION') {
        return send(response, 400, { environment: 'TEST_ONLY', error: 'INVALID_OPERATION' });
      }
      if (body.operation_id !== body.observation.operation_id || body.observation.determination_authority !== 'NONE') {
        return send(response, 400, { environment: 'TEST_ONLY', error: 'AUTHORITY_OR_ID_MISMATCH' });
      }
      const scenario = request.headers['x-floodcaster-mock-scenario'] || 'applied';
      const selected = operationFixtures[scenario];
      if (!selected) return send(response, 400, { environment: 'TEST_ONLY', error: 'UNKNOWN_MOCK_SCENARIO' });
      const result = await fixture(selected);
      result.operation_id = body.operation_id;
      return send(response, scenario === 'collision' ? 409 : 200, result);
    }

    return send(response, 404, { environment: 'TEST_ONLY', error: 'NOT_FOUND' });
  } catch (error) {
    return send(response, 400, { environment: 'TEST_ONLY', error: 'INVALID_REQUEST', message: error.message });
  }
}).listen(port, '127.0.0.1', () => {
  process.stdout.write(`Floodcaster TEST_ONLY mock listening on http://127.0.0.1:${port}\n`);
});
