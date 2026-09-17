import React, { useState } from 'react';
import {
  Music2,
  Play,
  Pause,
  Plus,
  Radio,
  Clock,
  Sparkles,
  Layers,
  Search,
  ExternalLink,
  Mic,
  Disc,
  Activity,
  Check,
  Trash2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { CreatorSoundItem, ProjectUsedAsset, SessionInterpretation } from '../../../types/creatorIntelligence';
import { audioEngine } from '../../../services/audioEngine';

interface ProjectContextSubViewProps {
  projectName: string;
  bpm: number;
  timeSignature: string;
  keySignature?: string;
  allSounds: CreatorSoundItem[];
  onCaptureNewIdea: () => void;
  onOpenMySounds: () => void;
  onInspectSound: (sound: CreatorSoundItem) => void;
  onAddToSession: (sound: CreatorSoundItem, mode: SessionInterpretation, destination: 'playhead' | 'selected_track') => void;
  onLocateInSession?: (asset: ProjectUsedAsset) => void;
}

const INITIAL_USED_ASSETS: ProjectUsedAsset[] = [
  {
    id: 'used-1',
    soundId: 'root-1',
    name: 'Low Chest Kick 01',
    usedOnTrack: 'Drum Track 01 (Boom Bap)',
    trackColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    usageType: 'One-Shot Drum',
    barLocation: 'Bar 01.1 – Bar 08.4',
    sourceCapture: 'Sept 17 · Beatbox Kit',
  },
  {
    id: 'used-2',
    soundId: 'root-2',
    name: 'Midnight Hum Phrase',
    usedOnTrack: 'Melody Track 04 (Pad Layer)',
    trackColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    usageType: 'MIDI Phrasing',
    barLocation: 'Bar 05.1 – Bar 09.1',
    sourceCapture: 'Sept 17 · Intuitive Hum',
  },
  {
    id: 'used-3',
    soundId: 'root-3',
    name: 'Airy "Hey" Ad-lib',
    usedOnTrack: 'Vocal Track 02 (Lead Ad-libs)',
    trackColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    usageType: 'Vocal Ad-lib',
    barLocation: 'Bar 04.4 & Bar 08.4',
    sourceCapture: 'Sept 16 · Vocal Take',
  },
];

export const ProjectContextSubView: React.FC<ProjectContextSubViewProps> = ({
  projectName,
  bpm,
  timeSignature,
  keySignature = 'F Minor',
  allSounds,
  onCaptureNewIdea,
  onOpenMySounds,
  onInspectSound,
  onAddToSession,
  onLocateInSession,
}) => {
  const [usedAssets, setUsedAssets] = useState<ProjectUsedAsset[]>(INITIAL_USED_ASSETS);
  const [recentlyCaptured, setRecentlyCaptured] = useState<CreatorSoundItem[]>(
    allSounds.slice(0, 3)
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleAudition = (id: string, type: string) => {
    if (playingId === id) {
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    if (type.includes('kick')) {
      audioEngine.playDrum('kick');
    } else if (type.includes('hum')) {
      audioEngine.playNote(174.61, 'triangle', 1.0);
    } else {
      audioEngine.playNote(261.63, 'sine', 0.4);
    }
    setTimeout(() => setPlayingId(null), 800);
  };

  const handleDeleteRecent = (soundId: string) => {
    setRecentlyCaptured((prev) => prev.filter((s) => s.id !== soundId));
    showNotice('Unassigned capture discarded');
  };

  // Suggested personal assets that match project BPM/vibe
  const suggestedSounds = allSounds.filter(
    (s) => !usedAssets.some((u) => u.soundId === s.id)
  ).slice(0, 3);

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Top Project Anchor Card */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            {/* Artwork Placeholder */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 via-purple-500/20 to-emerald-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 font-black text-2xl shadow-inner shrink-0">
              <Disc className="w-10 h-10 text-sky-400 animate-spin-slow" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ACTIVE SOULPROJECT
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Status: <strong className="text-emerald-300">Live Recording</strong>
                </span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-black text-slate-100 font-mono tracking-tight">
                {projectName}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300 pt-0.5">
                <span>Tempo: <strong className="text-sky-300">{bpm} BPM</strong></span>
                <span>•</span>
                <span>Key: <strong className="text-purple-300">{keySignature}</strong></span>
                <span>•</span>
                <span>Meter: <strong className="text-slate-100">{timeSignature}</strong></span>
                <span>•</span>
                <span>Playhead: <strong className="text-amber-300">Bar 04.2</strong></span>
                <span>•</span>
                <span>Duration: <strong>03:42.0</strong></span>
              </div>
            </div>
          </div>

          {/* Prominent Capture Action Button */}
          <button
            onClick={onCaptureNewIdea}
            className="px-6 py-3.5 bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-slate-950 font-mono font-black text-sm rounded-xl flex items-center space-x-2 shadow-lg shadow-sky-500/20 transition-all cursor-pointer shrink-0"
          >
            <Mic className="w-4 h-4 text-slate-950" />
            <span>🎙 Capture New Idea for {projectName}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fade-in shadow-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* SECTION 1: CREATOR TRAINING USED IN THIS PROJECT */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-100 font-mono flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>CREATOR TRAINING USED IN THIS PROJECT</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              All personal sounds and performance models currently placed onto arrangement tracks.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {usedAssets.length} Active Creator Assets
          </span>
        </div>

        <div className="space-y-3">
          {usedAssets.map((asset) => {
            const isPlaying = playingId === asset.id;
            return (
              <div
                key={asset.id}
                className="bg-[#040713] border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-bold text-slate-100">{asset.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${asset.trackColor}`}>
                      {asset.usedOnTrack}
                    </span>
                    <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      {asset.usageType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                    <span>Timeline: <strong className="text-slate-300">{asset.barLocation}</strong></span>
                    <span>•</span>
                    <span>Source: {asset.sourceCapture}</span>
                  </div>
                </div>

                {/* Actions: Locate in session, Preview, Replace, Inspect source, Open in My Sounds */}
                <div className="flex items-center space-x-1.5 shrink-0 text-xs">
                  <button
                    onClick={() => handleAudition(asset.id, asset.name.toLowerCase())}
                    className={`p-2 rounded-lg transition-colors ${
                      isPlaying
                        ? 'bg-sky-400 text-slate-950'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Audition Asset"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={() => {
                      if (onLocateInSession) onLocateInSession(asset);
                      showNotice(`Targeted "${asset.name}" on ${asset.usedOnTrack} at ${asset.barLocation}`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-sky-300 hover:border-sky-500/50 transition-colors"
                  >
                    Locate in Session
                  </button>

                  <button
                    onClick={() => {
                      const matched = allSounds.find((s) => s.id === asset.soundId);
                      if (matched) onInspectSound(matched);
                      else showNotice(`Inspecting provenance for ${asset.name}`);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-purple-300 hover:border-purple-500/50 transition-colors"
                  >
                    Inspect Source
                  </button>

                  <button
                    onClick={onOpenMySounds}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Open in My Sounds"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: RECENTLY CAPTURED FOR THIS PROJECT (Unplaced takes) */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-black text-slate-100 font-mono flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>RECENTLY CAPTURED (UNASSIGNED TAKES)</span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Recordings captured during the current project session that are awaiting timeline placement. Never lose an idea.
            </p>
          </div>
          <button
            onClick={onCaptureNewIdea}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Another</span>
          </button>
        </div>

        {recentlyCaptured.length === 0 ? (
          <div className="p-8 text-center bg-[#040713] rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
            All captured takes have been assigned to tracks. Click "Capture New Idea" to record a fresh pass.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recentlyCaptured.map((sound) => {
              const isPlaying = playingId === sound.id;
              return (
                <div
                  key={sound.id}
                  className="bg-[#040713] border border-slate-800 hover:border-slate-700 p-4 rounded-xl space-y-3 font-mono text-xs flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-amber-400 font-bold">
                        {sound.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{sound.duration}</span>
                    </div>
                    <div className="font-bold text-slate-100 truncate">{sound.name}</div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      Role: {sound.musicalRole}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleAudition(sound.id, sound.name.toLowerCase())}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isPlaying ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-slate-300'
                      }`}
                      title="Preview"
                    >
                      {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5 fill-current" />}
                    </button>

                    <button
                      onClick={() => {
                        onAddToSession(sound, 'Original Audio', 'playhead');
                        showNotice(`Added "${sound.name}" to ${projectName}!`);
                      }}
                      className="flex-1 px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold transition-colors"
                    >
                      + Add to Song
                    </button>

                    <button
                      onClick={() => handleDeleteRecent(sound.id)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Discard"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 3: SUGGESTED CREATOR ASSETS FOR NEON RAIN */}
      <div className="bg-[#070b1a] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-md">
        <div className="space-y-0.5">
          <h3 className="text-base font-black text-slate-100 font-mono flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>SUGGESTED FROM YOUR CREATOR ROOTS</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Personal sounds that align harmonically and rhythmically with <strong className="text-slate-200">{projectName} ({bpm} BPM · {keySignature})</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {suggestedSounds.map((sound) => (
            <div
              key={sound.id}
              className="bg-[#040713] border border-slate-800 hover:border-purple-500/40 p-4 rounded-xl space-y-3 font-mono text-xs flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-purple-950/40 border border-purple-800/40 text-purple-300 px-1.5 py-0.5 rounded">
                    Match: 92%
                  </span>
                  <span className="text-[10px] text-slate-500">{sound.duration}</span>
                </div>
                <div className="font-bold text-slate-100 truncate">{sound.name}</div>
                <div className="text-[10px] text-slate-400">
                  {sound.category} · {sound.musicalRole}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => onInspectSound(sound)}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px]"
                >
                  Inspect
                </button>
                <button
                  onClick={() => {
                    onAddToSession(sound, 'Loop', 'playhead');
                    showNotice(`Added "${sound.name}" to ${projectName}!`);
                  }}
                  className="flex-1 px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold transition-colors"
                >
                  + Add to {projectName}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
