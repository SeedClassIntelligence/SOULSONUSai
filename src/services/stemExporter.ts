import JSZip from 'jszip';
import { assetStore, AudioAsset } from './assetStore';
import { encodeWav, type BitDepth } from './wav';
import { renderTrack, renderMaster, type TrackRender } from './timelineRender';
import { BASIC_PITCH_PROVIDER } from './providers/basicPitchProvider';
import { Track, ProjectMetadata } from '../types/soulsonus';

/**
 * Generates a valid Standard MIDI File (SMF Type 0) byte array.
 */
export function generateStandardMidiFile(
  notes: { noteNumber: number; startBarFraction: number; durationBarFraction: number; velocity?: number }[],
  bpm: number = 92
): Uint8Array {
  const ticksPerQuarterNote = 480;
  const ticksPerBar = ticksPerQuarterNote * 4; // assuming 4/4

  // Convert notes into MIDI events with tick timestamps
  interface MidiEvent {
    tick: number;
    type: 'noteOn' | 'noteOff';
    note: number;
    velocity: number;
  }

  const events: MidiEvent[] = [];
  notes.forEach((n) => {
    const startTick = Math.round(n.startBarFraction * ticksPerBar);
    const durationTick = Math.max(60, Math.round(n.durationBarFraction * ticksPerBar));
    const endTick = startTick + durationTick;
    const velocity = Math.min(127, Math.max(1, n.velocity || 96));

    events.push({ tick: startTick, type: 'noteOn', note: n.noteNumber, velocity });
    events.push({ tick: endTick, type: 'noteOff', note: n.noteNumber, velocity: 0 });
  });

  // Sort events chronologically (noteOff before noteOn if same tick)
  events.sort((a, b) => {
    if (a.tick !== b.tick) return a.tick - b.tick;
    return a.type === 'noteOff' ? -1 : 1;
  });

  // Build Track Data
  const trackBytes: number[] = [];

  // Helper: write variable length quantity
  function writeVarLen(val: number) {
    let buffer = val & 0x7f;
    while ((val >>= 7) > 0) {
      buffer <<= 8;
      buffer |= 0x80;
      buffer += val & 0x7f;
    }
    while (true) {
      trackBytes.push(buffer & 0xff);
      if (buffer & 0x80) buffer >>= 8;
      else break;
    }
  }

  // 1. Set Tempo Meta Event
  // microseconds per quarter note = 60,000,000 / bpm
  const mpqn = Math.round(60000000 / bpm);
  trackBytes.push(0x00, 0xff, 0x51, 0x03, (mpqn >> 16) & 0xff, (mpqn >> 8) & 0xff, mpqn & 0xff);

  // 2. Write Note Events
  let lastTick = 0;
  events.forEach((ev) => {
    const deltaTick = Math.max(0, ev.tick - lastTick);
    writeVarLen(deltaTick);
    lastTick = ev.tick;

    if (ev.type === 'noteOn') {
      trackBytes.push(0x90, ev.note & 0x7f, ev.velocity & 0x7f);
    } else {
      trackBytes.push(0x80, ev.note & 0x7f, 0x00);
    }
  });

  // 3. End of Track Meta Event
  writeVarLen(0);
  trackBytes.push(0xff, 0x2f, 0x00);

  // Build Header Chunk: 'MThd' (4 bytes), length 6 (4 bytes), format 0 (2 bytes), 1 track (2 bytes), division (2 bytes)
  const header = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // chunk size 6
    0x00, 0x00,             // format 0 (single track)
    0x00, 0x01,             // 1 track
    (ticksPerQuarterNote >> 8) & 0xff, ticksPerQuarterNote & 0xff
  ];

  // Track Chunk: 'MTrk' (4 bytes), track length (4 bytes), track data
  const trackLen = trackBytes.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackLen >> 24) & 0xff,
    (trackLen >> 16) & 0xff,
    (trackLen >> 8) & 0xff,
    trackLen & 0xff
  ];

  const fullMidi = new Uint8Array([...header, ...trackHeader, ...trackBytes]);
  return fullMidi;
}

export interface StemExportOptions {
  includeWavStems: boolean;
  includeMidi: boolean;
  includeMasterStereo: boolean;
  includeSmirManifest: boolean;
  includeDawGuide: boolean;
  bitDepth: '16' | '24';
  sampleRate: '44.1k' | '48k';
}

export interface ExportProgress {
  stage: string;
  percent: number;
}

