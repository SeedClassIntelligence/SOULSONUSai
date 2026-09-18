/**
 * Drives the whole HUM slice and checks that it survives a reload.
 *
 * Chromium is given a WAV as its capture device, so getUserMedia returns a
 * real hum and the app takes the path it takes for a person: record, stop,
 * analyse, hash, store, place a clip. Then the page is reloaded and every
 * link in that chain is checked again -- including decoding the stored blob,
 * because metadata surviving is not the same as audio surviving.
 *
 * What it does NOT prove is a physical microphone. That is a driver question,
 * not a pipeline one.
 *
 *   python3 scripts/make-hum-wav.py           # writes the C4 hum
 *   npm run dev                               # in one shell
 *   node scripts/verify-hum-slice.cjs         # in another
 *
 * Playwright is not a dependency of this project; point NODE_PATH at an
 * installation that has it, and SOULSONUS_CHROME at a browser if needed.
 */
const { chromium } = require('playwright');

const dump = async (page, label) => {
  const s = await page.evaluate(async () => {
    const read = (store) => new Promise((res) => {
      const req = indexedDB.open('SoulSonusStudioDB');
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(store)) return res(null);
        const all = db.transaction(store, 'readonly').objectStore(store).getAll();
        all.onsuccess = () => res(all.result);
        all.onerror = () => res('error');
      };
      req.onerror = () => res('open error');
    });
    const assets = await read('audio_assets');
    const proj = await read('project_state');
    const ls = (() => { try { return !!localStorage.getItem('soulsonus_active_project'); } catch { return false; } })();
    return {
      assetCount: Array.isArray(assets) ? assets.length : assets,
      assets: (Array.isArray(assets) ? assets : []).map(a => ({
        id: a.id, name: a.name, origin: a.originType,
        sha: (a.sha256 || '').slice(0, 12), bytes: a.sizeBytes,
        secs: a.durationSeconds,
        notes: (a.musicalAnalysis?.detectedNotes || []).map(n => n.note),
        basis: (a.musicalAnalysis?.basis || '').slice(0, 90),
      })),
      projectKeys: Array.isArray(proj) && proj[0]?.data ? Object.keys(proj[0].data) : null,
      creatorSoundsPersisted: Array.isArray(proj) && proj[0]?.data ? (proj[0].data.creatorSounds || []).length : null,
      persistedSoundNames: Array.isArray(proj) && proj[0]?.data
        ? (proj[0].data.creatorSounds || []).slice(0, 3).map(s => s.name) : null,
      localStorageHasProject: ls,
    };
  });
  console.log(`\n=== ${label} ===`);
  console.log('  assets in IndexedDB :', s.assetCount);
  s.assets.forEach(a => console.log(`    ${a.id}  ${a.name}\n      origin=${a.origin} sha=${a.sha}… bytes=${a.bytes} secs=${a.secs}\n      notes=${JSON.stringify(a.notes)}\n      basis="${a.basis}…"`));
  console.log('  persisted project keys :', JSON.stringify(s.projectKeys));
  console.log('  creatorSounds persisted:', s.creatorSoundsPersisted, JSON.stringify(s.persistedSoundNames));
  return s;
};

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.SOULSONUS_CHROME,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      `--use-file-for-fake-audio-capture=${process.env.SOULSONUS_HUM_WAV || '/tmp/soulsonus-hum-c4.wav'}`,
    ],
  });
  const ctx = await b.newContext({ viewport: { width: 1680, height: 1050 }, permissions: ['microphone'] });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));

  await p.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);

  // Creator Training is the landing room. Choose HUM.
  await p.locator('button', { hasText: /^Hum$/ }).first().click({ force: true });
  await p.waitForTimeout(400);
  // Keep the take AND put it in the session.
  await p.locator('text=Save + Add to Session').first().click({ force: true }).catch(() => {});
  await p.waitForTimeout(300);

  const rec = p.locator('button').filter({ hasText: /^[•■]\s*(RECORD|STOP RECORDING)$/ }).first();
  console.log('pressing RECORD…');
  await rec.click({ force: true });
  await p.waitForTimeout(3200);                       // hum into it
  console.log('button now reads:', (await rec.innerText()).trim());
  await rec.click({ force: true });                   // stop
  await p.waitForTimeout(3500);                       // analysis + store

  const before = await dump(p, 'AFTER RECORDING');
  await p.screenshot({ path: '/tmp/claude-0/step3-after-record.png' });

  console.log('\n--- reloading the browser ---');
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
  const after = await dump(p, 'AFTER RELOAD');

  // Did the library survive on screen?
  const humVisible = (await p.locator('text=/Hum Take \\d+/').count()) > 0;

  // The clip on the timeline, and whether the bytes themselves replay.
  const deep = await p.evaluate(async () => {
    const { assetStore } = await import('/src/services/assetStore.ts');
    const proj = await new Promise((res) => {
      const r = indexedDB.open('SoulSonusStudioDB');
      r.onsuccess = () => {
        const all = r.result.transaction('project_state','readonly').objectStore('project_state').getAll();
        all.onsuccess = () => res(all.result[0]?.data || null);
      };
    });
    const clips = [];
    for (const t of (proj?.tracks || [])) {
      for (const c of (t.clips || [])) if (c.assetId) clips.push({ track: t.name, clip: c.name, assetId: c.assetId });
    }
    const assets = await assetStore.getAllAssets();
    const a = assets.find(x => x.originType === 'creator_capture');
    let decoded = null;
    if (a && a.blob) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = await ctx.decodeAudioData(await a.blob.arrayBuffer());
        let peak = 0;
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i += 16) peak = Math.max(peak, Math.abs(d[i]));
        decoded = { seconds: Math.round(buf.duration * 100) / 100, rate: buf.sampleRate, peak: Math.round(peak * 1000) / 1000 };
      } catch (e) { decoded = 'decode failed: ' + String(e).slice(0, 60); }
    }
    return { assetBackedClips: clips, blobPresent: !!(a && a.blob), decoded };
  });
  console.log('  asset-backed clips     :', JSON.stringify(deep.assetBackedClips));
  console.log('  blob survived reload   :', deep.blobPresent);
  console.log('  re-decoded after reload:', JSON.stringify(deep.decoded));
  console.log('\n  "Hum Take" visible in My Sounds after reload :', humVisible);
  await p.screenshot({ path: '/tmp/claude-0/step3-after-reload.png' });

  console.log('\nPAGE ERRORS:', errs.join(' | ') || 'none');
  await b.close();
})();
