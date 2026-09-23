import React, { useState } from 'react';
import {
  Mic,
  Sliders,
  Sparkles,
  Volume2,
  Check,
  Play,
  RotateCcw,
  Layers,
  Music,
  Plus,
  Trash2,
  Users,
  VolumeX,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface VocalistLayer {
  id: string;
  name: string;
  role: string;
  interval: string;
  description: string;
  volume: number;
  pan: number;
  muted: boolean;
  noteFrequency: number;
  isCustom?: boolean;
}

const INITIAL_VOCALISTS: VocalistLayer[] = [
  {
    id: 'soprano',
    name: '01 · SOPRANO',
    role: 'Top Harmony',
    interval: '+3rd / +4th',
    description: 'Lifts emotional register. Features airy vibrato and crystalline top end.',
    volume: 0.85,
    pan: 0.35,
    muted: false,
    noteFrequency: 466.16,
  },
  {
    id: 'alto',
    name: '02 · ALTO',
    role: 'Body & Unison',
    interval: 'Unison / +5th',
    description: 'Provides fundamental harmonic thickness directly flanking the lead vocal.',
    volume: 0.9,
    pan: -0.2,
    muted: false,
    noteFrequency: 392.0,
  },
  {
    id: 'tenor',
    name: '03 · TENOR',
    role: 'Warm Foundation',
    interval: '-3rd / -7th',
    description: 'Chest voice foundation providing gospel soul weight and warmth.',
    volume: 0.8,
    pan: -0.35,
    muted: false,
    noteFrequency: 311.13,
  },
];

const VOCALIST_PRESETS = [
  {
    name: '04 · BASS VOCAL',
    role: 'Sub-Harmonic Anchor',
    interval: '-Octave / -5th',
    description: 'Deep chest bass vocal grounding the low end beneath the tenor.',
    volume: 0.75,
    pan: 0,
    noteFrequency: 155.56,
  },
  {
    name: '05 · FALSETTO DOUBLE',
    role: 'Airy Top Shimmer',
    interval: '+Octave High',
    description: 'Delicate whisper falsetto layer providing modern R&B sheen and sparkle.',
    volume: 0.7,
    pan: 0.5,
    noteFrequency: 622.25,
  },
  {
    name: '06 · AD-LIB FLANK',
    role: 'Call & Response',
    interval: 'Pentatonic Blues Runs',
    description: 'Agile soul ad-lib runs and breath accents in response to lead hook phrases.',
    volume: 0.82,
    pan: -0.45,
    noteFrequency: 523.25,
  },
  {
    name: '07 · GOSPEL CHOIR STACK',
    role: 'Full Ensemble Double',
    interval: 'Wide Spread Chord',
    description: 'Stereo choral spread creating monumental church sanctuary impact.',
    volume: 0.85,
    pan: 0.6,
    noteFrequency: 349.23,
  },
];

interface BGVStudioViewProps {
  onApplyHarmonyToTrack: (harmonyType: string, targetSection: string) => void;
  onRecruitVocalistToBand?: (name: string, role: string) => void;
}

export const BGVStudioView: React.FC<BGVStudioViewProps> = ({
  onApplyHarmonyToTrack,
  onRecruitVocalistToBand,
}) => {
  const [vocalists, setVocalists] = useState<VocalistLayer[]>(INITIAL_VOCALISTS);
  const [harmonyInterval, setHarmonyInterval] = useState<string>(
    '3-Part Gospel Triad (3rd, 5th, 7th)'
  );
  const [targetSection, setTargetSection] = useState<string>('FINAL CHORUS');
  const [directionMode, setDirectionMode] = useState<'follow' | 'open'>('open');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false);

  const handleAuditionHarmony = () => {
    // Audition all unmuted vocalists
    vocalists.forEach((v) => {
      if (!v.muted) {
        audioEngine.playNote(v.noteFrequency, 'sine', v.volume * 0.8);
      }
    });
  };

  const handleAuditionSingle = (v: VocalistLayer) => {
    audioEngine.playNote(v.noteFrequency, 'sine', v.volume * 0.8);
  };

  const handleAddPresetVocalist = (preset: typeof VOCALIST_PRESETS[0]) => {
    const newVocalist: VocalistLayer = {
      id: `voc_${Date.now()}`,
      name: preset.name,
      role: preset.role,
      interval: preset.interval,
      description: preset.description,
      volume: preset.volume,
      pan: preset.pan,
      muted: false,
      noteFrequency: preset.noteFrequency,
      isCustom: true,
    };
    setVocalists((prev) => [...prev, newVocalist]);
    setIsAddMenuOpen(false);
  };

  const handleDeleteVocalist = (id: string) => {
    setVocalists((prev) => prev.filter((v) => v.id !== id));
  };

  const handleToggleMute = (id: string) => {
    setVocalists((prev) =>
      prev.map((v) => (v.id === id ? { ...v, muted: !v.muted } : v))
    );
  };

  const handleVolumeChange = (id: string, newVol: number) => {
    setVocalists((prev) =>
      prev.map((v) => (v.id === id ? { ...v, volume: newVol } : v))
    );
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              BACKGROUND VOCAL STUDIO (BGV) · SESSION VOCALISTS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Intelligent multi-part vocal ensemble with breath, formant tracking, and individual session vocalist control.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Add Vocalist Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Session Vocalist</span>
            </button>

            {isAddMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-30 space-y-1 animate-in fade-in">
                <div className="text-[10px] font-mono font-bold text-purple-300 px-2 py-1 uppercase tracking-wider">
                  Add Vocalist / Harmony Part
                </div>
                {VOCALIST_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAddPresetVocalist(preset)}
                    className="w-full text-left p-2 rounded-lg hover:bg-purple-500/20 text-slate-200 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-100 group-hover:text-purple-300">
                        {preset.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {preset.interval}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleAuditionHarmony}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Audition Vocal Ensemble</span>
          </button>
        </div>
      </div>

      {/* Vocalists Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vocalists.map((v) => (
          <div
            key={v.id}
            className={`rounded-xl border p-4 space-y-3 transition-all ${
              v.muted
                ? 'bg-slate-950/60 border-slate-800 opacity-60'
                : 'bg-slate-900/90 border-slate-800 hover:border-purple-500/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {v.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block">
                  {v.role} · {v.interval}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleAuditionSingle(v)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Audition Note"
                >
                  <Play className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleToggleMute(v.id)}
                  className={`p-1 rounded transition-colors ${
                    v.muted
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title={v.muted ? 'Unmute' : 'Mute'}
                >
                  {v.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>

                {/* Delete Vocalist Button (Allows deleting any layer, keeping at least 1) */}
                {vocalists.length > 1 && (
                  <button
                    onClick={() => handleDeleteVocalist(v.id)}
                    className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove Vocalist"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {v.description}
            </p>

            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span>VOCAL LEVEL</span>
                <span>{Math.round(v.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={v.volume}
                onChange={(e) => handleVolumeChange(v.id, Number(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Harmony Configuration & Direction */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-4">
        <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
          Harmony Routing &amp; Section Direction
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="text-[10px] text-slate-400 block mb-1">HARMONY FORMULA</label>
            <select
              value={harmonyInterval}
              onChange={(e) => setHarmonyInterval(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg p-2 outline-none focus:border-purple-500"
            >
              <option>3-Part Gospel Triad (3rd, 5th, 7th)</option>
              <option>Lush Neo-Soul 9ths &amp; 11ths</option>
              <option>Open 5th Power Stack</option>
              <option>Octave Doubler + Unison Chorus</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">TARGET SECTION</label>
            <select
              value={targetSection}
              onChange={(e) => setTargetSection(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg p-2 outline-none focus:border-purple-500"
            >
              <option value="FINAL CHORUS">Final Chorus (Bars 37-48)</option>
              <option value="CHORUS">Chorus (Bars 13-20)</option>
              <option value="BRIDGE">Bridge (Bars 29-36)</option>
              <option value="ALL CHORUSES">All Chorus Sections</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-400 block mb-1">DIRECTION INTENT</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-700">
              <button
                onClick={() => setDirectionMode('follow')}
                className={`flex-1 py-1.5 text-center text-xs transition-colors cursor-pointer ${
                  directionMode === 'follow'
                    ? 'bg-purple-500 text-white font-bold'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                Follow Me Here
              </button>
              <button
                onClick={() => setDirectionMode('open')}
                className={`flex-1 py-1.5 text-center text-xs transition-colors cursor-pointer ${
                  directionMode === 'open'
                    ? 'bg-purple-500 text-white font-bold'
                    : 'bg-slate-950 text-slate-400'
                }`}
              >
                Open Up Here
              </button>
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-wrap gap-2">
          <div className="text-[11px] font-mono text-slate-400">
            Routes {vocalists.filter((v) => !v.muted).length} vocal parts directly to Track 05 (BGV Section Group Bus)
          </div>
          <button
            onClick={() => onApplyHarmonyToTrack(harmonyInterval, targetSection)}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Generate &amp; Place Harmony on {targetSection}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

