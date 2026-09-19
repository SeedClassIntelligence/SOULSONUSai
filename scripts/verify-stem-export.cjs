/**
 * Opens the exported archive and checks what is really in it.
 *
 * The export used to fill the zip by synthesizing audio from track NAMES and
 * filing it under the creator's track names, write two MIDI files from
 * hardcoded note arrays, and ship a provenance manifest naming five engines
 * that never ran. This records a real hum, exports, unzips in the page, and
 * reports every file with its size and origin.
 *
 *   python3 scripts/make-hum-wav.py
 *   npm run dev
 *   node scripts/verify-stem-export.cjs
 */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.SOULSONUS_CHROME,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
           `--use-file-for-fake-audio-capture=${process.env.SOULSONUS_HUM_WAV || '/tmp/soulsonus-hum-c4.wav'}`],
  });
  const p = await (await b.newContext({ viewport: { width: 1680, height: 1050 }, permissions: ['microphone'] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 180)));
  await p.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);

  // Record one real take so exactly one track has audio.
  await p.locator('button').filter({ hasText: /^Hum$/ }).first().click({ force: true });
  await p.waitForTimeout(300);
  await p.locator('text=Save + Add to Session').first().click({ force: true }).catch(() => {});
  const rec = p.locator('button').filter({ hasText: /^[•■]\s*(RECORD|STOP RECORDING)$/ }).first();
  await rec.click({ force: true });
  await p.waitForTimeout(3200);
  await rec.click({ force: true });
  console.log('recording stored; waiting for transcription…');
  await p.waitForTimeout(25000);

  const report = await p.evaluate(async () => {
    const { exportStudioStemsZip } = await import('/src/services/stemExporter.ts');
    const { assetStore } = await import('/src/services/assetStore.ts');
    const saved = await assetStore.loadProjectState();
    const zipBlob = await exportStudioStemsZip(
      saved.metadata, saved.tracks,
      { includeWavStems: true, includeMasterStereo: true, includeMidi: true,
        includeSmirManifest: true, includeDawGuide: true, bitDepth: '24', sampleRate: '48k' },
      () => {}
    );
    // Vite resolves bare specifiers only for the app's own graph; from an
    // evaluated snippet the dependency has to be asked for by its served path.
    const JSZip = (await import('/node_modules/jszip/dist/jszip.min.js')).default || window.JSZip;
    const zip = await JSZip.loadAsync(zipBlob);
    const files = [];
    let manifest = null;
    for (const path of Object.keys(zip.files)) {
      const f = zip.files[path];
      if (f.dir) continue;
      const bytes = (await f.async('uint8array')).length;
      files.push({ path: path.split('/').pop(), bytes });
      if (path.endsWith('SMIR_PROVENANCE_MANIFEST.json')) manifest = JSON.parse(await f.async('string'));
    }
    return { zipBytes: zipBlob.size, files, manifest, trackNames: saved.tracks.map(t => t.name) };
  });

  console.log(`\nARCHIVE — ${report.zipBytes.toLocaleString()} bytes, ${report.files.length} files`);
  report.files.forEach(f => console.log(`  ${String(f.bytes).padStart(9)}  ${f.path}`));

  console.log(`\nPROJECT HAS ${report.trackNames.length} TRACKS: ${report.trackNames.join(', ')}`);
  const wavs = report.files.filter(f => f.path.endsWith('.wav') && !f.path.startsWith('00_'));
  console.log(`STEMS WRITTEN: ${wavs.length}  ${wavs.length < report.trackNames.length ? '← fewer than tracks, which is correct: empty tracks get no stem' : '← one per track'}`);

  const m = report.manifest;
  if (m) {
    console.log('\nMANIFEST');
    console.log('  provenance sha :', m.provenanceHashSha256 ?? 'null');
    console.log('  providers used :', JSON.stringify(m.openSourceProvidersUsed?.map(x => `${x.provider}@${x.version}`) || m.openSourceAdaptersUsed));
    console.log('  rendered       :', JSON.stringify(m.rendered));
    console.log('  not rendered   :', JSON.stringify(m.notRendered));
    console.log('  master         :', m.masterStereo);
  }
  console.log('\nPAGE ERRORS:', errs.join(' | ') || 'none');
  await b.close();
})();
