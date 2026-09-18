#!/usr/bin/env python3
"""Writes the hum that scripts/verify-hum-slice.cjs feeds to the microphone.

C4 at 261.63 Hz with four harmonics, so the estimator meets something closer
to a voice than a sine. Four seconds; Chromium loops it.
"""
import struct, math, os, pathlib

RATE, SECONDS, F0 = 44100, 4.0, 261.63
out = pathlib.Path(os.environ.get('SOULSONUS_HUM_WAV', '/tmp/soulsonus-hum-c4.wav'))

frames = bytearray()
for i in range(int(RATE * SECONDS)):
    t = i / RATE
    env = min(1.0, t * 8) * min(1.0, (SECONDS - t) * 4)
    v = (math.sin(2 * math.pi * F0 * t) * 0.5
         + math.sin(2 * math.pi * F0 * 2 * t) * 0.28
         + math.sin(2 * math.pi * F0 * 3 * t) * 0.15
         + math.sin(2 * math.pi * F0 * 4 * t) * 0.08) * 0.7 * env
    frames += struct.pack('<h', int(max(-1, min(1, v)) * 32767))

out.write_bytes(
    b'RIFF' + struct.pack('<I', 36 + len(frames)) + b'WAVEfmt '
    + struct.pack('<IHHIIHH', 16, 1, 1, RATE, RATE * 2, 2, 16)
    + b'data' + struct.pack('<I', len(frames)) + bytes(frames))
print(f'wrote {out} — C4 {F0} Hz, {SECONDS}s, four harmonics')
