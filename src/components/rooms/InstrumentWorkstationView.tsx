import React, { useState } from 'react';
import {
  Guitar,
  Music,
  Sliders,
  Sparkles,
  Volume2,
  Check,
  Radio,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface InstrumentWorkstationViewProps {
  onRecordInstrumentToTrack: (title: string) => void;
}

export const InstrumentWorkstationView: React.FC<InstrumentWorkstationViewProps> = ({
  onRecordInstrumentToTrack,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'GUITAR' | 'SYNTH' | 'STRINGS' | 'HORNS'>('GUITAR');
  const [selectedPreset, setSelectedPreset] = useState<string>('1964 Stratocaster Clean Funk');

  const instrumentsData = {
    GUITAR: [
      '1964 Stratocaster Clean Funk',
      'Gibson ES-335 Warm Neo-Soul Jazz',
      'Martin D-28 Acoustic Fingerpicked',
      'Mutron Envelope Filter Lead Guitar',
    ],
    SYNTH: [
      'Moog Model D Fat Sub Bass',
      'Sequential Circuits Prophet-5 Poly Brass',
      'Juno-106 Lush Chorus Pad',
      'Oberheim OB-Xa Warm Saw Lead',
    ],
    STRINGS: [
      'Philadelphia Soul String Section (16-Piece)',
      'Solo Cello Expressive Vibrato',
      'Vintage Mellotron Tape Violins',
      'Cinematic Chamber Quartet',
    ],
    HORNS: [
      'The Soul Horns (Trumpet, Tenor Sax, Trombone)',
      'Miles Davis Harmon Muted Trumpet',
      'Memphis Stax Brass Stabs',
      'Baritone Sax Dirty Low End',
    ],
  };

  const handleAudition = () => {
    // Play warm melodic motif
    audioEngine.playNote(220.0, 'sawtooth', 0.5);
    setTimeout(() => audioEngine.playNote(261.63, 'sawtooth', 0.5), 180);
    setTimeout(() => audioEngine.playNote(293.66, 'sawtooth', 0.5), 360);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Guitar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              INSTRUMENT WORKSTATION
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Guitars, analog synthesizers, soul strings, and horn sections. Pure separation of creator performance vs instrument modeling.
            </p>
          </div>
        </div>

        <button
          onClick={handleAudition}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audition Preset</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2">
        {(['GUITAR', 'SYNTH', 'STRINGS', 'HORNS'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedPreset(instrumentsData[cat][0]);
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {instrumentsData[selectedCategory].map((preset) => {
          const isSelected = selectedPreset === preset;
          return (
            <div
              key={preset}
              onClick={() => setSelectedPreset(preset)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500 shadow-sm ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-slate-200">{preset}</span>
                {isSelected && (
                  <span className="text-[9px] font-mono bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30">
                    SELECTED
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                High-fidelity physical acoustic modeling with real velocity curve dynamics.
              </p>
            </div>
          );
        })}
      </div>

      {/* Routing & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="text-xs font-mono text-slate-400">
          Selected: <strong className="text-slate-200">{selectedPreset}</strong>
        </div>
        <button
          onClick={() => onRecordInstrumentToTrack(`${selectedPreset} Performance`)}
          className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Record Instrument Track</span>
        </button>
      </div>
    </div>
  );
};
