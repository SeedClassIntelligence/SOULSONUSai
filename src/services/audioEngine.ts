import { transcribeNotes } from './providers/basicPitchProvider';

/**
 * What the capture path hands back.
 *
 * A discriminated union rather than a boolean, because the interesting case
 * is the failure and the creator has to be told which failure it was. `reason`
 * is a sentence for a person, never a code.
 */
export type MicResult = { ok: true } | { ok: false; reason: string };

export interface CapturedNote {
  note: string;
  midi: number;
  startTime: number;
  duration: number;
  frequency: number;
}

export interface FundamentalRange {
  lowNote: string;
  highNote: string;
  lowFreq: number;
  highFreq: number;
}

/**
 * What a pass was actually able to read.
 *
 * `dominantKey` and `fundamentalRange` are nullable on purpose. Null means
 * nothing established them, which is a real answer and the one that was
 * missing: before this they were a hard-coded string and a pair of defaults,
 * so every take in the library agreed it was in C minor.
 */
export interface TakeAnalysis {
  /** Read off the decoded buffer, not declared. */
  sampleRate: number | null;
  /** The decoded length, which is the take's real duration. */
  measuredSeconds: number | null;
  waveformPoints: number[];
  pitchContour: number[];
  detectedNotes: CapturedNote[];
  dominantKey: string | null;
  fundamentalRange: FundamentalRange | null;
  /** What this pass read, and what it could not. Never empty. */
  basis: string;
}

export type TakeResult =
  | ({ ok: true; blob: Blob; durationSeconds: number } & TakeAnalysis)
  | { ok: false; reason: string };

/** Turns a getUserMedia rejection into something worth showing a creator. */
export function describeMicFailure(err: unknown): string {
  const name = (err as { name?: string } | null)?.name;
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'The microphone was not allowed. Grant access and try the take again.';
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'No microphone was found on this device.';
    case 'NotReadableError':
      return 'The microphone is in use by something else.';
    default:
      return 'The microphone did not open.';
  }
}

class AudioEngineService {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private bpm: number = 110;
  private playbackInterval: number | null = null;
  private currentStep: number = 0;
  private playheadTime: number = 0;
  private onPlayheadUpdate?: (seconds: number, bar: number, beat: number) => void;
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private isMicRecording: boolean = false;
  private micLevelCallback?: (level: number, waveform: number[]) => void;
  private masterGain: GainNode | null = null;

