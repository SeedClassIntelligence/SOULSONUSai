import React, { useState } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  RotateCw,
  Repeat,
  Sparkles,
  Cpu,
  FolderKanban,
  History,
  Download,
  Sliders,
  Volume2,
  Compass,
  BookOpen,
  ChevronDown,
  Music2,
  FileArchive,
} from 'lucide-react';
import { ProjectMetadata } from '../../types/soulsonus';

interface StudioTopBarProps {
  metadata: ProjectMetadata;
  isPlaying: boolean;
  isRecording: boolean;
  playheadTime: string;
  isMetroOn: boolean;
  onTogglePlay: () => void;
  onStop: () => void;
  onToggleRecord: () => void;
  onToggleMetro: () => void;
  onOpenLobby: () => void;
  onOpenHistory: () => void;
  onOpenRegistry: () => void;
  onOpenIntelligence: () => void;
  onOpenRelease: () => void;
  onOpenPianoRoll?: () => void;
  onOpenStemExport?: () => void;
  onUpdateProjectName: (name: string) => void;
  onUpdateBpm: (bpm: number) => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  metadata,
  isPlaying,
  isRecording,
  playheadTime,
  isMetroOn,
  onTogglePlay,
  onStop,
  onToggleRecord,
  onToggleMetro,
  onOpenLobby,
  onOpenHistory,
  onOpenRegistry,
  onOpenIntelligence,
  onOpenRelease,
  onOpenPianoRoll,
  onOpenStemExport,
  onUpdateProjectName,
  onUpdateBpm,
}) => {
  const [isLoopOn, setIsLoopOn] = useState(true);
  const [keyOffset, setKeyOffset] = useState(0);
  const [octaveOffset, setOctaveOffset] = useState(0);
  const [gridValue, setGridValue] = useState('1/16');

  return (
    <header className="h-14 bg-[#070b14] border-b border-slate-800/80 px-3 flex items-center justify-between shrink-0 select-none text-slate-100 font-sans">
      {/* 1. Left Section: Logo + STORY / HOME + Project Selector */}
      <div className="flex items-center space-x-3">
        {/* Circular [S] Logo */}
        <div
          onClick={onOpenLobby}
          className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-[1.5px] cursor-pointer shadow-md flex items-center justify-center shrink-0"
        >
          <div className="w-full h-full bg-[#070b14] rounded-full flex items-center justify-center font-black text-amber-500 text-xs">
            S
          </div>
        </div>

        {/* Brand Text */}
        <div
          onClick={onOpenLobby}
          className="font-black tracking-wider text-sm text-slate-100 cursor-pointer hover:text-amber-400 transition-colors hidden sm:block font-mono"
        >
          SOULSONUS
        </div>

        {/* ✦ STORY / HOME */}
        <button
          onClick={onOpenLobby}
          className="hidden md:flex items-center space-x-1 px-2 py-1 rounded bg-[#0b1220] border border-amber-500/40 text-[10px] font-mono font-bold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>STORY / HOME</span>
        </button>

        {/* Project Selector Dropdown */}
        <div className="relative">
          <button
            onClick={onOpenLobby}
            className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0e1628] border border-slate-700/80 hover:border-slate-500 text-xs font-mono font-bold text-slate-200 transition-all cursor-pointer"
          >
            <span>{metadata.name || 'Blank Canvas (Record Live)'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. Center Section: Transport Controls & Metrology */}
      <div className="flex items-center space-x-2 font-mono text-xs">
        {/* Undo / Redo */}
        <button
          title="Undo"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          title="Redo"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Play / Stop */}
        <button
          onClick={onTogglePlay}
          className={`p-1.5 rounded transition-all cursor-pointer ${
            isPlaying
              ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_#06b6d4]'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
        </button>

        <button
          onClick={onStop}
          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          title="Stop"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
        </button>

        {/* LOOP */}
        <button
          onClick={() => setIsLoopOn(!isLoopOn)}
          className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors flex items-center space-x-1 cursor-pointer ${
            isLoopOn
              ? 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40'
              : 'bg-slate-900 text-slate-500 border-slate-800'
          }`}
        >
          <Repeat className="w-3 h-3" />
          <span className="hidden sm:inline">LOOP</span>
        </button>

        {/* Timecode in Gold Pill */}
        <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/40 text-amber-400 font-black tracking-wider text-xs shadow-inner">
          {playheadTime || '1:01.1'}
        </div>

        {/* BPM Selector */}
        <div className="flex items-center space-x-1 px-2 py-1 rounded bg-[#0b1220] border border-slate-800 text-[11px]">
          <span className="text-slate-500 font-semibold">BPM</span>
          <span className="font-bold text-slate-100">{metadata.bpm || 120}</span>
        </div>

        <button
          onClick={() => onUpdateBpm(metadata.bpm === 120 ? 110 : 120)}
          className="px-1.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-bold cursor-pointer"
        >
          TAP
        </button>

        {/* Key & Scale */}
        <div className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded bg-[#0b1220] border border-slate-800 text-[11px]">
          <span className="text-slate-500 font-semibold">KEY</span>
          <span className="font-bold text-cyan-400">{metadata.key || 'C MIN'}</span>
          <button
            onClick={() => setKeyOffset((k) => k - 1)}
            className="px-1 py-0.2 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-slate-400 hover:text-white"
          >
            -1
          </button>
          <button
            onClick={() => setKeyOffset((k) => k + 1)}
            className="px-1 py-0.2 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-slate-400 hover:text-white"
          >
            +1
          </button>
          <button
            onClick={() => setOctaveOffset((o) => o - 1)}
            className="px-1 py-0.2 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-slate-400 hover:text-white"
          >
            -8ve
          </button>
          <button
            onClick={() => setOctaveOffset((o) => o + 1)}
            className="px-1 py-0.2 bg-slate-800 hover:bg-slate-700 rounded text-[9px] text-slate-400 hover:text-white"
          >
            +8ve
          </button>
        </div>

        {/* Time Signature */}
        <div className="hidden md:flex items-center space-x-1 px-2 py-1 rounded bg-[#0b1220] border border-slate-800 text-[11px]">
          <span className="text-slate-500 font-semibold">SIG</span>
          <span className="font-bold text-slate-100">{metadata.timeSignature || '4/4'}</span>
        </div>
      </div>

      {/* 3. Right Section: Utility buttons */}
      <div className="flex items-center space-x-2 font-mono text-xs">
        {/* PROJECTS */}
        <button
          onClick={onOpenLobby}
          className="hidden sm:flex items-center space-x-1 px-2 py-1 rounded bg-[#0b1220] border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
        >
          <FolderKanban className="w-3.5 h-3.5 text-cyan-400" />
          <span>PROJECTS</span>
        </button>

        {/* HISTORY */}
        <button
          onClick={onOpenHistory}
          className="hidden md:flex items-center space-x-1 px-2 py-1 rounded bg-[#0b1220] border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-bold cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>HISTORY {metadata.revision || 0}</span>
        </button>

        {/* AI ENGINES 2/4 */}
        <button
          onClick={onOpenRegistry}
          className="flex items-center space-x-1 px-2 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[11px] font-bold cursor-pointer hover:border-purple-400"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>AI ENGINES 2/4</span>
        </button>

        {/* STUDIO TOUR */}
        <button
          onClick={onOpenIntelligence}
          className="hidden xl:flex items-center space-x-1 px-2 py-1 rounded bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px] font-bold cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>STUDIO TOUR</span>
        </button>

        {/* MANUAL */}
        <button
          onClick={onOpenIntelligence}
          className="hidden xl:flex items-center space-x-1 px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>MANUAL</span>
        </button>

        {/* PIANO ROLL */}
        {onOpenPianoRoll && (
          <button
            onClick={onOpenPianoRoll}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:border-indigo-400 text-[11px] font-bold cursor-pointer"
            title="Open Interactive MIDI Piano Roll Editor"
          >
            <Music2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>PIANO ROLL</span>
          </button>
        )}

        {/* STEMS .ZIP */}
        {onOpenStemExport && (
          <button
            onClick={onOpenStemExport}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:border-purple-400 text-[11px] font-bold cursor-pointer"
            title="Export 24-bit 48kHz WAV Stems & MIDI Zip Archive"
          >
            <FileArchive className="w-3.5 h-3.5 text-purple-400" />
            <span>STEMS .ZIP</span>
          </button>
        )}

        {/* EXPORT Solid Gold Button */}
        <button
          onClick={onOpenRelease}
          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs font-mono shadow-md transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>EXPORT</span>
        </button>

        {/* METRO & GRID Sub-controls */}
        <div className="hidden lg:flex items-center space-x-1.5 pl-1.5 border-l border-slate-800 text-[10px] text-slate-400">
          <button
            onClick={onToggleMetro}
            className={`px-1.5 py-0.5 rounded cursor-pointer ${
              isMetroOn ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            {isMetroOn ? 'METRO ON' : 'METRO OFF'}
          </button>
          <span className="text-slate-400">GRID {gridValue}</span>
        </div>
      </div>
    </header>
  );
};
