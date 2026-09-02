import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const manifest = JSON.parse(await readFile(join(root, 'BASELINE-MANIFEST.json'), 'utf8'));

const gitBlobSha = (buffer) => createHash('sha1')
  .update(`blob ${buffer.length}\0`)
  .update(buffer)
  .digest('hex');

for (const [path, expected] of Object.entries(manifest.protected_unchanged_git_blobs)) {
  const actual = gitBlobSha(await readFile(join(root, path)));
  if (actual !== expected) throw new Error(`${path} changed: expected ${expected}, got ${actual}`);
}

const jsonFiles = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory)) {
    const path = join(directory, entry);
    if ((await stat(path)).isDirectory()) await walk(path);
    else if (path.endsWith('.json')) jsonFiles.push(path);
  }
};

for (const directory of ['contracts', 'fixtures', 'map-pack', 'mock-server']) await walk(join(root, directory));
for (const path of jsonFiles) JSON.parse(await readFile(path, 'utf8'));

const required = [
  'contracts/floodcaster-mobile.openapi.json',
  'contracts/floodcaster-mobile.openapi.yaml',
  'fixtures/hazards-nearby.json',
  'fixtures/issued-determination.json',
  'fixtures/field-observation.json',
  'fixtures/operation-replay.json',
  'mock-server/server.mjs'
];
for (const path of required) await readFile(join(root, path));

const openapi = JSON.parse(await readFile(join(root, 'contracts/floodcaster-mobile.openapi.json'), 'utf8'));
if (openapi.info?.version !== '0.5.0-proposed') throw new Error('unified OpenAPI version is not 0.5.0-proposed');
if (!openapi.paths?.['/mobile/v1/hazards/nearby']?.get) throw new Error('unified nearby-hazard operation missing');
if (openapi.paths?.['/v1/hazards/nearby']) throw new Error('duplicate nearby-hazard route must not be published');

const hazards = JSON.parse(await readFile(join(root, 'fixtures/hazards-nearby.json'), 'utf8'));
if (hazards.schema_version !== 'hazard-nearby/2.0.0') throw new Error('hazard fixture schema version mismatch');
if (hazards.reference_data?.status !== 'ACTIVE') throw new Error('hazard fixture must use activated Golden GeoData');
const events = [...hazards.active, ...hazards.forecast, ...hazards.recent_history];
for (const event of events) {
  if (event.details?.detail_type !== event.hazard_family) throw new Error(`${event.hazard_id}: detail/family mismatch`);
  if (event.source?.authority_class !== event.record_kind) throw new Error(`${event.hazard_id}: authority mismatch`);
}
const fire = events.find((event) => event.hazard_family === 'WILDFIRE');
if (!fire || fire.record_kind !== 'SOURCE_OBSERVATION') throw new Error('NASA FIRMS fire must remain a source observation');

process.stdout.write(`Validated ${jsonFiles.length} JSON files and protected ${Object.keys(manifest.protected_unchanged_git_blobs).length} unchanged infosec files.\n`);
