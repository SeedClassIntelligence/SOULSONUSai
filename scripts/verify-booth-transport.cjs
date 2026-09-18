/**
 * The Booth's record button, and the stop button beside it.
 *
 * Two behaviours reported from live use and fixed together:
 *   1. Record started the transport, so a fresh session began playing its
 *      seeded demo clips over whatever the creator was trying to capture.
 *   2. Stop set isRecording to false and never finalised the take. The
 *      recorder kept running and the performance was silently discarded.
 *
 *   python3 scripts/make-hum-wav.py
 *   npm run dev
 *   node scripts/verify-booth-transport.cjs
 */
const { chromium } = require('playwright');

const assets = (p) => p.evaluate(() => new Promise((res) => {
  const r = indexedDB.open('SoulSonusStudioDB');
  r.onsuccess = () => {
    const db = r.result;
    if (!db.objectStoreNames.contains('audio_assets')) return res([]);
    const all = db.transaction('audio_assets', 'readonly').objectStore('audio_assets').getAll();
    all.onsuccess = () => res(all.result.map(a => ({ id: a.id, origin: a.originType, bytes: a.sizeBytes })));
  };
  r.onerror = () => res([]);
}));

const clockText = (p) => p.evaluate(() => {
  const m = document.body.innerText.match(/\b\d{2}:\d{2}:\d{2}\b/);
  return m ? m[0] : null;
});

(async () => {
  const b = await chromium.launch({
    executablePath: process.env.SOULSONUS_CHROME,
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
           `--use-file-for-fake-audio-capture=${process.env.SOULSONUS_HUM_WAV || '/tmp/soulsonus-hum-c4.wav'}`],
  });
  const p = await (await b.newContext({ viewport: { width: 1680, height: 1050 }, permissions: ['microphone'] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(2000);

  // Into the Booth — the room whose mic circle is the record button.
  await p.locator('button[title="The Booth (Recording)"]').first().click({ force: true });
  await p.waitForTimeout(1200);

  const boothRecord = p.locator('button').filter({ hasText: /^(RECORD|RECORDING)$/ }).first();
  const topStop = p.locator('button[title="Stop"]').first();

  const before = await clockText(p);
  await boothRecord.click({ force: true });
  await p.waitForTimeout(2500);
  const during = await clockText(p);
  const label = (await boothRecord.innerText()).trim();

  console.log('1. RECORD MUST NOT START THE SONG');
  console.log(`   button now reads : ${label}`);
  console.log(`   playhead before  : ${before}`);
  console.log(`   playhead during  : ${during}`);
  console.log(`   ${before === during ? 'PASS — the transport stayed put' : 'FAIL — the song started playing'}`);

  const started = await assets(p);
  console.log('\n2. STOP MUST KEEP THE TAKE');
  console.log(`   assets before stop: ${started.length}`);
  await topStop.click({ force: true });
  await p.waitForTimeout(3500);
  const after = await assets(p);
  const booth = after.filter(a => a.origin === 'booth_recording');
  console.log(`   assets after stop : ${after.length}  (booth takes: ${booth.length})`);
  booth.forEach(a => console.log(`     ${a.id}  ${a.bytes} bytes`));
  console.log(`   ${booth.length > 0 ? 'PASS — the performance was kept' : 'FAIL — the take was discarded'}`);

  console.log('\nPAGE ERRORS:', errs.join(' | ') || 'none');
  await b.close();
})();
