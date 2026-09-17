import React, { useState } from 'react';
import {
  Dna,
  Mic,
  Music,
  Activity,
  Play,
  Pause,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  Volume2,
  CheckCircle2,
  Sliders,
  Flame,
  Info,
} from 'lucide-react';
import { TrainingExercise } from '../../../types/creatorIntelligence';
import { audioEngine } from '../../../services/audioEngine';

interface VoiceProfileSubViewProps {
  onStartExercise: (exercise: TrainingExercise) => void;
  voiceUnderstandingPercent?: number;
}

const VOICE_EXERCISES: TrainingExercise[] = [
  {
    id: 'vex-1',
    title: 'Record low notes',
    category: 'voice',
    mode: 'Sing',
    instruction: 'Sing down your comfortable vocal range to capture lower chest resonance.',
    targetMetric: 'Lowest Comfortable Note & Chest Register',
  },
  {
    id: 'vex-2',
    title: 'Record high notes',
    category: 'voice',
    mode: 'Sing',
    instruction: 'Ascend into your upper register and falsetto to map head voice limits.',
    targetMetric: 'Highest Range & Falsetto Ceiling',
  },
  {
    id: 'vex-3',
    title: 'Sing a sustained note',
    category: 'voice',
    mode: 'Sing',
    instruction: 'Hold a stable pitch (like C4) for 6 seconds to evaluate natural vibrato and breath drift.',
    targetMetric: 'Vibrato Rate & Sustain Envelope',
  },
  {
    id: 'vex-4',
    title: 'Speak naturally',
    category: 'voice',
    mode: 'Speak',
    instruction: 'Recite a few casual thoughts to capture fundamental speaking pitch and cadence.',
    targetMetric: 'Speaking Register & Formants',
  },
  {
    id: 'vex-5',
    title: 'Rap eight bars',
    category: 'voice',
    mode: 'Speak',
    instruction: 'Deliver a rhythmic verse to measure syllable density and percussive consonants.',
    targetMetric: 'Rhythmic Cadence & Attack',
  },
  {
    id: 'vex-6',
    title: 'Record an ad-lib',
    category: 'voice',
    mode: 'Voice' as any,
    instruction: 'Shout or whisper a signature ad-lib like "Yeah", "Ooh", or "Listen".',
    targetMetric: 'Signature Vocal Elements',
  },
  {
    id: 'vex-7',
    title: 'Hum a melody',
    category: 'voice',
    mode: 'Hum',
    instruction: 'Hum an intuitive melody to isolate melodic pitch memory without words.',
    targetMetric: 'Melodic Instinct & Intonation',
  },
  {
    id: 'vex-8',
    title: 'Perform soft and loud versions',
    category: 'voice',
    mode: 'Sing',
    instruction: 'Perform the exact same line at pianissimo (soft) then fortissimo (belted).',
    targetMetric: 'Dynamic Velocity Tracking',
  },
  {
    id: 'vex-9',
    title: 'Perform phrase with varied emotion',
    category: 'voice',
    mode: 'Sing',
    instruction: 'Deliver a phrase intimately, then mournfully, then urgently.',
    targetMetric: 'Emotional Timbre Matrix',
  },
];

const TIMBRE_TRAITS = [
  { name: 'Warm', percent: 82, color: 'bg-amber-400', desc: 'Rich 200–500Hz harmonic fullness' },
  { name: 'Chest-dominant', percent: 78, color: 'bg-orange-400', desc: 'Authoritative subglottal resonance' },
  { name: 'Resonant', percent: 70, color: 'bg-purple-400', desc: 'Strong pharyngeal acoustic bloom' },
  { name: 'Airy', percent: 64, color: 'bg-sky-400', desc: 'Breath turbulence above 8kHz' },
  { name: 'Breathy', percent: 58, color: 'bg-teal-400', desc: 'Soft vocal fold closure dynamics' },
  { name: 'Bright', percent: 45, color: 'bg-yellow-400', desc: 'High frequency crispness 3–6kHz' },
  { name: 'Raspy', percent: 31, color: 'bg-rose-400', desc: 'Sub-harmonic grit on loud phrases' },
  { name: 'Nasal', percent: 12, color: 'bg-slate-400', desc: 'Very low velopharyngeal leakage' },
];

const REGISTERS = [
  { name: 'Speaking Voice', range: 'F2 – C3', samples: 9, noteFreq: 130.81 },
  { name: 'Chest Voice', range: 'A2 – G3', samples: 14, noteFreq: 174.61 },
  { name: 'Head Voice', range: 'A3 – E4', samples: 8, noteFreq: 329.63 },
  { name: 'Falsetto', range: 'F4 – C5', samples: 6, noteFreq: 523.25 },
  { name: 'Whisper Delivery', range: 'Unpitched air', samples: 4, noteFreq: 220 },
  { name: 'Rap / Cadence', range: 'G2 – D3', samples: 11, noteFreq: 146.83 },
  { name: 'Melodic Rap', range: 'C3 – F3', samples: 7, noteFreq: 174.61 },
  { name: 'Sung Vocal', range: 'A2 – C5', samples: 18, noteFreq: 261.63 },
  { name: 'Ad-Lib Voice', range: 'Varied pitch', samples: 12, noteFreq: 392 },
];