export async function exportStudioStemsZip(
  metadata: ProjectMetadata,
  tracks: Track[],
  options: StemExportOptions,
  onProgress?: (progress: ExportProgress) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `${metadata.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Stems_${metadata.bpm}BPM`;
  const stemsFolder = zip.folder(folderName);
  if (!stemsFolder) throw new Error('Failed to initialize zip folder');

  const totalSteps = tracks.length + 4;
  let currentStep = 0;

  const updateProgress = (stage: string) => {
    currentStep++;
    const percent = Math.min(100, Math.round((currentStep / totalSteps) * 100));
    if (onProgress) onProgress({ stage, percent });
  };

  updateProgress('Reading what is on the timeline...');

  const sampleRate = options.sampleRate === '48k' ? 48000 : 44100;
  const bitDepth: BitDepth = options.bitDepth === '24' ? 24 : 16;

  // Render every track from its own recorded audio, once, and reuse the
  // result for both the stems and the master. A track with nothing on it
  // renders to null, which is a real answer and is reported as one.
  const renders: TrackRender[] = [];
  for (let i = 0; i < tracks.length; i++) {
    updateProgress(`Rendering ${i + 1}/${tracks.length}: ${tracks[i].name}`);
    renders.push(await renderTrack(tracks[i], metadata, sampleRate));
  }

  const rendered = renders.filter((r) => r.buffer);
  const empty = renders.filter((r) => !r.buffer);

  // 1. Stems — only for tracks that hold audio.
  //
  // This used to call generatePcmWav for every track without one, which
  // synthesized audio by matching the track's NAME -- a kick pattern for
  // anything called kick, a 55 Hz line for bass, a chord for keys -- and filed
  // it as 01_KICK, 02_KEYS, 03_LEAD_VOCAL. A creator opened the archive and
  // found stems containing no note they had played. A track with no audio now
  // produces no file, and the manifest says which tracks those were.
  if (options.includeWavStems) {
    for (let i = 0; i < renders.length; i++) {
      const r = renders[i];
      if (!r.buffer) continue;
      const safeName = r.track.name.toUpperCase().replace(/[^a-zA-Z0-9]/g, '_');
      const stemFileName =
        `${String(i + 1).padStart(2, '0')}_${safeName}_${options.sampleRate}_${options.bitDepth}bit.wav`;
      stemsFolder.file(stemFileName, encodeWav(r.buffer, bitDepth));
    }
  }

  // 2. Master — a sum of those same renders.
  //
  // It was synthesized unconditionally, with no asset-backed branch at all,
  // and announced as a render "with -14 LUFS mastering chain". There is no
  // mastering chain. This is a sum of the creator's audio at the levels they
  // set, and it is named for exactly that.
  if (options.includeMasterStereo) {
    updateProgress('Summing rendered tracks to a stereo print...');
    const master = await renderMaster(renders, sampleRate);
    if (master) {
      stemsFolder.file(
        `00_FULL_MIX_SUM_${options.sampleRate}_${options.bitDepth}bit.wav`,
        encodeWav(master, bitDepth)
      );
    }
  }

  // 3. MIDI — from notes that were actually read.
  //
  // Two files used to be written here from hardcoded arrays: nineteen notes of
  // a Cm9-Fm9-G7#9-Abmaj7 progression as RHODES_HARMONIC_PROGRESSION.mid, and
  // seven more as LEAD_VOCAL_MELODY_CONTOUR.mid, the second commented
  // "extracted". Nothing extracted anything. These come from the notes Basic
  // Pitch read off the creator's own takes, and a take with no notes produces
  // no file.
  if (options.includeMidi) {
    updateProgress('Writing MIDI from the notes read off your takes...');
    const secondsPerBarValue = (60 / metadata.bpm) * 4;

    for (const r of renders) {
      if (!r.buffer) continue;
      for (const clip of r.track.clips || []) {
        if (!clip.assetId) continue;
        const asset = await assetStore.getAsset(clip.assetId);
        const notes = asset?.musicalAnalysis?.detectedNotes || [];
        if (notes.length === 0) continue;

        const midiBytes = generateStandardMidiFile(
          notes.map((n) => ({
            noteNumber: n.midi,
            startBarFraction: n.startTime / secondsPerBarValue,
            durationBarFraction: Math.max(0.01, n.duration / secondsPerBarValue),
            velocity: 96,
          })),
          metadata.bpm
        );
        const safe = `${r.track.name}_${clip.name}`.toUpperCase().replace(/[^A-Z0-9]+/g, '_');
        stemsFolder.file(`${safe}.mid`, midiBytes);
      }
    }
  }

  // 4. Build SMIR Provenance Manifest & DAW Import Guide
  if (options.includeSmirManifest) {
    const assetsList = await assetStore.getAllAssets();
    const manifest = {
      project: metadata.name,
      bpm: metadata.bpm,
      timeSignature: metadata.timeSignature,
      key: metadata.key,
      revision: metadata.revision,
      engine: 'SoulSonus Studio v2.4 (Open-Source Architecture)',
      exportedAt: new Date().toISOString(),
      // No fallback. This used to default to
      // 9e107d9d372bb6826bd81d3542a419d6dae03429f45347b74f3df9b422d3b208 --
      // which is the SHA-256 of "The quick brown fox jumps over the lazy dog",
      // a textbook test vector, shipped in a provenance manifest as though it
      // were the hash of the creator's work.
      provenanceHashSha256: assetsList[0]?.sha256 ?? null,
      seedSignatures: assetsList.map((a: AudioAsset) => ({
        id: a.id,
        name: a.name,
        type: a.originType,
        sha256: a.sha256,
        seedSignature: a.provenanceSeedSignature,
      })),
      tracks: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        volume: t.volume,
        pan: t.pan,
        clipsCount: t.clips.length,
      })),
      // Only what actually ran. This listed five providers -- ACE-Step,
      // Demucs, WhisperX and libebur128 among them -- none of which are wired
      // in this build. A provenance manifest that names engines which never
      // touched the audio is the most dangerous fabrication in the archive,
      // because it is the document a rights conversation would rely on.
      openSourceProvidersUsed: [BASIC_PITCH_PROVIDER].map((p) => ({
        capability: p.capability,
        provider: p.id,
        version: p.version,
        codeLicence: p.codeLicence,
        weightsLicence: p.weightsLicence,
        runsIn: p.runsIn,
      })),
      // What is in this archive, and what is not.
      rendered: rendered.map((r) => ({ track: r.track.name, detail: r.note })),
      notRendered: empty.map((r) => ({ track: r.track.name, reason: r.note })),
      masterStereo: options.includeMasterStereo
        ? 'A sum of the rendered tracks at their set levels. Not mastered: no limiter, no loudness target, no chain.'
        : 'not requested',
    };
    stemsFolder.file('SMIR_PROVENANCE_MANIFEST.json', JSON.stringify(manifest, null, 2));
  }

  if (options.includeDawGuide) {
    const guide = `================================================================================
SOULSONUS STUDIO — MULTI-STEM DAW IMPORT GUIDE
================================================================================
Project:        ${metadata.name}
Tempo:          ${metadata.bpm} BPM
Time Signature: ${metadata.timeSignature}
Musical Key:    ${metadata.key}
Format:         24-bit PCM WAV / 48 kHz & Standard MIDI File Type 0
Generated By:   SoulSonus Studio (Governance & Provenance Layer)

IMPORT INSTRUCTIONS:
--------------------------------------------------------------------------------
1. ABLETON LIVE:
   - Create a new project and set project BPM to ${metadata.bpm}.
   - Drag all WAV files together into the Arrangement View (drop on Track 1).
   - Ableton will prompt: "Hold Shift to place on separate tracks".
   - Turn off "Auto-Warp Long Samples" in Preferences to retain authentic human pocket.

2. LOGIC PRO:
   - File -> Import -> Audio File (Select all stem WAVs).
   - Choose "Place on existing or new tracks". Set tempo to ${metadata.bpm} BPM.
   - Drag RHODES_HARMONIC_PROGRESSION.mid onto an Instrument track with vintage Rhodes plugin.

3. PRO TOOLS:
   - File -> Import -> Audio (Shift+Cmd+I / Shift+Ctrl+I).
   - Select "New Track", location "Session Start".
   - Ensure Session Sample Rate is set to 48 kHz.

4. FL STUDIO:
   - Set project tempo to ${metadata.bpm} BPM.
   - Drag all stems into the Playlist view lined up at Bar 1, Beat 1.

STEM MAPPING & ROLES:
--------------------------------------------------------------------------------
- 01_DRUMS:         Jay (Session Persona) - Dynamic acoustic kit & creator pocket
- 02_KEYS_RHODES:   Elena (Session Persona) - Vintage Mark I Rhodes with tape saturation
- 03_LEAD_VOCAL:    Devon Cole (Creator) - Center dry booth vocal capture
- 04_BASS:          Marcus (Session Persona) - Deep 70s Moog / P-Bass low-end foundation
- 05_BGV_HARMONIES: Gospel Studio 3-part vocal arrangement (Soprano/Alto/Tenor)
- 00_FULL_MASTER:   Pre-master stereo print (-14 LUFS integrated, -1.0 dB True Peak)
================================================================================`;
    stemsFolder.file('DAW_IMPORT_GUIDE.txt', guide);
  }

  updateProgress('Compressing ZIP archive...');
  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  return zipBlob;
}
