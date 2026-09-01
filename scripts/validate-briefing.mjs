import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
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
  'contracts/floodcaster-mobile.openapi.yaml',
  'fixtures/issued-determination.json',
  'fixtures/field-observation.json',
  'fixtures/operation-replay.json',
  'mock-server/server.mjs'
];
for (const path of required) await readFile(join(root, path));

process.stdout.write(`Validated ${jsonFiles.length} JSON files and protected ${Object.keys(manifest.protected_unchanged_git_blobs).length} unchanged infosec files.\n`);
