/**
 * Downloads the Whisper speech model into public/ once, on a machine that can
 * reach huggingface.co.
 *
 * The model is served from this project rather than fetched by every creator's
 * browser at runtime. Three reasons, in order of how much they matter:
 *
 *   1. The studio keeps working with no network. That is the platform rule,
 *      and a room that needs an internet round trip before it can hear you
 *      breaks it.
 *   2. We know exactly which weights shipped. A runtime fetch of "latest"
 *      is a provenance hole in a platform whose product is provenance.
 *   3. A creator does not wait on a download the first time they speak.
 *
 *   node scripts/fetch-whisper-model.mjs              # whisper-tiny.en
 *   node scripts/fetch-whisper-model.mjs base.en      # or a larger one
 *
 * The files land in public/models/whisper/<id>/ and are gitignored, exactly as
 * the Basic Pitch weights are.
 */
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const variant = process.argv[2] || 'tiny.en';
const repo = `onnx-community/whisper-${variant}`;
const target = join(root, 'public', 'models', 'whisper', `whisper-${variant}`);

// What transformers.js asks for when loading a Whisper pipeline. Listed rather
// than discovered, so a failure names the file it wanted.
const FILES = [
  'config.json',
  'generation_config.json',
  'preprocessor_config.json',
  'tokenizer.json',
  'tokenizer_config.json',
  'onnx/encoder_model_quantized.onnx',
  'onnx/decoder_model_merged_quantized.onnx',
];

const base = `https://huggingface.co/${repo}/resolve/main`;

console.log(`fetching ${repo}`);
let total = 0;

for (const file of FILES) {
  const dest = join(target, file);
  await mkdir(dirname(dest), { recursive: true });

  try {
    const existing = await stat(dest);
    console.log(`  have  ${file} (${(existing.size / 1048576).toFixed(1)} MB)`);
    total += existing.size;
    continue;
  } catch {
    // not downloaded yet
  }

  const url = `${base}/${file}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`  FAIL  ${file} — ${res.status} ${res.statusText}`);
    console.error(`        ${url}`);
    process.exitCode = 1;
    continue;
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, bytes);
  total += bytes.length;
  console.log(`  got   ${file} (${(bytes.length / 1048576).toFixed(1)} MB)`);
}

console.log(`\n${(total / 1048576).toFixed(1)} MB in ${target}`);
console.log('This is the number that decided the browser route. Record it in the ledger.');
