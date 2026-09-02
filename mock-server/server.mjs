import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixtureDir = join(here, '..', 'fixtures');
const corpusDir = join(fixtureDir, 'corpus');
const port = Number(process.env.FLOODCASTER_MOCK_PORT || 8787);

const fixture = async (name) => JSON.parse(await readFile(join(fixtureDir, name), 'utf8'));

const corpus = new Map();
for (const feature of JSON.parse(await readFile(join(corpusDir, 'properties.geojson'), 'utf8')).features) {
  corpus.set(feature.properties.property_id, feature);
}
const corpusManifest = JSON.parse(await readFile(join(corpusDir, 'corpus-manifest.json'), 'utf8'));
const layerFiles = {
  'flood-normal': 'flood-normal.geojson',
  'flood-complex': 'flood-complex.geojson',
  'flood-stress-3x': 'flood-stress-3x.geojson'
};

const readModel = (feature) => ({
  environment: 'TEST_ONLY',
  property_id: feature.properties.property_id,
  display_address: feature.properties.display_address,
  geometry: feature.geometry,
  determination_ids: feature.properties.determination_ids
});

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
    const url = new URL(request.url, 'http://localhost');
    const key = `${request.method} ${url.pathname}`;
    if (routes.has(key)) return send(response, 200, await fixture(routes.get(key)));

    if (key === 'GET /mobile/v1/properties') {
      const query = (url.searchParams.get('query') || '').toLowerCase();
      const matches = [...corpus.values()]
        .filter((f) => !query
          || f.properties.property_id.toLowerCase().includes(query)
          || f.properties.display_address.toLowerCase().includes(query))
        .slice(0, 20)
        .map((f) => ({ property_id: f.properties.property_id, display_address: f.properties.display_address }));
      return send(response, 200, { environment: 'TEST_ONLY', count: matches.length, results: matches });
    }

    const propertyMatch = url.pathname.match(/^\/mobile\/v1\/properties\/([A-Z0-9-]+)$/);
    if (request.method === 'GET' && propertyMatch) {
      const feature = corpus.get(propertyMatch[1]);
      if (!feature) return send(response, 404, { environment: 'TEST_ONLY', error: 'NOT_FOUND' });
      return send(response, 200, readModel(feature));
    }

    if (key === 'GET /mobile/v1/layers') {
      return send(response, 200, {
        environment: 'TEST_ONLY',
        aoi_bbox_wgs84: corpusManifest.aoi_bbox_wgs84,
        layers: Object.keys(layerFiles).map((name) => ({
          layer_name: name,
          layer_class: 'HAZARD',
          ...corpusManifest.assets[name.replace(/-/g, '_')]
        }))
      });
    }

    if (key === 'GET /mobile/v1/map-pack') {
      const path = join(here, '..', 'map-pack', 'gate0-lacrosse-v1.pmtiles');
      const { size } = await stat(path);
      response.writeHead(200, {
        'content-type': 'application/octet-stream',
        'content-length': size,
        'access-control-allow-origin': '*'
      });
      return createReadStream(path).pipe(response);
    }

    const layerMatch = url.pathname.match(/^\/mobile\/v1\/layers\/([a-z0-9-]+)$/);
    if (request.method === 'GET' && layerMatch && layerFiles[layerMatch[1]]) {
      const path = join(corpusDir, layerFiles[layerMatch[1]]);
      const { size } = await stat(path);
      response.writeHead(200, {
        'content-type': 'application/geo+json',
        'content-length': size,
        'access-control-allow-origin': '*'
      });
      return createReadStream(path).pipe(response);
    }

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

    if (key === 'GET /mobile/v1/hazards/nearby') {
      const auth = authenticate(request);
      if (!auth.ok) return send(response, 401, { environment: 'TEST_ONLY', error: auth.error });

      const lat = Number(url.searchParams.get('lat'));
      const lon = Number(url.searchParams.get('lon'));
      const radiusKm = Number(url.searchParams.get('radius_km') || 10);
      if (!Number.isFinite(lat) || lat < -90 || lat > 90
        || !Number.isFinite(lon) || lon < -180 || lon > 180
        || !Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
        return send(response, 400, { environment: 'TEST_ONLY', error: 'INVALID_HAZARD_QUERY' });
      }

      const result = await fixture('hazards-nearby.json');
      if (Math.abs(lat - result.location.lat) > 0.000001 || Math.abs(lon - result.location.lon) > 0.000001) {
        return send(response, 400, {
          environment: 'TEST_ONLY',
          error: 'TEST_LOCATION_NOT_AVAILABLE',
          message: `Use lat=${result.location.lat}&lon=${result.location.lon} for the deterministic Golden GeoData fixture.`
        });
      }

      const requestedFamilies = url.searchParams.getAll('hazard_family')
        .flatMap((value) => value.split(','))
        .filter(Boolean);
      const requestedScopes = url.searchParams.getAll('time_scope')
        .flatMap((value) => value.split(','))
        .filter(Boolean);
      const familySet = new Set(requestedFamilies);
      const scopeSet = new Set(requestedScopes);
      const includeFamily = (event) => familySet.size === 0 || familySet.has(event.hazard_family);
      const filterEvents = (events) => events.filter((event) => includeFamily(event)
        && (event.distance_km === null || event.distance_km <= radiusKm));

      result.radius_km = radiusKm;
      result.active = scopeSet.size === 0 || scopeSet.has('ACTIVE') ? filterEvents(result.active) : [];
      result.forecast = scopeSet.size === 0 || scopeSet.has('FORECAST') ? filterEvents(result.forecast) : [];
      result.recent_history = scopeSet.size === 0 || scopeSet.has('RECENT_HISTORY')
        ? filterEvents(result.recent_history) : [];
      return send(response, 200, result);
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