  public init(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public setBpm(newBpm: number) {
    this.bpm = newBpm;
  }

  // --- Piano / Keys Synthesizer ---
  public playNote(freq: number, type: OscillatorType = 'triangle', duration = 0.8) {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Warm rhodes-like filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  // --- Drum Synthesizer for Beat Machine ---
  public playDrum(sound: 'kick' | 'snare' | 'hihat' | 'clap' | 'sub' | 'tom' | 'rim' | 'perc') {
    const ctx = this.init();
    const now = ctx.currentTime;

    if (sound === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (sound === 'snare') {
      // Noise component
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(900, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain || ctx.destination);
      noise.start(now);

      // Tonal component
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (sound === 'hihat') {
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      noise.start(now);
    } else if (sound === 'clap') {
      const bufferSize = ctx.sampleRate * 0.14;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      noise.start(now);
    } else if (sound === 'sub') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.4);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      // General percussion / rim / tom
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(sound === 'tom' ? 120 : 440, now);
      osc.frequency.exponentialRampToValueAtTime(sound === 'tom' ? 70 : 180, now + 0.1);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    }
  }

  // --- Metronome Click ---
  public playClick(isAccent = false) {
    const ctx = this.init();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(isAccent ? 1200 : 800, now);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // --- Multi-track DAW Sequencer Loop ---
  public startTransport(
    tracksState: { id: string; muted: boolean; soloed: boolean; volume: number }[],
    hasSoloActive: boolean,
    onPlayhead: (seconds: number, bar: number, beat: number) => void,
    metroEnabled: boolean = true
  ) {
    this.init();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.onPlayheadUpdate = onPlayhead;

    const stepDurationMs = (60000 / this.bpm) / 4; // 16th note in ms

    // Bassline notes for C minor soul groove
    const bassline = [
      65.41, 0, 65.41, 0, // C2
      77.78, 0, 87.31, 0, // Eb2, F2
      98.00, 0, 0, 87.31, // G2, F2
      58.27, 0, 65.41, 0  // Bb1, C2
    ];

    // Chords: Cm9 (C, Eb, G, Bb, D) & Fm9 (F, Ab, C, Eb, G)
    const chordVoicings = [
      [261.63, 311.13, 392.00, 466.16], // Cm7
      [174.61, 207.65, 261.63, 311.13], // Fm7
    ];

    this.playbackInterval = window.setInterval(() => {
      if (!this.isPlaying) return;

      const step = this.currentStep % 16;
      const beat = Math.floor(step / 4) + 1;
      const bar = Math.floor(this.currentStep / 16) + 1;
      this.playheadTime += stepDurationMs / 1000;

      if (this.onPlayheadUpdate) {
        this.onPlayheadUpdate(this.playheadTime, bar, beat);
      }

      // Check track muting / soloing
      const canPlay = (trackId: string) => {
        const t = tracksState.find(x => x.id === trackId);
        if (!t) return true;
        if (hasSoloActive) return t.soloed;
        return !t.muted;
      };

      // Metronome on quarter notes (step 0, 4, 8, 12)
      if (metroEnabled && step % 4 === 0) {
        this.playClick(step === 0);
      }

      // Track 01: Drums / Kick
      if (canPlay('t1')) {
        if (step === 0 || step === 8 || step === 10) {
          this.playDrum('kick');
        }
        if (step === 4 || step === 12) {
          this.playDrum('snare');
        }
        if (step % 2 === 0) {
          this.playDrum('hihat');
        }
      }

      // Track 04: Marcus Bass
      if (canPlay('t4')) {
        const noteFreq = bassline[step];
        if (noteFreq && noteFreq > 0) {
          this.playNote(noteFreq, 'sawtooth', 0.18);
        }
      }

      // Track 02: Elena Keys (stabs on step 0 and 6)
      if (canPlay('t2')) {
        if (step === 0 || step === 6) {
          const chord = chordVoicings[Math.floor((step / 8) % 2)];
          chord.forEach(f => this.playNote(f, 'sine', 0.45));
        }
      }

      // Track 03: Lead Vocal synth hum
      if (canPlay('t3')) {
        if (step === 2 || step === 7 || step === 11) {
          this.playNote(392.00, 'sine', 0.28); // G4
        }
      }

      this.currentStep++;
      if (this.currentStep >= 64) {
        // Loop after 4 bars
        this.currentStep = 0;
      }
    }, stepDurationMs);
  }

  public stopTransport() {
    this.isPlaying = false;
    if (this.playbackInterval !== null) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  public resetTransport() {
    this.stopTransport();
    this.currentStep = 0;
    this.playheadTime = 0;
    if (this.onPlayheadUpdate) {
      this.onPlayheadUpdate(0, 1, 1);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // --- Microphone & Recording Support ---
  /**
   * Opens the microphone and reports its level and waveform.
   *
   * There used to be a fallback here. When getUserMedia threw -- permission
   * denied, no device, a frame that forbids it -- this generated a waveform
   * out of a sine and a cosine and fed it to the meter on a 60 ms interval,
   * and returned true. A creator who had denied the microphone watched a
   * level move and a waveform draw while the studio heard nothing at all.
   *
   * A meter is an instrument. It reports what is there or it reports that
   * nothing is. It does not perform.
   */
  public async startMicMonitoring(
    callback: (level: number, waveform: number[]) => void
  ): Promise<MicResult> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { ok: false, reason: 'This browser does not offer microphone access.' };
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (err) {
      return { ok: false, reason: describeMicFailure(err) };
    }

    this.micLevelCallback = callback;
    this.isMicRecording = true;
    this.micStream = stream;

    const ctx = this.init();
    this.micSource = ctx.createMediaStreamSource(stream);
    this.micAnalyser = ctx.createAnalyser();
    this.micAnalyser.fftSize = 64;
    this.micSource.connect(this.micAnalyser);

    const dataArray = new Uint8Array(this.micAnalyser.frequencyBinCount);
    const update = () => {
      if (!this.isMicRecording || !this.micAnalyser) return;
      this.micAnalyser.getByteFrequencyData(dataArray);
      let sum = 0;
      const wave: number[] = [];
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
        wave.push(dataArray[i] / 255);
      }
      const level = Math.min(1, sum / dataArray.length / 140);
      this.micLevelCallback?.(level, wave.slice(0, 16));
      requestAnimationFrame(update);
    };
    update();

    return { ok: true };
  }


  private activeMediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime: number = 0;
  private activeAudioElement: HTMLAudioElement | null = null;

  /**
   * Arms the recorder, or says why it could not.
   *
   * This returned true unconditionally. When getUserMedia or MediaRecorder
   * failed it warned about "pristine synthetic capture" and carried on, and
   * stopRealRecording then manufactured a WAV to stand in for the take. That
   * blob was hashed, signed and filed as the creator's own original work.
   * There is no substitute for a performance. If the microphone did not open,
   * that is the result.
   */
  public async startRealRecording(): Promise<MicResult> {
    this.recordedChunks = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { ok: false, reason: 'This browser does not offer microphone access.' };
    }
    if (typeof MediaRecorder === 'undefined') {
      return { ok: false, reason: 'This browser cannot record audio (no MediaRecorder).' };
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      return { ok: false, reason: describeMicFailure(err) };
    }

    this.micStream = stream;

    let mimeType = 'audio/webm;codecs=opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';
    }

    try {
      this.activeMediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
    } catch (err) {
      this.releaseMicStream();
      return { ok: false, reason: describeMicFailure(err) };
    }

    this.activeMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.recordingStartTime = Date.now();
    this.activeMediaRecorder.start(100);
    this.isMicRecording = true;
    return { ok: true };
  }

  /** Releases the input stream. Safe to call when nothing is open. */
  private releaseMicStream() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
  }

  /**
   * Ends the take and hands back what was actually captured.
   *
   * Returns a failure rather than a stand-in. An empty recording is a real
   * outcome -- the creator pressed record and stop without performing, or the
   * stream produced nothing -- and it is reported as one. Nothing downstream
   * should ever receive audio this method invented, because everything
   * downstream hashes it and calls it the creator's.
   */
  public async stopRealRecording(mode: string = 'HUM'): Promise<TakeResult> {
    const elapsedSeconds = (Date.now() - this.recordingStartTime) / 1000;
    this.isMicRecording = false;

    const recorder = this.activeMediaRecorder;
    this.activeMediaRecorder = null;

    if (!recorder) {
      this.releaseMicStream();
      return { ok: false, reason: 'Nothing was recording, so there is no take to keep.' };
    }

    if (recorder.state !== 'inactive') {
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
        recorder.stop();
      });
    }

