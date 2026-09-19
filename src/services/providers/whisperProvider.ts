/**
 * Whisper, behind an adapter, in the browser.
 *
 * Speech only. Whisper is trained on speech, and a sung take is a different
 * problem — held vowels, melisma and wide pitch movement are exactly what its
 * training does not cover. Vocal-to-Lyric is deliberately NOT wired to this
 * (ledger §8.3): that room still says it is unbuilt, which is more honest than
 * a confident wrong transcription of somebody singing.
 *
 * PROVIDER STRUCTURES STOP HERE, as they do in basicPitchProvider. What comes
 * back is a plain string and a basis sentence. Swapping this for a service
 * later changes this file and nothing above it.
 *
 * Provider record — read from the installed package, not recalled:
 *
 *   capability   transcription.vocal
 *   provider     @huggingface/transformers  (transformers.js)
 *   version      4.3.0
 *   code licence Apache-2.0
 *   weights      Whisper, OpenAI — LICENCE NOT YET READ, see ledger §8.5
 *   runtime      onnxruntime-web in the page. No server, no GPU, no Python
 *   latency      assistive — seconds, never in the audio callback
 *
 * THE MODEL IS SERVED FROM THIS PROJECT, not fetched from huggingface at
 * runtime. `scripts/fetch-whisper-model.mjs` downloads it once. That keeps the
 * studio working with no network, keeps the weights we shipped knowable, and
 * spares a creator a download the first time they speak. If it is missing,
 * this says so and says how to get it — it does not reach across the network
 * on its own, and it does not invent a transcript.
 */

/** Whisper is trained at 16 kHz, mono. */
const MODEL_SAMPLE_RATE = 16000;
const MODEL_ID = 'whisper-tiny.en';
const LOCAL_MODEL_ROOT = '/models/whisper/';

export const WHISPER_PROVIDER = {
  capability: 'transcription.vocal',
  id: '@huggingface/transformers',
  version: '4.3.0',
  model: MODEL_ID,
  codeLicence: 'Apache-2.0',
  weightsLicence: 'UNVERIFIED',
  commercialUse: 'UNVERIFIED',
  runsIn: 'browser',
} as const;

export type TranscriptResult =
  | { ok: true; text: string; basis: string }
  | { ok: false; reason: string };

/** The capture modes that carry speech. Everything else is not this provider's job. */
export const SPEECH_MODES = ['SPEAK', 'SPEECH'] as const;
export const isSpeechMode = (mode: string) =>
  SPEECH_MODES.some((m) => mode.toUpperCase().includes(m));

let pipelinePromise: Promise<any> | null = null;

/**
 * Is the model actually on disk?
 *
 * Asked by fetching a file and reading it, not by trusting a status code. The
 * dev server answers any unknown path with index.html and HTTP 200 — an SPA
 * fallback — so a missing model looks like a successful request for a page,
 * and the loader downstream fails on "Unexpected token <" instead of saying
 * the model is not installed. The check is cheap and it is the difference
 * between an instruction and a mystery.
 */
async function modelIsInstalled(): Promise<boolean> {
  try {
    const res = await fetch(`${LOCAL_MODEL_ROOT}${MODEL_ID}/config.json`);
    if (!res.ok) return false;
    const body = await res.text();
    if (body.trimStart().startsWith('<')) return false; // the SPA fallback
    const parsed = JSON.parse(body);
    return typeof parsed === 'object' && parsed !== null && 'model_type' in parsed;
  } catch {
    return false;
  }
}

async function loadPipeline(): Promise<any> {
  if (pipelinePromise) return pipelinePromise;

  pipelinePromise = (async () => {
    const tf: any = await import('@huggingface/transformers');

    // Local only, on purpose. Without this transformers.js reaches for
    // huggingface.co the first time a creator speaks, which is a network
    // dependency nobody asked for and a different set of weights than the
    // ones we shipped.
    tf.env.allowRemoteModels = false;
    tf.env.allowLocalModels = true;
    tf.env.localModelPath = LOCAL_MODEL_ROOT;

    return tf.pipeline('automatic-speech-recognition', MODEL_ID);
  })();

  return pipelinePromise;
}

/** Resamples to the rate the model was trained on, using the browser's own resampler. */
async function toModelRate(buffer: AudioBuffer): Promise<Float32Array> {
  if (buffer.sampleRate === MODEL_SAMPLE_RATE && buffer.numberOfChannels === 1) {
    return buffer.getChannelData(0);
  }
  const frames = Math.max(1, Math.ceil(buffer.duration * MODEL_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, MODEL_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}

/**
 * Reads the words in a spoken take.
 *
 * Returns a failure rather than a guess, and the failure says what to do. An
 * empty transcript is also a real answer: the creator pressed record and said
 * nothing, and that is reported rather than filled in.
 */
export async function transcribeSpeech(buffer: AudioBuffer): Promise<TranscriptResult> {
  if (!(await modelIsInstalled())) {
    return {
      ok: false,
      reason:
        'The speech model is not installed, so this take was kept but not read. ' +
        'Run: node scripts/fetch-whisper-model.mjs',
    };
  }

  let transcriber: any;
  try {
    transcriber = await loadPipeline();
  } catch {
    pipelinePromise = null;
    return { ok: false, reason: 'The speech model could not be loaded in this browser.' };
  }

  const samples = await toModelRate(buffer);

  let output: any;
  try {
    output = await transcriber(samples);
  } catch {
    return { ok: false, reason: 'The speech model failed while reading this take.' };
  }

  const text = String(output?.text ?? '').trim();

  if (!text) {
    return {
      ok: true,
      text: '',
      basis: `No words were heard in this pass. Read by Whisper ${MODEL_ID} in this browser.`,
    };
  }

  return {
    ok: true,
    text,
    basis:
      `${text.split(/\s+/).length} word${text.split(/\s+/).length === 1 ? '' : 's'} ` +
      `read by Whisper ${MODEL_ID} in this browser at ${MODEL_SAMPLE_RATE} Hz. ` +
      `Trained on speech — a sung take is not what this reads well.`,
  };
}
