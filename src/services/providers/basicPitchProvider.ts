/**
 * Basic Pitch, behind an adapter.
 *
 * Spotify's note-transcription model — instrument-agnostic, polyphonic, and
 * small enough to run in the page. It replaces the autocorrelation estimator
 * that shipped with the export; it does not sit beside it. One capability, one
 * provider.
 *
 * PROVIDER STRUCTURES STOP HERE. Basic Pitch speaks in frames, onsets,
 * contours and `NoteEventTime`. Nothing above this file sees any of that: the
 * adapter hands back `CapturedNote[]`, which is ours. Swapping this for CREPE
 * or for something native later changes this file and nothing else.
 *
 * Provider record — verified by reading the installed package, not recalled:
 *
 *   capability   perception.notes.transcribe
 *   provider     @spotify/basic-pitch
 *   version      1.0.1
 *   code licence Apache-2.0        (node_modules/@spotify/basic-pitch/LICENSE)
 *   weights      Apache-2.0, shipped inside the package, ~904 KB
 *   runtime      @tensorflow/tfjs in the browser. No server, no GPU, no Python
 *   latency      assistive — seconds for a take, never in the audio callback
 *
 * The model is loaded lazily. TensorFlow is a large import and a studio that
 * cannot transcribe is still a studio that records, so nothing here is pulled
 * in until a take actually needs reading.
 */

import type { CapturedNote } from '../audioEngine';

/** Basic Pitch is trained at this rate and mono. Anything else is resampled. */
const MODEL_SAMPLE_RATE = 22050;
const MODEL_URL = `${import.meta.env.BASE_URL}models/basic-pitch/model.json`;

export const BASIC_PITCH_PROVIDER = {
  capability: 'perception.notes.transcribe',
  id: '@spotify/basic-pitch',
  version: '1.0.1',
  codeLicence: 'Apache-2.0',
  weightsLicence: 'Apache-2.0',
  commercialUse: 'CLEARED',
  runsIn: 'browser',
} as const;

export type TranscriptionResult =
  | { ok: true; notes: CapturedNote[]; basis: string }
  | { ok: false; reason: string };

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** MIDI number to the name and frequency this platform speaks in. */
const fromMidi = (midi: number) => ({
  note: `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`,
  frequency: Math.round(440 * Math.pow(2, (midi - 69) / 12) * 10) / 10,
});

interface BasicPitchModule {
  BasicPitch: any;
  outputToNotesPoly: any;
  noteFramesToTime: any;
  addPitchBendsToNoteEvents: any;
}

let enginePromise: Promise<BasicPitchModule> | null = null;

const loadEngine = (): Promise<BasicPitchModule> => {
  if (!enginePromise) {
    enginePromise = import('@spotify/basic-pitch') as unknown as Promise<BasicPitchModule>;
  }
  return enginePromise;
};

let modelPromise: Promise<any> | null = null;

/**
 * Resamples to what the model was trained on.
 *
 * An OfflineAudioContext does this properly — the browser's own resampler,
 * rather than picking every nth sample, which is how aliasing gets mistaken
 * for a wrong note.
 */
async function toModelRate(buffer: AudioBuffer): Promise<AudioBuffer> {
  if (buffer.sampleRate === MODEL_SAMPLE_RATE && buffer.numberOfChannels === 1) {
    return buffer;
  }
  const frames = Math.max(1, Math.ceil(buffer.duration * MODEL_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, MODEL_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start();
  return offline.startRendering();
}

/**
 * Reads the notes in a take.
 *
 * Returns a failure rather than a guess. If the model cannot be fetched — no
 * network on first load, a blocked request, a build without the weights copied
 * — that is the answer, and the studio says so. It does not quietly fall back
 * to a worse estimator and present the result the same way.
 */
export async function transcribeNotes(buffer: AudioBuffer): Promise<TranscriptionResult> {
  let engine: BasicPitchModule;
  try {
    engine = await loadEngine();
  } catch (err) {
    return { ok: false, reason: 'The note-reading model could not be loaded in this browser.' };
  }

  const { BasicPitch, outputToNotesPoly, noteFramesToTime, addPitchBendsToNoteEvents } = engine;

  if (!modelPromise) {
    modelPromise = Promise.resolve(new BasicPitch(MODEL_URL));
  }

  let basicPitch: any;
  try {
    basicPitch = await modelPromise;
  } catch {
    modelPromise = null;
    return { ok: false, reason: 'The note-reading model could not be downloaded.' };
  }

  const resampled = await toModelRate(buffer);

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  try {
    await basicPitch.evaluateModel(
      resampled,
      (f: number[][], o: number[][], c: number[][]) => {
        frames.push(...f);
        onsets.push(...o);
        contours.push(...c);
      },
      () => {}
    );
  } catch (err) {
    modelPromise = null;
    return { ok: false, reason: 'The note-reading model failed while reading this take.' };
  }

  // The thresholds are the model's own defaults, named rather than tuned.
  // Tuning them is a decision about what counts as a note, and that is the
  // owner's, not a number picked here to make a demo look good.
  const ONSET_THRESHOLD = 0.5;
  const FRAME_THRESHOLD = 0.3;
  const MIN_NOTE_FRAMES = 5;

  const polyphonic = outputToNotesPoly(
    frames,
    onsets,
    ONSET_THRESHOLD,
    FRAME_THRESHOLD,
    MIN_NOTE_FRAMES
  );
  const withBends = addPitchBendsToNoteEvents(contours, polyphonic);
  const timed = noteFramesToTime(withBends);

  const notes: CapturedNote[] = timed
    .map((n: any) => {
      const { note, frequency } = fromMidi(n.pitchMidi);
      return {
        note,
        midi: n.pitchMidi,
        startTime: Math.round(n.startTimeSeconds * 100) / 100,
        duration: Math.round(n.durationSeconds * 100) / 100,
        frequency,
      };
    })
    .sort((a: CapturedNote, b: CapturedNote) => a.startTime - b.startTime);

  return {
    ok: true,
    notes,
    basis:
      `${notes.length} note${notes.length === 1 ? '' : 's'} read by Basic Pitch ` +
      `${BASIC_PITCH_PROVIDER.version} in this browser, at ${MODEL_SAMPLE_RATE} Hz, ` +
      `onset threshold ${ONSET_THRESHOLD} and frame threshold ${FRAME_THRESHOLD}. ` +
      `Polyphonic — overlapping notes are reported separately.`,
  };
}
