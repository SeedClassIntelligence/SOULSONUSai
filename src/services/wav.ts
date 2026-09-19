/**
 * WAV encoding. A codec, and nothing else.
 *
 * There used to be a `generatePcmWav` in the audio engine that *invented* the
 * audio it encoded — a kick pattern for anything named kick, a 55 Hz line for
 * bass — and the stem export filed the result under the creator's track names.
 * This is the half of that which was ever legitimate: take samples that
 * already exist and write them as a RIFF file.
 *
 * It generates nothing. If there is no audio, there is nothing to call this
 * with, and the caller's job is to say so rather than to manufacture input.
 */

export type BitDepth = 16 | 24;

/** Writes a rendered buffer as a RIFF/PCM WAV at the requested depth. */
export function encodeWav(buffer: AudioBuffer, bitDepth: BitDepth = 16): Blob {
  const channels = buffer.numberOfChannels;
  const frames = buffer.length;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frames * blockAlign;

  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);

  const writeString = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channelData: Float32Array[] = [];
  for (let c = 0; c < channels; c++) channelData.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < frames; i++) {
    for (let c = 0; c < channels; c++) {
      const sample = Math.max(-1, Math.min(1, channelData[c][i]));
      if (bitDepth === 16) {
        view.setInt16(offset, Math.round(sample * 32767), true);
        offset += 2;
      } else {
        const value = Math.round(sample * 8388607);
        view.setUint8(offset, value & 0xff);
        view.setUint8(offset + 1, (value >> 8) & 0xff);
        view.setUint8(offset + 2, (value >> 16) & 0xff);
        offset += 3;
      }
    }
  }

  return new Blob([out], { type: 'audio/wav' });
}
