/**
 * Measures the pitch estimator against frequencies we know.
 *
 * This is the evidence behind the ledger's Step 2b, kept runnable rather than
 * quoted. It builds WAV blobs inside the page -- a pure sine and a four-
 * harmonic tone closer to an actual hum -- hands them to analyzeAudioBlob, and
 * compares the note and the cents error against what was fed in.
 *
 * Before the fix this reported 440 Hz as 110 Hz. Two octaves.
 *
 *   npm run dev                       # in one shell
 *   node scripts/verify-pitch.cjs     # in another
 *
 * Playwright is not a dependency of this project. If it is not resolvable,
 * point NODE_PATH at an installation that has it, and set SOULSONUS_CHROME if
 * Playwright's own browser download is not where it expects.
 */
const { chromium } = require('playwright');
(async () => {
  const CHROME = process.env.SOULSONUS_CHROME;
  const b = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
  const p = await (await b.newContext({ permissions: [] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0,160)));
  await p.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1200);
  const rows = await p.evaluate(async () => {
    const { audioEngine } = await import('/src/services/audioEngine.ts');
    const wav = (fn, seconds = 2, rate = 44100) => {
      const n = Math.floor(rate * seconds);
      const buf = new ArrayBuffer(44 + n*2); const v = new DataView(buf);
      const str = (o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
      str(0,'RIFF'); v.setUint32(4,36+n*2,true); str(8,'WAVE'); str(12,'fmt ');
      v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
      v.setUint32(24,rate,true); v.setUint32(28,rate*2,true); v.setUint16(32,2,true);
      v.setUint16(34,16,true); str(36,'data'); v.setUint32(40,n*2,true);
      for (let i=0;i<n;i++) v.setInt16(44+i*2, Math.max(-1,Math.min(1,fn(i/rate)))*0x7fff, true);
      return new Blob([buf],{type:'audio/wav'});
    };
    // A sine, and a harmonically rich tone closer to an actual hum.
    const sine = f => t => Math.sin(2*Math.PI*f*t) * 0.6;
    const hum  = f => t => (Math.sin(2*Math.PI*f*t)*0.5 + Math.sin(2*Math.PI*f*2*t)*0.3
                          + Math.sin(2*Math.PI*f*3*t)*0.18 + Math.sin(2*Math.PI*f*4*t)*0.1) * 0.7;
    const probe = async (label, f, gen) => {
      const r = await audioEngine.analyzeAudioBlob(wav(gen(f)), 'HUM');
      const n = r.detectedNotes[0];
      return { label, fed: f, got: n ? n.frequency : null, note: n ? n.note : null,
               count: r.detectedNotes.length };
    };
    const out = [];
    for (const f of [110, 130.81, 220, 261.63, 440, 659.25]) out.push(await probe('sine', f, sine));
    for (const f of [110, 130.81, 220, 261.63, 440]) out.push(await probe('hum', f, hum));
    return out;
  });
  const expect = { 110:'A2', 130.81:'C3', 220:'A3', 261.63:'C4', 440:'A4', 659.25:'E5' };
  let bad = 0;
  for (const r of rows) {
    const cents = r.got ? Math.round(1200 * Math.log2(r.got / r.fed)) : null;
    const ok = r.note === expect[r.fed] && Math.abs(cents) <= 25;
    if (!ok) bad++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${r.label.padEnd(5)} fed ${String(r.fed).padEnd(7)} -> ${String(r.got).padEnd(7)} ${String(r.note).padEnd(4)} expect ${expect[r.fed].padEnd(4)} ${cents === null ? '' : `${cents >= 0 ? '+' : ''}${cents} cents`}`);
  }
  console.log(bad === 0 ? '\nALL PASS' : `\n${bad} FAILED`);
  if (bad > 0) process.exitCode = 1;
  console.log('PAGE ERRORS:', errs.join(' | ') || 'none');
  await b.close();
})();
