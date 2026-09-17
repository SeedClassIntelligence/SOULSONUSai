import React, { useState } from 'react';
import {
  Clock,
  Activity,
  Play,
  Pause,
  ArrowRight,
  Plus,
  Sliders,
  Sparkles,
  Layers,
  Volume2,
  Check,
  Disc,
  Music,
} from 'lucide-react';
import { BeatboxPadItem, RhythmicPatternItem, TrainingExercise } from '../../../types/creatorIntelligence';
import { audioEngine } from '../../../services/audioEngine';

interface RhythmProfileSubViewProps {
  onStartExercise: (exercise: TrainingExercise) => void;
  onAddPatternToSession: (pattern: RhythmicPatternItem) => void;
  onAddPadToSession: (pad: BeatboxPadItem) => void;
  rhythmUnderstandingPercent?: number;
}

const RHYTHM_EXERCISES: TrainingExercise[] = [
  {
    id: 'rex-1',
    title: 'Beatbox one bar',
    category: 'rhythm',
    mode: 'Beatbox',
    instruction: 'Lay down an isolated 4-beat kick/snare/hat loop with your mouth.',
    targetMetric: 'Transient Separation & Micro-timing',
  },
  {
    id: 'rex-2',
    title: 'Beatbox four bars',
    category: 'rhythm',
    mode: 'Beatbox',
    instruction: 'Sustain a groove for 4 bars with a turnaround fill on bar 4.',
    targetMetric: 'Tempo Drift & Phrase Pocket',
  },
  {
    id: 'rex-3',
    title: 'Tap your natural groove',
    category: 'rhythm',
    mode: 'Clap / Tap',
    instruction: 'Tap a finger or pen on your desk in your intuitive pocket.',
    targetMetric: 'Human Swing Ratio & Late Pocket',
  },
  {
    id: 'rex-4',
    title: 'Clap quarter notes',
    category: 'rhythm',
    mode: 'Clap / Tap',
    instruction: 'Clap along with an imaginary metronome for 8 steady beats.',
    targetMetric: 'Quantization Variance & Clock Bias',
  },
  {
    id: 'rex-5',
    title: 'Perform a swung rhythm',
    category: 'rhythm',
    mode: 'Beatbox',
    instruction: 'Beatbox or tap a shuffle / Dilla-style swung groove.',
    targetMetric: '16th Swing Percentage (62%)',
  },
  {
    id: 'rex-6',
    title: 'Perform straight rhythm',
    category: 'rhythm',
    mode: 'Beatbox',
    instruction: 'Beatbox a rigid electronic-style 16th-note hat pattern.',
    targetMetric: 'Straight Grid Adherence',
  },
  {
    id: 'rex-7',
    title: 'Create a drum fill',
    category: 'rhythm',
    mode: 'Beatbox',
    instruction: 'Vocalize a fast snare roll and cymbal crash transition.',
    targetMetric: 'Fill Dynamics & Acceleration',
  },
  {
    id: 'rex-8',
    title: 'Create a kick/snare pattern',
    category: 'rhythm',
    mode: 'Beatbox',
    instruction: 'Perform an unadorned boom-bap or neo-soul kick & snare foundation.',
    targetMetric: 'Foundation Inter-onset Intervals',
  },
  {
    id: 'rex-9',
    title: 'Freestyle rhythm for 30s',
    category: 'rhythm',
    mode: 'Beatbox',
    instruction: 'Perform freeform percussion, vocal scratches, and mouth bass.',
    targetMetric: 'Polyrhythm & Multi-sound Vocabulary',
  },
];

const INITIAL_PADS: BeatboxPadItem[] = [
  { id: 'pad-1', padName: 'KICK', assignedSoundName: 'Low Chest Kick 01', soundType: 'kick', duration: '0:01.4', capturedDate: 'Sept 17' },
  { id: 'pad-2', padName: 'SNARE', assignedSoundName: 'Crisp Throat Snare', soundType: 'snare', duration: '0:00.8', capturedDate: 'Sept 17' },
  { id: 'pad-3', padName: 'CLOSED HAT', assignedSoundName: 'Tight Tsk Hat', soundType: 'hihat', duration: '0:00.3', capturedDate: 'Sept 16' },
  { id: 'pad-4', padName: 'OPEN HAT', assignedSoundName: 'Air Psshh Hat', soundType: 'hihat', duration: '0:00.7', capturedDate: 'Sept 16' },
  { id: 'pad-5', padName: 'CLAP', assignedSoundName: 'Double-Palm Clap', soundType: 'clap', duration: '0:00.6', capturedDate: 'Sept 15' },
  { id: 'pad-6', padName: 'PERC 1', assignedSoundName: 'Tongue Click Pop', soundType: 'perc', duration: '0:00.4', capturedDate: 'Sept 15' },
  { id: 'pad-7', padName: 'PERC 2', assignedSoundName: 'Resonant Cheek Tap', soundType: 'perc', duration: '0:00.5', capturedDate: 'Sept 14' },
  { id: 'pad-8', padName: 'FX', assignedSoundName: 'Vocal Rewind Breath', soundType: 'fx', duration: '0:01.1', capturedDate: 'Sept 14' },
];