export const VoiceProfileSubView: React.FC<VoiceProfileSubViewProps> = ({
  onStartExercise,
  voiceUnderstandingPercent = 68,
}) => {
  const [playingRegister, setPlayingRegister] = useState<string | null>(null);

  const handleAuditionRegister = (reg: typeof REGISTERS[0]) => {
    setPlayingRegister(reg.name);
    audioEngine.playNote(reg.noteFreq, 'sine', 0.6);
    setTimeout(() => setPlayingRegister(null), 700);
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header & Understanding Indicator */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono font-bold tracking-widest text-purple-400 uppercase">
              CREATOR INTELLIGENCE · VOCAL DNA
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-100 font-mono tracking-tight mt-0.5">
              Your Voice Profile
            </h2>
            <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl font-sans leading-relaxed">
              SoulSonus learns the characteristics, range, delivery, expression, and recurring traits of your voice from the material you choose to train.
            </p>
          </div>

          {/* Profile Completion Indicator */}
          <div className="bg-[#0a0f24] border border-purple-500/40 rounded-2xl p-4 min-w-[240px] shadow-lg shrink-0">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-300 font-bold flex items-center space-x-1.5">
                <Dna className="w-3.5 h-3.5 text-purple-400" />
                <span>Voice Understanding</span>
              </span>
              <span className="text-purple-300 font-black text-sm">
                {voiceUnderstandingPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                style={{ width: `${voiceUnderstandingPercent}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-sky-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(168,85,247,0.5)]"
              />
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1 text-right">
              Learned from 42 creator training samples
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: VOCAL RANGE (Piano & Indicator) */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>A. VOCAL RANGE &amp; COMFORT ZONES</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Calculated from pitch tracking across your singing and humming takes.
            </p>
          </div>
          <span className="text-xs font-mono text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/30">
            Tenor / High Baritone
          </span>
        </div>

        {/* Range Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono">
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Lowest Note</span>
            <span className="text-lg font-black text-slate-100">A2</span>
            <span className="text-[10px] text-slate-500 block">110 Hz</span>
          </div>
          <div className="bg-[#040713] p-3 rounded-xl border border-purple-500/40 col-span-2">
            <span className="text-[10px] text-purple-400 uppercase block font-bold">Comfort Zone / Strongest</span>
            <span className="text-lg font-black text-purple-300">C3 — G4</span>
            <span className="text-[10px] text-slate-400 block">Optimal resonant power</span>
          </div>
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Speaking Range</span>
            <span className="text-lg font-black text-slate-100">F2 — C3</span>
            <span className="text-[10px] text-slate-500 block">Casual tone</span>
          </div>
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Highest Note</span>
            <span className="text-lg font-black text-sky-400">C5</span>
            <span className="text-[10px] text-slate-500 block">Falsetto peak</span>
          </div>
        </div>

        {/* Interactive Piano Keyboard Visualization */}
        <div className="bg-[#040713] rounded-xl p-4 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1">
            <span>Octave 2 (Low)</span>
            <span className="text-purple-300 font-bold">Octave 3 (Core)</span>
            <span className="text-purple-300 font-bold">Octave 4 (Upper)</span>
            <span>Octave 5 (Falsetto)</span>
          </div>

          <div className="relative h-20 flex rounded-lg overflow-hidden border border-slate-700 select-none">
            {/* White Keys */}
            {['C2','D2','E2','F2','G2','A2','B2','C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'].map((key) => {
              const isComfort = ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4'].includes(key);
              const isSinging = ['A2','B2','C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'].includes(key);
              return (
                <div
                  key={key}
                  className={`flex-1 border-r border-slate-800 text-[8px] font-mono flex flex-col justify-end items-center pb-1 transition-colors ${
                    isComfort
                      ? 'bg-purple-900/50 text-purple-200 font-bold'
                      : isSinging
                      ? 'bg-slate-800/80 text-slate-300'
                      : 'bg-slate-900/60 text-slate-600'
                  }`}
                >
                  {key}
                </div>
              );
            })}
          </div>
          <div className="text-[10px] font-mono text-slate-500 text-center">
            Highlighted purple keys indicate your highest harmonic resonance and stamina.
          </div>
        </div>
      </div>

      {/* SECTION B: TIMBRE PROFILE */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>B. TIMBRE PROFILE &amp; ACOUSTIC WEIGHTS</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Acoustic color matrix extracted by comparing harmonic overtone energy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
          {TIMBRE_TRAITS.map((trait) => (
            <div key={trait.name} className="bg-[#040713] p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-bold">{trait.name}</span>
                <span className="text-slate-300 font-bold">{trait.percent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                <div
                  style={{ width: `${trait.percent}%` }}
                  className={`h-full ${trait.color} rounded-full`}
                />
              </div>
              <div className="text-[10px] text-slate-500 font-sans">{trait.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION C: VOICE REGISTERS */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>C. VOICE REGISTERS &amp; CAPTURED SAMPLES</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            SoulSonus classifies your vocal expression into 9 distinct production registers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {REGISTERS.map((reg) => {
            const isPlaying = playingRegister === reg.name;
            return (
              <div
                key={reg.name}
                className="bg-[#040713] border border-slate-800 p-3.5 rounded-xl flex items-center justify-between font-mono"
              >
                <div>
                  <div className="text-xs font-bold text-slate-200">{reg.name}</div>
                  <div className="text-[11px] text-slate-400">{reg.range}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{reg.samples} samples trained</div>
                </div>

                <button
                  onClick={() => handleAuditionRegister(reg)}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    isPlaying
                      ? 'bg-sky-400 text-slate-950 shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Audition register frequency"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION D & E: DELIVERY & SIGNATURE VOCAL ELEMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* D. Delivery & Expression */}
        <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>D. DELIVERY &amp; EXPRESSION TENDENCIES</span>
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Attack Velocity</span>
              <span className="text-emerald-300 font-bold">Dynamic soft attack (24ms)</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Sustain Phrasing</span>
              <span className="text-emerald-300 font-bold">Extended legato w/ slow falloff</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Natural Vibrato</span>
              <span className="text-emerald-300 font-bold">Late onset, 5.2 Hz cycle</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Cadence Pocket</span>
              <span className="text-emerald-300 font-bold">Laid-back, -1.8ms behind beat</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Breath Usage</span>
              <span className="text-emerald-300 font-bold">Controlled intake cue before verse</span>
            </div>
          </div>
        </div>

        {/* E. Signature Vocal Elements */}
        <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
          <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            <span>E. SIGNATURE VOCAL ELEMENTS</span>
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Favorite Ad-lib</span>
              <span className="text-pink-300 font-bold">Airy "Hey" with tail reverb</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Recurring Vocal Run</span>
              <span className="text-pink-300 font-bold">Minor pentatonic blues 5-b3-1</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Signature Phrase</span>
              <span className="text-pink-300 font-bold">SoulSonus warm hum swell</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Harmony Tracking</span>
              <span className="text-pink-300 font-bold">Parallel minor 3rd + oct double</span>
            </div>
            <div className="bg-[#040713] p-2.5 rounded-xl border border-slate-800 flex justify-between">
              <span className="text-slate-400">Stereo Doubling</span>
              <span className="text-pink-300 font-bold">Loose humanized ±12c detune</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION F: VOICE TRAINING HISTORY */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-5 space-y-3 shadow-md">
        <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>F. VOICE TRAINING HISTORY</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-purple-400 font-bold block">September 17</span>
            <span className="text-slate-200 font-bold block mt-0.5">Melodic Phrase Training</span>
            <span className="text-slate-500 text-[11px]">4 samples · Extracted F minor vibrato</span>
          </div>
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-purple-400 font-bold block">September 16</span>
            <span className="text-slate-200 font-bold block mt-0.5">Rap Cadence Training</span>
            <span className="text-slate-500 text-[11px]">7 samples · Mapped 16th syllabics</span>
          </div>
          <div className="bg-[#040713] p-3 rounded-xl border border-slate-800">
            <span className="text-purple-400 font-bold block">September 14</span>
            <span className="text-slate-200 font-bold block mt-0.5">Ad-lib &amp; Whisper Training</span>
            <span className="text-slate-500 text-[11px]">5 samples · Sub-harmonic breath layer</span>
          </div>
        </div>
      </div>

      {/* SECTION G: IMPROVE MY VOICE PROFILE */}
      <div className="bg-[#070b1a] border border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-100 font-mono flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>G. IMPROVE MY VOICE PROFILE</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Choose a specific exercise below to launch Creator Training with that mode and target metric pre-configured.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VOICE_EXERCISES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onStartExercise(ex)}
              className="bg-[#040713] hover:bg-[#0c142c] border border-slate-800 hover:border-purple-500/60 p-3.5 rounded-xl text-left flex flex-col justify-between space-y-2 transition-all group cursor-pointer shadow-sm"
            >
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-100 font-mono group-hover:text-purple-300 flex items-center justify-between">
                  <span>{ex.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  {ex.instruction}
                </div>
              </div>

              <div className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-2 py-0.5 rounded w-fit border border-purple-900/60">
                Metric: {ex.targetMetric}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
