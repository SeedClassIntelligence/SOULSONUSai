/**
 * The speech path, with and without the model installed.
 *
 * What this can prove anywhere: a spoken take routes to Whisper rather than to
 * the note transcriber, an absent model is reported as an instruction rather
 * than a mystery, and nothing false is written either way.
 *
 * What it cannot prove without the weights: that the words come back right.
 * That needs `node scripts/fetch-whisper-model.mjs` on a machine that can
 * reach huggingface.co, and then a person saying something into it.
 *
 *   npm run dev
 *   node scripts/verify-speech.cjs
 */
const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SOULSONUS_CHROME });
  const p = await (await b.newContext({ permissions: [] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1500);

  const out = await p.evaluate(async () => {
    const { audioEngine } = await import('/src/services/audioEngine.ts');
    const { isSpeechMode } = await import('/src/services/providers/whisperProvider.ts');

    const wav = (seconds = 2, rate = 16000) => {
      const n = Math.floor(rate * seconds);
      const buf = new ArrayBuffer(44 + n * 2); const v = new DataView(buf);
      const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
      str(0,'RIFF'); v.setUint32(4,36+n*2,true); str(8,'WAVE'); str(12,'fmt ');
      v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,1,true);
      v.setUint32(24,rate,true); v.setUint32(28,rate*2,true); v.setUint16(32,2,true);
      v.setUint16(34,16,true); str(36,'data'); v.setUint32(40,n*2,true);
      // Rough voiced buzz — enough to be above the noise floor.
      for (let i=0;i<n;i++){ const t=i/rate;
        const s=(Math.sin(2*Math.PI*120*t)*0.4+Math.sin(2*Math.PI*240*t)*0.2)*(0.6+0.4*Math.sin(t*9));
        v.setInt16(44+i*2, Math.max(-1,Math.min(1,s))*0x7fff, true); }
      return new Blob([buf],{type:'audio/wav'});
    };

    const speak = await audioEngine.analyzeAudioBlob(wav(), 'SPEAK');
    const hum   = await audioEngine.analyzeAudioBlob(wav(), 'HUM');

    return {
      modeRouting: { SPEAK: isSpeechMode('SPEAK'), Speak: isSpeechMode('Speak'), HUM: isSpeechMode('HUM'), Beatbox: isSpeechMode('Beatbox') },
      speak: { transcript: speak.transcript, notes: speak.detectedNotes.length, key: speak.dominantKey, basis: speak.basis },
      hum:   { transcript: hum.transcript,   notes: hum.detectedNotes.length,   key: hum.dominantKey,   basis: hum.basis.slice(0, 80) },
    };
  });

  console.log('MODE ROUTING (only speech goes to Whisper)');
  console.log('  ', JSON.stringify(out.modeRouting));

  console.log('\nSPEAK take, model NOT installed');
  console.log('   transcript :', JSON.stringify(out.speak.transcript), out.speak.transcript === null ? '← null, not invented words' : '← UNEXPECTED');
  console.log('   notes      :', out.speak.notes, out.speak.notes === 0 ? '← 0, speech is not asked for notes' : '← UNEXPECTED');
  console.log('   key        :', out.speak.key);
  console.log('   basis      :', out.speak.basis);

  console.log('\nHUM take, same audio');
  console.log('   transcript :', JSON.stringify(out.hum.transcript), out.hum.transcript === null ? '← null, a hum has no words' : '← UNEXPECTED');
  console.log('   notes      :', out.hum.notes, '← read by Basic Pitch');
  console.log('   basis      :', out.hum.basis + '…');

  const instructs = /fetch-whisper-model/.test(out.speak.basis);
  console.log(`\n${instructs ? 'PASS' : 'FAIL'} — the missing model is an instruction, not a mystery`);
  console.log('PAGE ERRORS:', errs.join(' | ') || 'none');
  await b.close();
})();
