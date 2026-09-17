import React from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Maximize2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Track, AudioClip } from '../../types/soulsonus';

interface UnifiedDAWProps {
  tracks: Track[];
  currentBar: number;
  currentBeat: number;
  playheadSeconds: number;
  selectedTrackId: string;
  selectedClipId: string | null;
  onSelectTrack: (trackId: string) => void;
  onSelectClip: (clip: AudioClip, trackId: string) => void;
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onToggleArm: (trackId: string) => void;
  onChangeVolume: (trackId: string, volume: number) => void;
}

export const UnifiedDAW: React.FC<UnifiedDAWProps> = ({
  tracks,
  currentBar,
  currentBeat,
  playheadSeconds,
  selectedTrackId,
  selectedClipId,
  onSelectTrack,
  onSelectClip,
  onToggleMute,
  onToggleSolo,
  onToggleArm,
  onChangeVolume,
}) => {
  const TOTAL_BARS = 12;
  const barsArray = Array.from({ length: TOTAL_BARS }, (_, i) => i + 1);

  // Calculate playhead position percentage (12 bars total)
  const totalQuarterBeats = TOTAL_BARS * 4;
  const currentQuarterBeats = ((currentBar - 1) % TOTAL_BARS) * 4 + (currentBeat - 1);
  const playheadPercent = Math.min(100, (currentQuarterBeats / totalQuarterBeats) * 100);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 flex flex-col overflow-hidden select-none">
      {/* DAW Header */}
      <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-amber-500 tracking-wider">
            THE CONTROL ROOM · UNIFIED DAW
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400 text-[11px]">
            one project state · non-destructive · source preserved
          </span>
        </div>
        <div className="flex items-center space-x-3 text-slate-400 text-[11px]">
          <span>GRID: 1/16 NOTE</span>
          <span className="text-slate-600">·</span>
          <span>SNAP: ON</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-300 font-semibold font-mono">
            BAR {currentBar} : BEAT {currentBeat}
          </span>
        </div>
      </div>

      {/* Main Track Table */}
      <div className="flex flex-col relative overflow-x-auto">
        {/* Timeline Bar Header */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/50 text-[10px] font-mono text-slate-400 h-6 shrink-0">
          {/* Left Track Header space */}
          <div className="w-56 shrink-0 border-r border-slate-800 px-3 flex items-center justify-between">
            <span className="uppercase tracking-wider font-semibold">Tracks & Routing</span>
            <span className="text-slate-600">I/O</span>
          </div>

          {/* Bars ruler */}
          <div className="flex-1 flex relative">
            {barsArray.map((bar) => (
              <div
                key={bar}
                className="flex-1 border-r border-slate-800/50 px-1 flex items-center text-slate-400 text-[9px] font-mono"
              >
                <span>{bar}</span>
              </div>
            ))}

            {/* Playhead vertical line on timeline ruler */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-amber-500 z-30 pointer-events-none transition-all duration-75"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="w-2.5 h-2.5 bg-amber-500 rounded-full -ml-[4px] -mt-[3px] shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="relative divide-y divide-slate-800/70">
          {/* Global playhead line across all tracks */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-amber-500/80 z-20 pointer-events-none transition-all duration-75"
            style={{ left: `calc(14rem + (100% - 14rem) * ${playheadPercent / 100})` }}
          />

          {tracks.map((track) => {
            const isSelected = selectedTrackId === track.id;
            return (
              <div
                key={track.id}
                onClick={() => onSelectTrack(track.id)}
                className={`flex h-14 transition-colors ${
                  isSelected ? 'bg-slate-900/60' : 'hover:bg-slate-900/30'
                }`}
              >
                {/* Track Controls & Header Column */}
                <div className="w-56 shrink-0 border-r border-slate-800 p-2 flex flex-col justify-between bg-slate-900/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {track.number} ·
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200 truncate">
                        {track.name}
                      </span>
                      {track.armed && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </div>

                    {/* M / S / Arm buttons */}
                    <div className="flex items-center space-x-1 font-mono text-[9px] font-bold">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleMute(track.id);
                        }}
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                          track.muted
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Mute"
                      >
                        M
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSolo(track.id);
                        }}
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                          track.soloed
                            ? 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title="Solo"
                      >
                        S
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleArm(track.id);
                        }}
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                          track.armed
                            ? 'bg-rose-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-rose-400'
                        }`}
                        title="Record Arm"
                      >
                        ●
                      </button>
                    </div>
                  </div>

                  {/* Subtitle & Volume */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="truncate">{track.subtitle}</span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>
                </div>

                {/* Track Timeline Lane */}
                <div className="flex-1 relative flex items-center px-1">
                  {/* Grid background markers */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {barsArray.map((b) => (
                      <div key={b} className="flex-1 border-r border-slate-800/30" />
                    ))}
                  </div>

                  {/* Track Clips */}
                  {track.clips.map((clip) => {
                    // Position based on startBar and lengthBars
                    const leftPct = ((clip.startBar - 1) / TOTAL_BARS) * 100;
                    const widthPct = (clip.lengthBars / TOTAL_BARS) * 100;
                    const isClipSelected = selectedClipId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectClip(clip, track.id);
                        }}
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        className={`absolute h-10 rounded-md border flex flex-col justify-between px-2 py-1 shadow-sm transition-all cursor-pointer group ${
                          isClipSelected
                            ? 'ring-2 ring-amber-400 z-10 brightness-110'
                            : 'hover:brightness-105'
                        }`}
                      >
                        {/* Background tint based on clip.color */}
                        <div
                          className="absolute inset-0 rounded-md opacity-25"
                          style={{ backgroundColor: clip.color }}
                        />
                        <div
                          className="absolute inset-0 rounded-md border"
                          style={{ borderColor: clip.color }}
                        />

                        {/* Clip Title */}
                        <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold text-slate-100 truncate">
                          <span className="truncate">{clip.name}</span>
                          {clip.isCreatorOrigin && (
                            <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded border border-amber-500/30 shrink-0 ml-1">
                              ORIGIN
                            </span>
                          )}
                        </div>

                        {/* Waveform / notes preview */}
                        <div className="relative z-10 flex items-center h-4 space-x-[2px] opacity-75">
                          {clip.waveformPoints ? (
                            clip.waveformPoints.map((pt, idx) => (
                              <div
                                key={idx}
                                style={{ height: `${Math.max(3, pt * 14)}px` }}
                                className="w-1 bg-slate-200/80 rounded-full"
                              />
                            ))
                          ) : (
                            <div className="text-[9px] font-mono text-slate-300/80 truncate">
                              {clip.notesSummary || 'MIDI Performance Region'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
