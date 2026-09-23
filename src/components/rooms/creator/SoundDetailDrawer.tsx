import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  Plus,
  Radio,
  Sparkles,
  Music,
  Activity,
  Layers,
  FileAudio,
  Sliders,
  Check,
  Tag,
  Clock,
  Volume2,
} from 'lucide-react';
import { CreatorSoundItem } from '../../../types/creatorIntelligence';
import { audioEngine } from '../../../services/audioEngine';

interface SoundDetailDrawerProps {
  sound: CreatorSoundItem | null;
  onClose: () => void;
  onAddToSession: (sound: CreatorSoundItem) => void;
  projectName: string;
}

export const SoundDetailDrawer: React.FC<SoundDetailDrawerProps> = ({
  sound,
  onClose,
  onAddToSession,
  projectName,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'source' | 'understanding' | 'derived'>('understanding');
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!sound) return null;

  const handleAudition = () => {
    setIsPlaying(true);
    if (sound.audioFreqOrType === 'kick') {
      audioEngine.playDrum('kick');
    } else if (sound.audioFreqOrType === 'clap') {
      audioEngine.playDrum('clap');
    } else if (sound.audioFreqOrType === 'hum') {
      audioEngine.playNote(174.61, 'triangle', 1.2);
      setTimeout(() => audioEngine.playNote(207.65, 'sine', 0.8), 240);
    } else {
      audioEngine.playNote(261.63, 'sine', 0.4);
      setTimeout(() => audioEngine.playNote(311.13, 'sine', 0.4), 180);
    }
    setTimeout(() => setIsPlaying(false), 900);
  };

  const notifyDerived = (actionName: string) => {
    setCopiedNotification(`Derived asset: ${actionName} ready`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl h-full bg-[#050814] border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto space-y-5 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="space-y-3 pb-4 border-b border-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                {sound.category} · {sound.musicalRole}
              </span>
              <h2 className="text-xl font-black text-slate-100 mt-1 font-mono tracking-tight">
                {sound.name}
              </h2>
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-0.5">
                <span>Duration: {sound.duration}</span>
                <span>•</span>
                <span>Captured: {sound.dateCaptured}</span>
                {sound.bpm && (
                  <>
                    <span>•</span>
                    <span>{sound.bpm} BPM</span>
                  </>
                )}
                {sound.key && (
                  <>
                    <span>•</span>
                    <span className="text-purple-300">{sound.key}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Three-Layer Architectural Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 bg-[#070d20] p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('source')}
              className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeTab === 'source'
                  ? 'bg-sky-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1. SOURCE
            </button>
            <button
              onClick={() => setActiveTab('understanding')}
              className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeTab === 'understanding'
                  ? 'bg-purple-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              2. UNDERSTANDING
            </button>
            <button
              onClick={() => setActiveTab('derived')}
              className={`py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeTab === 'derived'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3. USE &amp; DERIVED
            </button>
          </div>
        </div>

        {/* Tab 1: SOURCE (Untouched Raw Audio) */}
        {activeTab === 'source' && (
          <div className="space-y-4 flex-1">
            <div className="bg-[#070c1e] border border-slate-800/90 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-sky-400 flex items-center space-x-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>UNTOUCHED ORIGINAL RECORDING</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  48kHz · 24-bit PCM
                </span>
              </div>

              {/* Waveform Visualization Canvas */}
              <div className="bg-[#040713] rounded-xl border border-slate-800 p-4 flex items-center justify-center space-x-1 h-24">
                {Array.from({ length: 36 }).map((_, i) => {
                  const h = Math.sin(i * 0.3) * 35 + 40;
                  return (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className={`w-1.5 rounded-full transition-all ${
                        isPlaying ? 'bg-sky-400 animate-pulse' : 'bg-sky-500/40'
                      }`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={handleAudition}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-md"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Auditioning Raw...' : 'Audition Raw Source'}</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  Source: {sound.source}
                </span>
              </div>
            </div>

            <div className="bg-[#070c1e] border border-slate-800/80 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-300">Creator Roots Provenance</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                The original recording is stored in your private Creator Roots library and will never be overwritten or destructively processed. SoulSonus uses non-destructive pointer architecture.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {sound.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: UNDERSTANDING (SoulSonus Analysis) */}
        {activeTab === 'understanding' && (
          <div className="space-y-4 flex-1">
            <div className="bg-[#080d22] border border-purple-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SOULSONUS EXTRACTED INTELLIGENCE</span>
                </span>
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/40">
                  {sound.analysis?.confidence || 94}% Confidence
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="bg-[#050814] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Musical Function</span>
                  <span className="text-slate-200 font-bold">{sound.analysis?.musicalRole || sound.musicalRole}</span>
                </div>
                <div className="bg-[#050814] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Timbre &amp; Texture</span>
                  <span className="text-slate-200 font-bold">{sound.analysis?.timbre || 'Airy & Resonant'}</span>
                </div>
                <div className="bg-[#050814] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Transient Dynamics</span>
                  <span className="text-slate-200 font-bold">{sound.analysis?.transient || 'Fast punchy attack, 14ms'}</span>
                </div>
                <div className="bg-[#050814] p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Pocket / Micro-timing</span>
                  <span className="text-slate-200 font-bold">{sound.analysis?.rhythm || '+1.8ms organic soul pocket'}</span>
                </div>
              </div>

              {sound.analysis?.vocalQualities && (
                <div className="bg-[#050814] p-3 rounded-xl border border-slate-800 text-xs font-sans text-slate-300">
                  <strong className="text-purple-300 block font-mono text-[11px] mb-0.5">Learned Vocal Trait:</strong>
                  {sound.analysis.vocalQualities}
                </div>
              )}
            </div>

            <div className="bg-[#070c1e] border border-slate-800 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-mono font-bold text-slate-300">Profile Contribution</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                This sound has contributed to your{' '}
                <strong className="text-sky-300 font-mono">
                  {sound.category === 'Beatbox' || sound.category === 'Drums'
                    ? 'Rhythm Profile'
                    : 'Voice Profile'}
                </strong>
                , updating natural groove recognition and signature phrase models.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: USE & DERIVED ASSETS */}
        {activeTab === 'derived' && (
          <div className="space-y-4 flex-1">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>DERIVED INSTANCES &amp; FORMATS</span>
              </span>
              <p className="text-xs text-slate-400 font-sans">
                SoulSonus generates musical representations from your sound while preserving the original.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d22] border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400">
                    <FileAudio className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 font-mono">Trimmed Transient One-Shot</div>
                    <div className="text-[10px] text-slate-400 font-mono">Zero-crossing aligned, 0:00.6</div>
                  </div>
                </div>
                <button
                  onClick={() => notifyDerived('Trimmed One-Shot')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-mono rounded-lg transition-colors"
                >
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d22] border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <Music className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 font-mono">MIDI / Pattern Extraction</div>
                    <div className="text-[10px] text-slate-400 font-mono">Quantized &amp; human velocity curves</div>
                  </div>
                </div>
                <button
                  onClick={() => notifyDerived('MIDI Extract')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-mono rounded-lg transition-colors"
                >
                  Convert
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#080d22] border border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200 font-mono">Instrument Sampler Mapping</div>
                    <div className="text-[10px] text-slate-400 font-mono">Key-spread across full 88-key piano</div>
                  </div>
                </div>
                <button
                  onClick={() => notifyDerived('Sampler Map')}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono rounded-lg transition-colors"
                >
                  Map Keys
                </button>
              </div>
            </div>

            {copiedNotification && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{copiedNotification}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer Action: + Add to Session */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Active Project: <span className="text-slate-200 font-bold">{projectName}</span>
          </div>

          <button
            onClick={() => {
              onAddToSession(sound);
              onClose();
            }}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add to {projectName}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