    this.releaseMicStream();

    if (this.recordedChunks.length === 0) {
      return { ok: false, reason: 'The microphone was open but captured nothing.' };
    }

    const blob = new Blob(this.recordedChunks, { type: recorder.mimeType || 'audio/webm' });
    this.recordedChunks = [];

    if (blob.size === 0) {
      return { ok: false, reason: 'The microphone was open but captured nothing.' };
    }

    const analysis = await this.analyzeAudioBlob(blob, mode);

    return {
      ok: true,
      blob,
      durationSeconds: Math.round(elapsedSeconds * 10) / 10,
      ...analysis,
    };
  }



  // Audio Analysis: extracts F0 pitch contour, detected MIDI notes, and waveform points
  /**
   * Reads a take, and reports only what it actually read.
   *
   * Two things are read: the block RMS behind the waveform, measured here, and
   * the notes, which Basic Pitch reads behind its adapter. Everything else
   * used to be furniture around a hand-written estimator. `dominantKey` was the literal string
   * "C Minor (Cm9)" and was returned whatever was sung. A slice with no
   * detectable pitch caused three notes -- C3, Eb3, G3 -- to be pushed into
   * `detectedNotes` and handed on as detected. An empty contour fell back to
   * a hard-coded array of eight values. And the whole thing was wrapped in a
   * catch that answered a failed decode with a four-note analysis, complete
   * with frequencies.
   *
   * A pass that read nothing says it read nothing. `basis` carries that
   * sentence, is never empty, and is what the rooms show instead of inventing
   * a reading of their own.
   */
  public async analyzeAudioBlob(blob: Blob, mode: string = 'HUM'): Promise<TakeAnalysis> {
    const EMPTY = (basis: string): TakeAnalysis => ({
      sampleRate: null,
      measuredSeconds: null,
      waveformPoints: [],
      pitchContour: [],
      detectedNotes: [],
      dominantKey: null,
      fundamentalRange: null,
      basis,
    });

    let audioBuffer: AudioBuffer;
    try {
      const ctx = this.init();
      const arrayBuffer = await blob.arrayBuffer();
      audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    } catch {
      return EMPTY('The recording could not be decoded, so nothing was read from it.');
    }

    const channelData = audioBuffer.getChannelData(0);
    if (channelData.length === 0) {
      return EMPTY('The recording held no samples.');
    }

    // --- Waveform: mean absolute amplitude per block. Measured. ---
    const NUM_POINTS = 24;
    const blockSize = Math.max(1, Math.floor(channelData.length / NUM_POINTS));
    const waveformPoints: number[] = [];
    let peak = 0;

    for (let i = 0; i < NUM_POINTS; i++) {
      let sum = 0;
      const start = i * blockSize;
      for (let j = 0; j < blockSize; j++) {
        const v = Math.abs(channelData[start + j] || 0);
        sum += v;
        if (v > peak) peak = v;
      }
      waveformPoints.push(Math.round(Math.min(1, (sum / blockSize) * 3.5) * 100) / 100);
    }

    // Below this the input is the room, not a performance. Stated rather than
    // guessed at: it is the threshold the note detection below also uses.
    const NOISE_FLOOR = 0.01;
    if (peak < NOISE_FLOOR) {
      return {
        ...EMPTY(
          `Nothing was heard on this pass — the loudest sample reached ${peak.toFixed(4)}, ` +
            `below the ${NOISE_FLOOR} floor. The audio is kept; there is simply nothing in it to read.`
        ),
        sampleRate: audioBuffer.sampleRate,
        measuredSeconds: Math.round(audioBuffer.duration * 100) / 100,
        waveformPoints,
      };
    }

    // --- Notes: Basic Pitch, behind its adapter. ---
    //
    // What stood here was a normalised autocorrelation over eight slices,
    // written by hand. It was made accurate — eleven tones to zero cents — and
    // it was still the wrong thing to have: monophonic, eight readings across
    // a whole take so short notes merged, and a substitute for a part that
    // already exists and does the job properly.
    //
    // Basic Pitch is polyphonic, instrument-agnostic, frame-rate accurate, and
    // runs in this browser from weights that ship in the package. The adapter
    // is the only file that knows any of that.
    const read = await transcribeNotes(audioBuffer);

    if (!read.ok) {
      return {
        ...EMPTY(`${read.reason} The audio is kept and can be read again once it is available.`),
        sampleRate: audioBuffer.sampleRate,
        measuredSeconds: Math.round(audioBuffer.duration * 100) / 100,
        waveformPoints,
      };
    }

    const detectedNotes: CapturedNote[] = read.notes;

    // The contour the rooms draw: one normalised point per note, in time.
    const pitchContour = detectedNotes.map((n) =>
      Math.round(Math.min(1, Math.max(0, (n.frequency - 80) / 400)) * 100) / 100
    );


    if (detectedNotes.length === 0) {
      return {
        ...EMPTY(
          `${mode} pass, ${audioBuffer.duration.toFixed(1)}s: audio was present, and Basic Pitch ` +
            `found no notes in it. Percussive and unvoiced material reads this way.`
        ),
        sampleRate: audioBuffer.sampleRate,
        measuredSeconds: Math.round(audioBuffer.duration * 100) / 100,
        waveformPoints,
      };
    }

    // The range is the lowest and highest note found, not the first and last
    // in time. Those were the same field until this was read properly.
    const byPitch = [...detectedNotes].sort((a, b) => a.frequency - b.frequency);
    const lowest = byPitch[0];
    const highest = byPitch[byPitch.length - 1];

    return {
      sampleRate: audioBuffer.sampleRate,
      measuredSeconds: Math.round(audioBuffer.duration * 100) / 100,
      waveformPoints,
      pitchContour,
      detectedNotes,
      // Not established, and deliberately still null. Basic Pitch now gives
      // real notes, which is the evidence a key estimate needs -- but naming
      // a key is its own capability (perception.key.estimate, ours to build
      // over the transcription) and nobody has built it. A key inferred here
      // in passing would be the literal "C Minor (Cm9)" all over again, just
      // with better manners.
      dominantKey: null,
      fundamentalRange: {
        lowNote: lowest.note,
        highNote: highest.note,
        lowFreq: lowest.frequency,
        highFreq: highest.frequency,
      },
      basis: `${mode} pass, ${audioBuffer.duration.toFixed(1)}s. ${read.basis}`,
    };
  }


  // Audition an Audio Blob or AudioAsset URL
  public playAudioBlob(blobOrUrl: Blob | string): void {
    if (this.activeAudioElement) {
      this.activeAudioElement.pause();
      this.activeAudioElement = null;
    }

    const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const audio = new Audio(url);
    this.activeAudioElement = audio;
    audio.play().catch((err) => console.warn('Audio playback error:', err));
  }

  public stopAudioPlayback(): void {
    if (this.activeAudioElement) {
      this.activeAudioElement.pause();
      this.activeAudioElement = null;
    }
  }

  // Plays synthesized sequence of detected notes (for MIDI / Pattern preview)
  public playMidiSequence(
    notes: { frequency: number; startTime: number; duration: number }[]
  ): void {
    notes.forEach((n) => {
      setTimeout(() => {
        this.playNote(n.frequency, 'triangle', n.duration);
      }, n.startTime * 1000);
    });
  }

  public stopMicMonitoring() {
    this.isMicRecording = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
  }

  // Synthesizes a valid 16-bit / 24-bit PCM WAV audio Blob with real RIFF headers
  public generatePcmWav(
    trackType: string,
    durationSeconds: number = 4,
    bpm: number = 110,
    sampleRate: number = 48000
  ): Blob {
    const numSamples = Math.floor(sampleRate * durationSeconds);
    const numChannels = 2; // stereo
    const bytesPerSample = 2; // 16-bit PCM for universal compatibility
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;

    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');

    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bytesPerSample * 8, true);

    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    let offset = 44;
    const beatPeriod = 60 / bpm;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sampleL = 0;
      let sampleR = 0;

      const beatPos = (t % beatPeriod) / beatPeriod;

      if (trackType.toLowerCase().includes('kick') || trackType.toLowerCase().includes('drum')) {
        const beatNum = Math.floor(t / beatPeriod) % 4;
        if (beatNum === 0 || beatNum === 2) {
          const env = Math.exp(-beatPos * 18);
          const f = 55 + 90 * Math.exp(-beatPos * 30);
          sampleL = Math.sin(2 * Math.PI * f * t) * env * 0.7;
          sampleR = sampleL;
        } else {
          const env = Math.exp(-beatPos * 14);
          const noise = (Math.random() * 2 - 1) * 0.4;
          const tone = Math.sin(2 * Math.PI * 180 * t) * 0.3;
          sampleL = (noise + tone) * env * 0.6;
          sampleR = sampleL;
        }
      } else if (trackType.toLowerCase().includes('bass')) {
        const baseFreq = 55;
        const env = 0.5 + 0.3 * Math.sin(2 * Math.PI * (bpm / 120) * t);
        sampleL = Math.sin(2 * Math.PI * baseFreq * t) * env * 0.5;
        sampleR = sampleL;
      } else if (
        trackType.toLowerCase().includes('rhodes') ||
        trackType.toLowerCase().includes('key') ||
        trackType.toLowerCase().includes('piano')
      ) {
        const chordT = (t % (beatPeriod * 4)) / (beatPeriod * 4);
        const env = Math.exp(-chordT * 1.5) * 0.35;
        const note1 = Math.sin(2 * Math.PI * 174.61 * t);
        const note2 = Math.sin(2 * Math.PI * 207.65 * t);
        const note3 = Math.sin(2 * Math.PI * 261.63 * t);
        const note4 = Math.sin(2 * Math.PI * 311.13 * t);
        sampleL = (note1 + note2 * 0.8 + note3 * 0.6 + note4 * 0.4) * env;
        sampleR = (note1 + note2 * 0.6 + note3 * 0.8 + note4 * 0.5) * env;
      } else if (trackType.toLowerCase().includes('vocal')) {
        const env = 0.3 + 0.2 * Math.sin(2 * Math.PI * (bpm / 60) * 0.25 * t);
        const f0 = 220;
        sampleL =
          (Math.sin(2 * Math.PI * f0 * t) +
            0.5 * Math.sin(2 * Math.PI * f0 * 2 * t) +
            0.2 * Math.sin(2 * Math.PI * f0 * 3 * t)) *
          env *
          0.4;
        sampleR = sampleL * 0.95;
      } else {
        const kick =
          Math.sin(2 * Math.PI * 60 * t) * Math.exp(-(t % beatPeriod) * 12) * 0.4;
        const chord =
          (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 261.6 * t)) * 0.15;
        sampleL = kick + chord;
        sampleR = kick + chord;
      }

      sampleL = Math.max(-1, Math.min(1, sampleL));
      sampleR = Math.max(-1, Math.min(1, sampleR));

      view.setInt16(offset, sampleL < 0 ? sampleL * 0x8000 : sampleL * 0x7fff, true);
      offset += 2;
      view.setInt16(offset, sampleR < 0 ? sampleR * 0x8000 : sampleR * 0x7fff, true);
      offset += 2;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }
}

export const audioEngine = new AudioEngineService();
