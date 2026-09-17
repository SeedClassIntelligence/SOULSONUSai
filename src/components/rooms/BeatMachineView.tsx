import React, { useState } from 'react';
import {
  Disc3,
  Play,
  Square,
  Sparkles,
  Sliders,
  Plus,
  Layers,
  Volume2,
  Check,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface BeatMachineViewProps {
  onSendPatternToTrack: (patternName: string) => void;
}

export const BeatMachineView: React.FC<BeatMachineViewProps> = ({
  onSendPatternToTrack,
}) => {
  const [selectedKit, setSelectedKit] = useState<string>('Classic 808 Soul');
  const [swingAmount, setSwingAmount] = useState<number>(14); // ms
  const [humanizeAmount, setHumanizeAmount] = useState<number>(85); // %
  const [activePad, setActivePad] = useState<string | null>(null);

  // 16-step sequencer pattern matrix
  const [pattern, setPattern] = useState<{
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    clap: boolean[];
  }>({
    kick: [true, false, false, false, false, false, false, false, true, false, true, false, false, false, false, false],
    snare: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
    hihat: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false],
    clap: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
  });

  const pads = [
    { id: 'kick', label: '808 KICK', key: '1', sound: 'kick' as const, color: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300' },
    { id: 'snare', label: 'CRISP SNARE', key: '2', sound: 'snare' as const, color: 'border-pink-500/80 bg-pink-950/40 text-pink-300' },
    { id: 'hihat', label: 'CLOSED HAT', key: '3', sound: 'hihat' as const, color: 'border-amber-500/80 bg-amber-950/40 text-amber-300' },
    { id: 'clap', label: 'STUDIO CLAP', key: '4', sound: 'clap' as const, color: 'border-purple-500/80 bg-purple-950/40 text-purple-300' },
    { id: 'sub', label: 'SUB BASS 808', key: '5', sound: 'sub' as const, color: 'border-blue-500/80 bg-blue-950/40 text-blue-300' },
    { id: 'tom', label: 'GOSPEL TOM', key: '6', sound: 'tom' as const, color: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300' },
    { id: 'rim', label: 'WOOD RIMSHOT', key: '7', sound: 'rim' as const, color: 'border-orange-500/80 bg-orange-950/40 text-orange-300' },
    { id: 'perc', label: 'SHAKER PERC', key: '8', sound: 'perc' as const, color: 'border-indigo-500/80 bg-indigo-950/40 text-indigo-300' },
  ];

  const handlePadClick = (sound: any) => {
    setActivePad(sound);
    audioEngine.playDrum(sound);
    setTimeout(() => setActivePad(null), 120);
  };

  const toggleStep = (drum: 'kick' | 'snare' | 'hihat' | 'clap', stepIdx: number) => {
    setPattern((prev) => {
      const updated = [...prev[drum]];
      updated[stepIdx] = !updated[stepIdx];
      return { ...prev, [drum]: updated };
    });
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Disc3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              BEAT MACHINE · POCKET DRUM ENGINE
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Intentionally opened when wanted. Realistic MPC style pads, micro-timing swing, and direct drag-to-DAW.
            </p>
          </div>
        </div>

        {/* Kit Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-slate-400">KIT:</span>
          <select
            value={selectedKit}
            onChange={(e) => setSelectedKit(e.target.value)}
            className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono outline-none"
          >
            <option>Classic 808 Soul</option>
            <option>Vintage SP-1200 Pocket</option>
            <option>Gospel Live Acoustic Kit</option>
            <option>Neo-Soul Vinyl Beats</option>
          </select>
        </div>
      </div>

      {/* 8 Drum Pads Matrix */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span className="font-bold text-slate-300">VELOCITY SENSITIVE PADS</span>
          <span>Click to Audition / Trigger</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pads.map((pad) => {
            const isHit = activePad === pad.sound;
            return (
              <button
                key={pad.id}
                onClick={() => handlePadClick(pad.sound)}
                className={`h-20 rounded-xl border-2 p-3 flex flex-col justify-between transition-all cursor-pointer ${
                  pad.color
                } ${isHit ? 'scale-95 brightness-150 ring-2 ring-white' : 'hover:brightness-110 active:scale-95'}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-300">
                    PAD {pad.key}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-current opacity-60" />
                </div>
                <div className="font-mono text-xs font-extrabold tracking-wider text-left">
                  {pad.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 16-Step Sequencer Matrix */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-200">
            16-STEP GROOVE SEQUENCER
          </span>
          <div className="flex items-center space-x-3 text-[11px] font-mono text-slate-400">
            <span>SWING: <strong className="text-amber-400">+{swingAmount}ms</strong></span>
            <span>HUMANIZE: <strong className="text-emerald-400">{humanizeAmount}%</strong></span>
          </div>
        </div>

        {/* Step Grid */}
        <div className="space-y-2 font-mono text-xs">
          {(['kick', 'snare', 'hihat', 'clap'] as const).map((drum) => (
            <div key={drum} className="flex items-center space-x-2">
              <span className="w-16 uppercase text-[10px] font-bold text-slate-400 tracking-wider">
                {drum}
              </span>
              <div className="flex-1 grid grid-cols-16 gap-1">
                {pattern[drum].map((isActive, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleStep(drum, idx)}
                    className={`h-7 rounded transition-all cursor-pointer ${
                      isActive
                        ? drum === 'kick'
                          ? 'bg-cyan-500 shadow-sm'
                          : drum === 'snare'
                          ? 'bg-pink-500 shadow-sm'
                          : drum === 'hihat'
                          ? 'bg-amber-500 shadow-sm'
                          : 'bg-purple-500 shadow-sm'
                        : idx % 4 === 0
                        ? 'bg-slate-800 hover:bg-slate-700'
                        : 'bg-slate-950/60 hover:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Controls and Send to DAW */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span>Swing:</span>
              <input
                type="range"
                min={0}
                max={30}
                value={swingAmount}
                onChange={(e) => setSwingAmount(Number(e.target.value))}
                className="w-24 accent-amber-500 cursor-pointer"
              />
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
              <span>Humanize:</span>
              <input
                type="range"
                min={50}
                max={100}
                value={humanizeAmount}
                onChange={(e) => setHumanizeAmount(Number(e.target.value))}
                className="w-24 accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={() => onSendPatternToTrack(`${selectedKit} Pattern`)}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Send Pattern to Track 01 (Drums)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