const INITIAL_PATTERNS: RhythmicPatternItem[] = [
  {
    id: 'pat-1',
    name: 'Soul Pocket 16th Shuffle',
    bpm: 92,
    bars: 2,
    swing: 62,
    sourceRecording: 'Beatbox Take 04 (Sept 17)',
    timeSignature: '4/4',
    steps: [true, false, true, false, true, false, false, true, true, false, true, false, true, true, false, false],
  },
  {
    id: 'pat-2',
    name: 'Downtempo Neo-Soul Half-Time',
    bpm: 84,
    bars: 4,
    swing: 68,
    sourceRecording: 'Clap & Tap Session 02 (Sept 16)',
    timeSignature: '4/4',
    steps: [true, false, false, false, true, false, true, false, false, false, true, false, true, false, false, true],
  },
];

export const RhythmProfileSubView: React.FC<RhythmProfileSubViewProps> = ({
  onStartExercise,
  onAddPatternToSession,
  onAddPadToSession,
  rhythmUnderstandingPercent = 74,
}) => {
  const [pads, setPads] = useState<BeatboxPadItem[]>(INITIAL_PADS);
  const [activePlayingPad, setActivePlayingPad] = useState<string | null>(null);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 2500);
  };

  const handleTriggerPad = (pad: BeatboxPadItem) => {
    setActivePlayingPad(pad.id);
    if (pad.soundType === 'kick') {
      audioEngine.playDrum('kick');
    } else if (pad.soundType === 'snare') {
      audioEngine.playDrum('snare');
    } else if (pad.soundType === 'hihat') {
      audioEngine.playDrum('hihat');
    } else if (pad.soundType === 'clap') {
      audioEngine.playDrum('clap');
    } else {
      audioEngine.playNote(220, 'triangle', 0.15);
    }
    setTimeout(() => setActivePlayingPad(null), 350);
  };

  const handlePlayPattern = (pattern: RhythmicPatternItem) => {
    if (activePatternId === pattern.id) {
      setActivePatternId(null);
      return;
    }
    setActivePatternId(pattern.id);

    // Play short rhythm sequence
    pattern.steps.forEach((active, index) => {
      if (active) {
        setTimeout(() => {
          if (index % 4 === 0) audioEngine.playDrum('kick');
          else if (index % 8 === 4) audioEngine.playDrum('snare');
          else audioEngine.playDrum('hihat');
        }, index * 120);
      }
    });

    setTimeout(() => {
      setActivePatternId(null);
    }, pattern.steps.length * 120 + 200);
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header Banner & Indicator */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-rose-400 uppercase">
              CREATOR INTELLIGENCE · GROOVE FINGERPRINT
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-100 font-mono tracking-tight mt-0.5">
              Your Rhythm Profile
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
              How you naturally feel, perform, vocalize, and construct rhythm. Learned through your beatboxing, claps, taps, and vocal cadences.
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="bg-[#0a0f24] border border-rose-500/40 rounded-2xl p-4 min-w-[240px] shadow-lg shrink-0">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Rhythm Understanding</span>
              </span>
              <span className="text-rose-300 font-black text-sm">
                {rhythmUnderstandingPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${rhythmUnderstandingPercent}%` }}
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 text-right">
              Learned from 38 rhythmic performances
            </div>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fade-in shadow-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* SECTION A & B: NATURAL TIMING & GROOVE FINGERPRINT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* A. Natural Timing Visualization (7 cols) */}
        <div className="lg:col-span-7 bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>A. NATURAL TIMING TENDENCIES</span>
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Quantization grid vs your actual performed hits. (Human variation is preserved as feel, not error).
              </p>
            </div>
            <span className="text-xs font-mono text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
              Pocket: +2.1ms Laid-Back
            </span>
          </div>

          {/* Grid Line vs Hit Visualizer */}
          <div className="bg-[#040713] rounded-xl p-4 border border-slate-800/90 space-y-3 font-mono">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Beat 1.1</span>
              <span>Beat 1.2</span>
              <span>Beat 1.3</span>
              <span>Beat 1.4</span>
            </div>

            {/* 4 Beats Comparison Lanes */}
            <div className="space-y-2.5 pt-1">
              {[
                { name: 'Quantized DAW Grid (Rigid)', offset: 0, color: 'bg-slate-700' },
                { name: 'Your Performed Kick Hits', offset: 2.1, color: 'bg-rose-400' },
                { name: 'Your Performed Snare Hits', offset: 3.4, color: 'bg-amber-400' },
                { name: 'Your Performed 16th Hats', offset: 1.8, color: 'bg-sky-400' },
              ].map((lane) => (
                <div key={lane.name} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-300">{lane.name}</span>
                    <span className="text-slate-400">
                      {lane.offset === 0 ? '0.0ms (Mechanical)' : `+${lane.offset}ms (Soul pocket)`}
                    </span>
                  </div>
                  <div className="relative h-4 bg-[#070d22] rounded-md border border-slate-800 overflow-hidden flex items-center px-1">
                    {/* Beat Grid Ticks */}
                    <div className="absolute left-[0%] w-0.5 h-full bg-slate-700/60" />
                    <div className="absolute left-[25%] w-0.5 h-full bg-slate-700/60" />
                    <div className="absolute left-[50%] w-0.5 h-full bg-slate-700/60" />
                    <div className="absolute left-[75%] w-0.5 h-full bg-slate-700/60" />

                    {/* Performed Hit Pointers */}
                    <div
                      style={{ left: `calc(0% + ${lane.offset * 3}px)` }}
                      className={`absolute w-2 h-2.5 rounded-sm ${lane.color} shadow-sm`}
                    />
                    <div
                      style={{ left: `calc(25% + ${lane.offset * 3}px)` }}
                      className={`absolute w-2 h-2.5 rounded-sm ${lane.color} shadow-sm`}
                    />
                    <div
                      style={{ left: `calc(50% + ${lane.offset * 3}px)` }}
                      className={`absolute w-2 h-2.5 rounded-sm ${lane.color} shadow-sm`}
                    />
                    <div
                      style={{ left: `calc(75% + ${lane.offset * 3}px)` }}
                      className={`absolute w-2 h-2.5 rounded-sm ${lane.color} shadow-sm`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[10px] text-slate-500 pt-1 font-sans">
              Conclusion: You naturally perform slightly behind the beat on backbeat snares, producing an organic neo-soul drag.
            </div>
          </div>
        </div>

        {/* B. Groove Fingerprint (5 cols) */}
        <div className="lg:col-span-5 bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>B. GROOVE FINGERPRINT</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Dominant stylistic traits learned from performance velocity and spacing.
            </p>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Pocket-Heavy</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="w-[94%] h-full bg-amber-400 rounded-full" />
                </div>
                <span className="text-amber-300 font-bold">94%</span>
              </div>
            </div>

            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Syncopated</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="w-[86%] h-full bg-rose-400 rounded-full" />
                </div>
                <span className="text-rose-300 font-bold">86%</span>
              </div>
            </div>

            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Loose / Humanized</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-sky-400 rounded-full" />
                </div>
                <span className="text-sky-300 font-bold">78%</span>
              </div>
            </div>

            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">16th Note Swing</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="w-[62%] h-full bg-purple-400 rounded-full" />
                </div>
                <span className="text-purple-300 font-bold">62%</span>
              </div>
            </div>

            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Triplet Influenced</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div className="w-[45%] h-full bg-teal-400 rounded-full" />
                </div>
                <span className="text-teal-300 font-bold">45%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION C: PREFERRED TEMPO ZONES */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>C. PREFERRED TEMPO ZONES</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Distribution of BPMs across your recorded grooves and song drafts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-[#040713] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">70 – 85 BPM</span>
              <span className="text-sky-300 font-bold">High Activity (28%)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className="w-[28%] h-full bg-sky-400 rounded-full" />
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Downtempo &amp; Soul Ballads</div>
          </div>

          <div className="bg-[#040713] p-4 rounded-xl border border-sky-500/50 space-y-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sky-400 font-bold">86 – 105 BPM</span>
              <span className="text-emerald-300 font-black">Primary Zone (58%)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className="w-[58%] h-full bg-emerald-400 rounded-full" />
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              Active Project: <strong>92 BPM Neon Rain</strong>
            </div>
          </div>

          <div className="bg-[#040713] p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">106 – 125 BPM</span>
              <span className="text-slate-400 font-bold">Moderate (14%)</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
              <div className="w-[14%] h-full bg-slate-500 rounded-full" />
            </div>
            <div className="text-[10px] text-slate-500 font-sans">Upbeat R&amp;B / Groove</div>
          </div>
        </div>
      </div>

      {/* SECTION D: INTERACTIVE BEATBOX KIT */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-100 font-mono flex items-center space-x-2">
              <Disc className="w-4 h-4 text-amber-400" />
              <span>D. YOUR INTERACTIVE BEATBOX KIT</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Click any pad to play your mouth-created drum sample. Assign roles, record variations, or place directly in your song.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 shrink-0">
            8/8 Pads Loaded
          </span>
        </div>

        {/* 8-Pad MPC-Style Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pads.map((pad) => {
            const isActive = activePlayingPad === pad.id;
            return (
              <div
                key={pad.id}
                onClick={() => handleTriggerPad(pad)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between h-36 ${
                  isActive
                    ? 'bg-amber-500 border-amber-300 text-slate-950 scale-95 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
                    : 'bg-[#040713] border-slate-800 hover:border-amber-500/50 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between font-mono">
                  <span className={`text-xs font-black tracking-wider ${isActive ? 'text-slate-950' : 'text-amber-400'}`}>
                    {pad.padName}
                  </span>
                  <span className={`text-[10px] ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
                    {pad.duration}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-slate-950' : 'text-slate-100'}`}>
                    {pad.assignedSoundName}
                  </div>
                  <div className={`text-[10px] font-mono ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                    Captured {pad.capturedDate}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                  <span className={`text-[9px] font-mono uppercase ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                    {pad.soundType}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddPadToSession(pad);
                      showNotice(`Added ${pad.padName} pad to session!`);
                    }}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    + Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION E: PATTERN LIBRARY */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Music className="w-4 h-4 text-purple-400" />
            <span>E. PATTERN LIBRARY (SAVED CREATOR GROOVES)</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Rhythmic phrases extracted from your performances, quantized or preserved with original human micro-timing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_PATTERNS.map((pattern) => {
            const isPlaying = activePatternId === pattern.id;
            return (
              <div
                key={pattern.id}
                className="bg-[#040713] border border-slate-800 p-4 rounded-xl space-y-3 font-mono"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{pattern.name}</h4>
                    <div className="text-[11px] text-slate-400">
                      {pattern.bpm} BPM · {pattern.bars} Bars · {pattern.swing}% Swing
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {pattern.timeSignature}
                  </span>
                </div>

                {/* 16-Step Visualizer */}
                <div className="grid grid-cols-16 gap-1 h-6 bg-[#060a16] p-1 rounded-lg border border-slate-800">
                  {pattern.steps.map((on, idx) => (
                    <div
                      key={idx}
                      className={`rounded-sm transition-all ${
                        on
                          ? isPlaying
                            ? 'bg-rose-400 animate-pulse'
                            : 'bg-purple-400'
                          : 'bg-slate-800/40'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={() => handlePlayPattern(pattern)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{isPlaying ? 'Playing...' : 'Play Groove'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onAddPatternToSession(pattern);
                      showNotice(`Placed "${pattern.name}" pattern into session!`);
                    }}
                    className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add to Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION F: CADENCE & VOCAL RHYTHM */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>F. VOCAL CADENCE &amp; SPEECH RHYTHM</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Syllable Density</span>
            <span className="text-slate-200 font-bold block mt-0.5">4.8 syllables/sec</span>
            <span className="text-slate-500 text-[10px]">Balanced melodic flow</span>
          </div>
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Pause Behavior</span>
            <span className="text-slate-200 font-bold block mt-0.5">Half-bar breath space</span>
            <span className="text-slate-500 text-[10px]">Gives room for band responses</span>
          </div>
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Syncopated Phrasing</span>
            <span className="text-slate-200 font-bold block mt-0.5">Off-beat entry on "and of 1"</span>
            <span className="text-slate-500 text-[10px]">Soulful rhythmic anticipation</span>
          </div>
        </div>
      </div>

      {/* SECTION G: IMPROVE MY RHYTHM PROFILE */}
      <div className="bg-[#070b1a] border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-100 font-mono flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>G. IMPROVE MY RHYTHM PROFILE</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Choose an exercise below to jump into Creator Training with that specific rhythm capture mode activated.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {RHYTHM_EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onStartExercise(ex)}
              className="bg-[#040713] hover:bg-[#160c18] border border-slate-800 hover:border-rose-500/60 p-3.5 rounded-xl text-left flex flex-col justify-between space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-100 font-mono group-hover:text-rose-300 flex items-center justify-between">
                  <span>{ex.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {ex.instruction}
                </div>
              </div>

              <div className="text-[10px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded w-fit border border-rose-900/60">
                Metric: {ex.targetMetric}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
