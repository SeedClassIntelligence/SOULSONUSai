/**
 * Renders what is actually on the timeline. Nothing else.
 *
 * A stem is the creator's recorded audio, placed where they placed it, at the
 * level they set. If a track holds no recorded audio, it has no stem — and the
 * honest export says so rather than synthesizing something that sounds like
 * the track's name.
 *
 * This runs in an OfflineAudioContext: the browser's own mixer, rendering
 * faster than real time. No provider is needed to sum a creator's own
 * recordings, and §7.4 does not name one — FFmpeg and libebur128 are for
 * encoding and for loudness measurement, which are different jobs and are not
 * done here.
 */

import { assetStore } from './assetStore';
import type { Track, AudioClip, ProjectMetadata } from '../types/soulsonus';

export interface PlacedClip {
  clip: AudioClip;
  buffer: AudioBuffer;
  startSeconds: number;
}

export interface TrackRender {
  track: Track;
  /** Null when the track holds no recorded audio. That is a real answer. */
  buffer: AudioBuffer | null;
  /** How many clips were placed, and why nothing was if nothing was. */
  note: string;
}

const secondsPerBar = (metadata: ProjectMetadata) => (60 / metadata.bpm) * 4;

/**
 * Decodes every asset-backed clip on a track and works out where it sits.
 *
 * A clip without an `assetId` points at no audio. It is skipped, and counted,
 * rather than replaced.
 */
async function gatherClips(
  track: Track,
  metadata: ProjectMetadata,
  ctx: BaseAudioContext
): Promise<{ placed: PlacedClip[]; skipped: number }> {
  const placed: PlacedClip[] = [];
  let skipped = 0;

  for (const clip of track.clips || []) {
    if (!clip.assetId) {
      skipped++;
      continue;
    }
    const asset = await assetStore.getAsset(clip.assetId);
    if (!asset?.blob) {
      skipped++;
      continue;
    }
    try {
      const buffer = await ctx.decodeAudioData(await asset.blob.arrayBuffer());
      placed.push({
        clip,
        buffer,
        startSeconds: Math.max(0, (clip.startBar - 1) * secondsPerBar(metadata)),
      });
    } catch {
      skipped++;
    }
  }

  return { placed, skipped };
}

/**
 * Renders one track's own audio.
 *
 * Mute and the track's volume are honoured because they are part of what the
 * creator decided. Solo is not: a stem is the track, and soloing is a
 * monitoring choice about the mix, not a property of the stem.
 */
export async function renderTrack(
  track: Track,
  metadata: ProjectMetadata,
  sampleRate: number
): Promise<TrackRender> {
  const probe = new OfflineAudioContext(1, 1, sampleRate);
  const { placed, skipped } = await gatherClips(track, metadata, probe);

  if (placed.length === 0) {
    return {
      track,
      buffer: null,
      note:
        skipped > 0
          ? `no stem — ${skipped} clip${skipped === 1 ? '' : 's'} on this track ` +
            `${skipped === 1 ? 'points' : 'point'} at no stored audio`
          : 'no stem — nothing has been recorded onto this track',
    };
  }

  const endSeconds = Math.max(
    ...placed.map((p) => p.startSeconds + p.buffer.duration)
  );
  const frames = Math.max(1, Math.ceil(endSeconds * sampleRate));
  const ctx = new OfflineAudioContext(2, frames, sampleRate);

  const trackGain = ctx.createGain();
  trackGain.gain.value = track.muted ? 0 : Math.max(0, Math.min(1, track.volume ?? 1));

  const panner = ctx.createStereoPanner();
  panner.pan.value = Math.max(-1, Math.min(1, track.pan ?? 0));

  trackGain.connect(panner);
  panner.connect(ctx.destination);

  for (const p of placed) {
    const source = ctx.createBufferSource();
    source.buffer = p.buffer;
    source.connect(trackGain);
    source.start(p.startSeconds);
  }

  const buffer = await ctx.startRendering();
  return {
    track,
    buffer,
    note:
      `${placed.length} clip${placed.length === 1 ? '' : 's'} rendered` +
      (skipped > 0 ? `, ${skipped} skipped for pointing at no stored audio` : ''),
  };
}

/**
 * Sums the rendered tracks into one stereo print.
 *
 * This is a sum of the creator's own audio at the levels they set. It is not
 * mastered: there is no limiter, no loudness target and no chain, and it must
 * never be described as though there were. §7.4 names libebur128 for the
 * measurement and FFmpeg for the encode, and neither is wired.
 */
export async function renderMaster(
  renders: TrackRender[],
  sampleRate: number
): Promise<AudioBuffer | null> {
  const withAudio = renders.filter((r): r is TrackRender & { buffer: AudioBuffer } => !!r.buffer);
  if (withAudio.length === 0) return null;

  const frames = Math.max(...withAudio.map((r) => r.buffer.length));
  const ctx = new OfflineAudioContext(2, frames, sampleRate);

  for (const r of withAudio) {
    const source = ctx.createBufferSource();
    source.buffer = r.buffer;
    source.connect(ctx.destination);
    source.start(0);
  }

  return ctx.startRendering();
}
