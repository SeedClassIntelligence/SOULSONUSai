/**
 * Puts the Basic Pitch model where the browser can fetch it.
 *
 * The weights ship inside @spotify/basic-pitch (model.json plus one 900 KB
 * shard). node_modules is not served, so they are copied into public/ before
 * dev and before build. Copied rather than committed: the package is the
 * source of truth for its own weights, and a checked-in duplicate is a second
 * copy to drift.
 */
import { mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const from = join(root, 'node_modules', '@spotify', 'basic-pitch', 'model');
const to = join(root, 'public', 'models', 'basic-pitch');

if (!existsSync(from)) {
  console.error('[basic-pitch] model not found — run npm install');
  process.exit(1);
}

mkdirSync(to, { recursive: true });
for (const file of readdirSync(from)) {
  copyFileSync(join(from, file), join(to, file));
  console.log(`[basic-pitch] ${file}`);
}
