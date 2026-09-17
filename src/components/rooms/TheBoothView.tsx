import React, { useState, useEffect } from 'react';
import {
  Mic,
  Radio,
  Sliders,
  Sparkles,
  Volume2,
  Layers,
  Circle,
  Play,
  RotateCcw,
  Check,
  Music,
} from 'lucide-react';
import { InputMode, Track } from '../../types/soulsonus';
import { audioEngine } from '../../services/audioEngine';

interface TheBoothViewProps {
  armedTrack: Track | undefined;
  isRecording: boolean;
  onToggleRecord: () => void;
  onNewRecordingTake: (takeName: string, mode: InputMode) => void;
}

export const TheBoothView: React.FC<TheBoothViewProps> = ({
  armedTrack,
  isRecording,
  onToggleRecord,
  onNewRecordingTake,
}) => {
  const [selectedMode, setSelectedMode] = useState<InputMode>('RECORD AUDIO');
  const [micLevel, setMicLevel] = useState<number>(0.15);
  const [waveformBars, setWaveformBars] = useState<number[]>([
    0.2, 0.4, 0.6, 0.8, 0.5, 0.3, 0.7, 0.9, 0.6, 0.4, 0.2, 0.5, 0.8, 0.3, 0.6, 0.4
  ]);
  const [micPreset, setMicPreset] = useState<string>('SoulVocal Warm (Neve 1073)');
  const [isDirectMonitoring, setIsDirectMonitoring] = useState<boolean>(true);

  const inputModes: InputMode[] = [
    'RECORD AUDIO',
    'BEATBOX',
    'CLAP / TAP',
    'HUM',
    'MIMIC',
    'SING',
    'SPEAK',
    'MIDI',
    'IMPORT',
    'MELODY',
  ];

  // Initialize live audio level / waveform visualization
  useEffect(() => {
    let isActive = true;
    audioEngine.startMicMonitoring((level, wave) => {
      if (!isActive) return;
      setMicLevel(level);
      if (wave && wave.length > 0) {
        setWaveformBars(wave);
      }
    });

    return () => {
      isActive = false;
      audioEngine.stopMicMonitoring();
    };
  }, []);

  // Map input mode to the 3-Box Architecture Model (Source -> Interpretation -> Realization)
  const getArchitectureModel = (mode: InputMode) => {
    switch (mode) {
      case 'BEATBOX':
        return {
          source: 'Creator Performance • Preserved',
          interpretation: 'Transient & Syllable Groove Analysis',
          realization: 'Session Kit Realization (Jay Drums)',
        };
      case 'HUM':
      case 'MELODY':
        return {
          source: 'Creator Performance • Preserved',
          interpretation: 'Continuous Pitch Contour (SMIR Vector)',
          realization: 'Monophonic / Polyphonic Synth Track',
        };
      case 'CLAP / TAP':
        return {
          source: 'Creator Performance • Preserved',
          interpretation: 'Micro-Timing & Swing Grid (+12ms)',
          realization: 'Project Groove Master & Metronome',
        };
      case 'SPEAK':
        return {
          source: 'Creator Voice • Preserved',
          interpretation: 'Phonetic Meter & Intonation Curve',
          realization: 'Spoken Word / Lyric Draft Track',
        };
      case 'SING':
        return {
          source: 'Creator Vocal Performance • Preserved',
          interpretation: 'Vocal Melody + Formant Extraction',
          realization: 'Lead Vocal Audio + Harmony Stems',
        };
      case 'MIDI':
        return {
          source: 'Hardware Key Controller • Preserved',
          interpretation: 'Velocity & Note Polyphony (C Minor)',
          realization: 'Elena Keys Rhodes Realization',
        };
      default:
        return {
          source: 'Creator Performance • Preserved',
          interpretation: 'Audio Performance (48kHz / 24-bit)',
          realization: 'Original Recording (Track 03)',
        };
    }
  };

  const currentArch = getArchitectureModel(selectedMode);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none relative overflow-hidden">
      {/* Booth Header & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
            SOULSONUS STUDIO • SESSION READY
          </span>
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          Armed:{' '}
          <span className="text-amber-400 font-bold">
            {armedTrack ? armedTrack.name : 'Lead Vocal Track'}
          </span>
        </div>
      </div>

      {/* Main Microphone Center Area */}
      <div className="flex flex-col items-center justify-center py-4 space-y-3">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-widest text-center">
          THE BOOTH · EXPRESS THE IDEA NATURALLY
        </div>

        {/* Circular Mic Pod with Audio Ripple */}
        <div className="relative flex items-center justify-center">
          {/* Animated concentric rings */}
          <div
            style={{
              transform: `scale(${1 + micLevel * 0.4})`,
              opacity: Math.max(0.15, micLevel),
            }}
            className="absolute w-28 h-28 rounded-full border-2 border-amber-500/40 transition-transform duration-75 pointer-events-none"
          />
          <div
            style={{
              transform: `scale(${1 + micLevel * 0.7})`,
              opacity: Math.max(0.08, micLevel * 0.6),
            }}
            className="absolute w-36 h-36 rounded-full border border-amber-500/20 transition-transform duration-75 pointer-events-none"
          />

          <button
            onClick={onToggleRecord}
            className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-xl relative z-10 ${
              isRecording
                ? 'bg-rose-600/90 text-white ring-4 ring-rose-500/40 animate-pulse'
                : 'bg-slate-900 border-2 border-slate-700 hover:border-amber-500/80 text-amber-500 hover:text-amber-400'
            }`}
            title="Click to Record / Stop in The Booth"
          >
            <Mic className="w-8 h-8" />
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider mt-0.5">
              {isRecording ? 'RECORDING' : 'RECORD'}
            </span>
          </button>
        </div>

        {/* Live Audio Meter Waveform Bar */}
        <div className="flex items-center space-x-1 h-6">
          {waveformBars.map((val, idx) => (
            <div
              key={idx}
              style={{ height: `${Math.max(4, val * 22)}px` }}
              className={`w-1.5 rounded-full transition-all duration-75 ${
                isRecording ? 'bg-rose-400' : 'bg-amber-500/80'
              }`}
            />
          ))}
        </div>

        <div className="text-center space-y-0.5">
          <div className="text-sm font-bold text-slate-100 font-mono">
            Studio Vocal · Input 1
          </div>
          <p className="text-xs text-slate-400">
            Your performance records directly into the selected DAW track.
          </p>
        </div>
      </div>

      {/* Input Mode Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
        {inputModes.map((mode) => {
          const isSelected = selectedMode === mode;
          return (
            <button
              key={mode}
              onClick={() => setSelectedMode(mode)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {mode}
            </button>
          );
        })}
      </div>

      {/* Routing status indicator */}
      <div className="text-center font-mono text-[11px] text-emerald-400">
        DIRECT TO DAW · Audio Capture →{' '}
        <span className="font-semibold underline">
          {armedTrack ? armedTrack.name : 'Lead Vocal Track'}
        </span>
      </div>

      {/* 3-Box Architectural Model: Source → Interpretation → Realization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
            SOURCE
          </span>
          <div className="text-xs font-mono font-bold text-slate-200">
            {currentArch.source}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
            INTERPRETATION
          </span>
          <div className="text-xs font-mono font-bold text-cyan-400">
            {currentArch.interpretation}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-1">
          <span className="text-[9px] font-mono uppercase text-slate-400 font-bold block">
            REALIZATION
          </span>
          <div className="text-xs font-mono font-bold text-amber-400">
            {currentArch.realization}
          </div>
        </div>
      </div>
    </div>
  );
};
