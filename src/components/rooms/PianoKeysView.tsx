import React, { useState } from 'react';
import {
  Piano,
  Music,
  Sliders,
  Sparkles,
  Volume2,
  Check,
  Circle,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface PianoKeysViewProps {
  onRecordKeysToTrack: (clipTitle: string) => void;
}

export const PianoKeysView: React.FC<PianoKeysViewProps> = ({
  onRecordKeysToTrack,
}) => {
  const [selectedInstrument, setSelectedInstrument] = useState<string>('Fender Rhodes MK-I (Warm Velvet)');
  const [isScaleLockOn, setIsScaleLockOn] = useState<boolean>(true);
  const [currentChordDisplay, setCurrentChordDisplay] = useState<string>('Cm9 (C Minor 9th)');
  const [octaveShift, setOctaveShift] = useState<number>(0);

  // Key frequencies for 2 octaves (C3 to C5)
  const keysData = [
    { note: 'C3', freq: 130.81, isBlack: false, inCMin: true },
    { note: 'C#3', freq: 138.59, isBlack: true, inCMin: false },
    { note: 'D3', freq: 146.83, isBlack: false, inCMin: true },
    { note: 'D#3 (Eb)', freq: 155.56, isBlack: true, inCMin: true },
    { note: 'E3', freq: 164.81, isBlack: false, inCMin: false },
    { note: 'F3', freq: 174.61, isBlack: false, inCMin: true },
    { note: 'F#3', freq: 185.00, isBlack: true, inCMin: false },
    { note: 'G3', freq: 196.00, isBlack: false, inCMin: true },
    { note: 'G#3 (Ab)', freq: 207.65, isBlack: true, inCMin: true },
    { note: 'A3', freq: 220.00, isBlack: false, inCMin: false },
    { note: 'A#3 (Bb)', freq: 233.08, isBlack: true, inCMin: true },
    { note: 'B3', freq: 246.94, isBlack: false, inCMin: false },
    { note: 'C4', freq: 261.63, isBlack: false, inCMin: true },
    { note: 'C#4', freq: 277.18, isBlack: true, inCMin: false },
    { note: 'D4', freq: 293.66, isBlack: false, inCMin: true },
    { note: 'D#4 (Eb)', freq: 311.13, isBlack: true, inCMin: true },
    { note: 'E4', freq: 329.63, isBlack: false, inCMin: false },
    { note: 'F4', freq: 349.23, isBlack: false, inCMin: true },
    { note: 'F#4', freq: 369.99, isBlack: true, inCMin: false },
    { note: 'G4', freq: 392.00, isBlack: false, inCMin: true },
    { note: 'G#4 (Ab)', freq: 415.30, isBlack: true, inCMin: true },
    { note: 'A4', freq: 440.00, isBlack: false, inCMin: false },
    { note: 'A#4 (Bb)', freq: 466.16, isBlack: true, inCMin: true },
    { note: 'B4', freq: 493.88, isBlack: false, inCMin: false },
    { note: 'C5', freq: 523.25, isBlack: false, inCMin: true },
  ];

  // Neo-Soul Gospel Chord Voicings
  const chordPresets = [
    { name: 'Cm9', label: 'C Minor 9th', freqs: [130.81, 155.56, 196.00, 233.08, 293.66] },
    { name: 'Fm9', label: 'F Minor 9th', freqs: [174.61, 207.65, 261.63, 311.13, 392.00] },
    { name: 'Gm7', label: 'G Minor 7th', freqs: [196.00, 233.08, 293.66, 349.23] },
    { name: 'Abmaj7', label: 'Ab Major 7th', freqs: [207.65, 261.63, 311.13, 392.00] },
    { name: 'Bb13', label: 'Bb Dominant 13', freqs: [233.08, 293.66, 349.23, 415.30, 523.25] },
  ];

  const handlePlayKey = (freq: number, note: string) => {
    const shiftMultiplier = Math.pow(2, octaveShift);
    audioEngine.playNote(freq * shiftMultiplier, 'triangle', 0.7);
    setCurrentChordDisplay(`Single Note: ${note}`);
  };

  const handlePlayChord = (chord: typeof chordPresets[0]) => {
    chord.freqs.forEach((f) => audioEngine.playNote(f, 'triangle', 1.0));
    setCurrentChordDisplay(chord.label);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Piano className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              PIANO / KEYS WORKSTATION
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Virtual Rhodes MK-I & Grand Piano. Neo-soul voicing generator with C Minor scale lock.
            </p>
          </div>
        </div>

        {/* Instrument selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">ENGINE:</span>
          <select
            value={selectedInstrument}
            onChange={(e) => setSelectedInstrument(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono outline-none"
          >
            <option>Fender Rhodes MK-I (Warm Velvet)</option>
            <option>Yamaha C7 Concert Grand</option>
            <option>Wurlitzer 200A Tremolo</option>
            <option>Prophet-5 Neo-Soul Warm Pad</option>
          </select>
        </div>
      </div>

      {/* Chord & Voicings Bar */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase">
              ACTIVE HARMONY:
            </span>
            <span className="text-sm font-bold font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
              {currentChordDisplay}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <button
              onClick={() => setIsScaleLockOn(!isScaleLockOn)}
              className={`px-2.5 py-1 rounded border transition-colors ${
                isScaleLockOn
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Scale Assist: C Natural Minor {isScaleLockOn ? 'LOCKED' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Quick Chord Presets */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono text-slate-400">
            LUSH GOSPEL VOICINGS (Click to play full chord):
          </div>
          <div className="flex flex-wrap gap-2">
            {chordPresets.map((c) => (
              <button
                key={c.name}
                onClick={() => handlePlayChord(c)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs font-bold hover:border-emerald-500 transition-all cursor-pointer"
              >
                {c.name} <span className="text-[10px] font-normal text-slate-400">({c.label})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual Piano Keyboard */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
          <span>2-OCTAVE VIRTUAL KEYBOARD (C3 - C5)</span>
          <div className="flex items-center space-x-2">
            <span>OCTAVE:</span>
            <button
              onClick={() => setOctaveShift(Math.max(-2, octaveShift - 1))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              -
            </button>
            <span className="font-bold text-slate-200">{octaveShift > 0 ? `+${octaveShift}` : octaveShift}</span>
            <button
              onClick={() => setOctaveShift(Math.min(2, octaveShift + 1))}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              +
            </button>
          </div>
        </div>

        {/* Keyboard Keys Layout */}
        <div className="relative h-44 bg-slate-950 rounded-lg border border-slate-800 flex overflow-hidden shadow-inner p-1">
          {/* White Keys */}
          {keysData.filter((k) => !k.isBlack).map((k) => (
            <button
              key={k.note}
              onClick={() => handlePlayKey(k.freq, k.note)}
              className={`flex-1 h-full bg-slate-100 hover:bg-slate-200 active:bg-amber-200 text-slate-950 rounded-b border border-slate-300 flex flex-col justify-end p-1.5 transition-colors cursor-pointer ${
                isScaleLockOn && k.inCMin ? 'border-b-4 border-b-emerald-500' : ''
              }`}
            >
              <span className="text-[9px] font-mono font-bold text-slate-600 block text-center">
                {k.note}
              </span>
            </button>
          ))}

          {/* Black Keys (Overlay) */}
          <div className="absolute inset-x-0 top-1 h-28 pointer-events-none flex px-4">
            {keysData.map((k, idx) => {
              if (!k.isBlack) return null;
              return (
                <button
                  key={k.note}
                  onClick={() => handlePlayKey(k.freq, k.note)}
                  style={{
                    left: `${(idx / keysData.length) * 98}%`,
                    width: '3.6%',
                  }}
                  className={`absolute top-0 h-28 bg-slate-900 hover:bg-slate-800 active:bg-amber-600 border border-slate-700 rounded-b shadow-lg pointer-events-auto cursor-pointer flex flex-col justify-end p-1 ${
                    isScaleLockOn && k.inCMin ? 'border-b-2 border-b-emerald-400' : ''
                  }`}
                >
                  <span className="text-[8px] font-mono font-bold text-slate-300 block text-center">
                    {k.note.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer / Send to DAW */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-xs font-mono text-slate-400">
          Target: Track 02 (Keys · MIDI Instrument)
        </div>
        <button
          onClick={() => onRecordKeysToTrack('Keys · Take 3 (Rhodes Gospel Voicing)')}
          className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Record Voicing to Track 02</span>
        </button>
      </div>
    </div>
  );
};
