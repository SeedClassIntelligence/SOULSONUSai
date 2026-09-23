import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Sliders,
  Activity,
  Volume2,
  VolumeX,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Gauge,
  Layers,
  Zap,
  BarChart2,
  Eye,
  Settings2,
  FileArchive,
} from 'lucide-react';
import { Track } from '../../types/soulsonus';
import { audioEngine } from '../../services/audioEngine';

interface MixRoomViewProps {
  tracks: Track[];
  onToggleMute: (trackId: string) => void;
  onToggleSolo: (trackId: string) => void;
  onChangeVolume: (trackId: string, vol: number) => void;
  onProposeChangeSet: (prompt: string) => void;
  onOpenStemExport?: () => void;
}

interface ChannelStripState {
  id: string;
  chNum: number;
  name: string;
  color: string;
  category: string;
  inserts: { name: string; active: boolean }[];
  reverbSend: number; // 0 to 100
  delaySend: number; // 0 to 100
  pan: number; // -50 to 50
  solo: boolean;
  mute: boolean;
  arm: boolean;
  faderDb: number; // -60 to +6
  volume: number; // 0 to 1
  levelPeak: number; // 0 to 100 meter level
}

interface BusStripState {
  id: string;
  name: string;
  tracksSummed: number;
  inserts: { name: string; active: boolean }[];
  faderDb: number;
  meterLeft: number;
  meterRight: number;
}

export const MixRoomView: React.FC<MixRoomViewProps> = ({
  tracks,
  onToggleMute,
  onToggleSolo,
  onChangeVolume,
  onProposeChangeSet,
  onOpenStemExport,
}) => {
  // Master Desk states
  const [dimActive, setDimActive] = useState(false);
  const [bypassDsp, setBypassDsp] = useState(false);
  const [auditionMix, setAuditionMix] = useState<'A' | 'B'>('B');

  // Channel strips state (8 channels matching screenshot)
  const [channelStrips, setChannelStrips] = useState<ChannelStripState[]>([
    {
      id: 'ch_1',
      chNum: 1,
      name: 'Kick (Thump)',
      color: '#f59e0b', // amber / orange
      category: 'KICK',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: true },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 15,
      delaySend: 5,
      pan: 0,
      solo: false,
      mute: false,
      arm: false,
      faderDb: 0,
      volume: 0.85,
      levelPeak: 76,
    },
    {
      id: 'ch_2',
      chNum: 2,
      name: 'Snare (Pop)',
      color: '#06b6d4', // cyan
      category: 'SNARE',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: true },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 42,
      delaySend: 18,
      pan: 0,
      solo: false,
      mute: false,
      arm: false,
      faderDb: 0,
      volume: 0.85,
      levelPeak: 72,
    },
    {
      id: 'ch_3',
      chNum: 3,
      name: 'Hi-Hat (Tss)',
      color: '#14b8a6', // teal
      category: 'HIHAT',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: false },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 20,
      delaySend: 35,
      pan: -15,
      solo: false,
      mute: false,
      arm: false,
      faderDb: -4,
      volume: 0.72,
      levelPeak: 58,
    },
    {
      id: 'ch_4',
      chNum: 4,
      name: '808 / Bass',
      color: '#f43f5e', // red/pink
      category: 'BASS',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: true },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 5,
      delaySend: 0,
      pan: 0,
      solo: false,
      mute: false,
      arm: false,
      faderDb: -2,
      volume: 0.8,
      levelPeak: 82,
    },
    {
      id: 'ch_5',
      chNum: 5,
      name: 'Melody / Synth',
      color: '#a855f7', // purple
      category: 'MELODY',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: true },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 55,
      delaySend: 40,
      pan: 20,
      solo: false,
      mute: false,
      arm: false,
      faderDb: -2,
      volume: 0.78,
      levelPeak: 64,
    },
    {
      id: 'ch_6',
      chNum: 6,
      name: 'Strings',
      color: '#3b82f6', // blue
      category: 'MELODY',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: true },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 65,
      delaySend: 25,
      pan: -25,
      solo: false,
      mute: false,
      arm: false,
      faderDb: -4,
      volume: 0.7,
      levelPeak: 60,
    },
    {
      id: 'ch_7',
      chNum: 7,
      name: 'Lead Vocal',
      color: '#ec4899', // pink/magenta
      category: 'VOCAL_SYNTH',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: true },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 48,
      delaySend: 30,
      pan: 0,
      solo: false,
      mute: false,
      arm: true,
      faderDb: 0,
      volume: 0.9,
      levelPeak: 84,
    },
    {
      id: 'ch_8',
      chNum: 8,
      name: 'Harmony',
      color: '#06b6d4', // cyan
      category: 'VOCAL_SYNTH',
      inserts: [
        { name: '1. 4-Band EQ', active: true },
        { name: '2. Comp (4:1)', active: true },
        { name: '3. Character Filter', active: true },
      ],
      reverbSend: 50,
      delaySend: 45,
      pan: 15,
      solo: false,
      mute: false,
      arm: false,
      faderDb: -3,
      volume: 0.75,
      levelPeak: 66,
    },
  ]);

  // Summing Busses state
  const [busses, setBusses] = useState<BusStripState[]>([
    {
      id: 'bus_drum',
      name: 'Drum Bus',
      tracksSummed: 3,
      inserts: [
        { name: 'VCA Drum Glue Comp', active: true },
        { name: 'Tape Warmth', active: true },
      ],
      faderDb: 0,
      meterLeft: 78,
      meterRight: 75,
    },
    {
      id: 'bus_vocal',
      name: 'Vocal Bus',
      tracksSummed: 2,
      inserts: [
        { name: 'Opto Vocal Leveler', active: true },
        { name: 'Presence & Air Shelf', active: true },
      ],
      faderDb: 0,
      meterLeft: 82,
      meterRight: 80,
    },
    {
      id: 'bus_music',
      name: 'Music Bus',
      tracksSummed: 3,
      inserts: [
        { name: 'Mid/Side EQ', active: true },
        { name: 'Stereo Imager', active: true },
      ],
      faderDb: 0,
      meterLeft: 70,
      meterRight: 72,
    },
  ]);

  // Focused channel for bottom inspector
  const [focusedChannelId, setFocusedChannelId] = useState<string>('ch_1');
  const focusedChannel = channelStrips.find((c) => c.id === focusedChannelId) || channelStrips[0];

  // Channel Inspector view tabs: 4-BAND EQ, DYNAMICS, INSERTS, WAVEFORM
  const [inspectorTab, setInspectorTab] = useState<'4-BAND EQ' | 'DYNAMICS' | 'INSERTS' | 'WAVEFORM'>('4-BAND EQ');

  // EQ Parameters for focused channel
  const [eqParams, setEqParams] = useState<Record<string, { low: number; mid: number; high: number }>>({
    ch_1: { low: 0, mid: 0, high: 0 },
    ch_2: { low: 0, mid: 0, high: 0 },
    ch_3: { low: 0, mid: 0, high: 0 },
    ch_4: { low: 0, mid: 0, high: 0 },
    ch_5: { low: 0, mid: 0, high: 0 },
    ch_6: { low: 0, mid: 0, high: 0 },
    ch_7: { low: 0, mid: 0, high: 0 },
    ch_8: { low: 0, mid: 0, high: 0 },
  });

  const currentEq = eqParams[focusedChannelId] || { low: 0, mid: 0, high: 0 };

  // Co-Engineer suite states
  const [coEngineerTab, setCoEngineerTab] = useState<'AI ADVISOR' | 'METERS' | 'REFERENCE' | 'SCENES'>('AI ADVISOR');
  const [hasAnalysed, setHasAnalysed] = useState<boolean>(false);
  const [isAnalysing, setIsAnalysing] = useState<boolean>(false);

  // Meter oscillation effect to make console feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      setChannelStrips((prev) =>
        prev.map((ch) => {
          const delta = (Math.random() - 0.5) * 8;
          const nextPeak = Math.max(15, Math.min(95, ch.levelPeak + delta));
          return { ...ch, levelPeak: Math.round(nextPeak) };
        })
      );
      setBusses((prev) =>
        prev.map((b) => {
          const deltaL = (Math.random() - 0.5) * 6;
          const deltaR = (Math.random() - 0.5) * 6;
          return {
            ...b,
            meterLeft: Math.round(Math.max(20, Math.min(94, b.meterLeft + deltaL))),
            meterRight: Math.round(Math.max(20, Math.min(94, b.meterRight + deltaR))),
          };
        })
      );
    }, 280);
    return () => clearInterval(interval);
  }, []);

  const handleFocus = (chId: string) => {
    setFocusedChannelId(chId);
  };

  const handleToggleChannelMute = (chId: string) => {
    setChannelStrips((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, mute: !c.mute } : c))
    );
    // sync with master track if mapped
    const track = tracks.find((t) => t.id === chId);
    if (track) onToggleMute(track.id);
  };

  const handleToggleChannelSolo = (chId: string) => {
    setChannelStrips((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, solo: !c.solo } : c))
    );
    const track = tracks.find((t) => t.id === chId);
    if (track) onToggleSolo(track.id);
  };

  const handleToggleChannelArm = (chId: string) => {
    setChannelStrips((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, arm: !c.arm } : c))
    );
  };

  const handleFaderChange = (chId: string, valDb: number) => {
    setChannelStrips((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, faderDb: valDb } : c))
    );
    const normVol = Math.max(0, Math.min(1, (valDb + 30) / 36));
    const track = tracks.find((t) => t.id === chId);
    if (track) onChangeVolume(track.id, normVol);
  };

  const handlePanChange = (chId: string, panVal: number) => {
    setChannelStrips((prev) =>
      prev.map((c) => (c.id === chId ? { ...c, pan: panVal } : c))
    );
  };

  const handleInsertToggle = (chId: string, insertIdx: number) => {
    setChannelStrips((prev) =>
      prev.map((c) => {
        if (c.id === chId) {
          const nextInserts = [...c.inserts];
          nextInserts[insertIdx] = {
            ...nextInserts[insertIdx],
            active: !nextInserts[insertIdx].active,
          };
          return { ...c, inserts: nextInserts };
        }
        return c;
      })
    );
  };

  const handleEqChange = (band: 'low' | 'mid' | 'high', val: number) => {
    setEqParams((prev) => ({
      ...prev,
      [focusedChannelId]: {
        ...(prev[focusedChannelId] || { low: 0, mid: 0, high: 0 }),
        [band]: val,
      },
    }));
  };

  const handleAnalyseMix = () => {
    setIsAnalysing(true);
    audioEngine.playNote(880, 'sine', 0.15);
    setTimeout(() => {
      audioEngine.playNote(1320, 'sine', 0.15);
    }, 150);

    setTimeout(() => {
      setIsAnalysing(false);
      setHasAnalysed(true);
    }, 1200);
  };

  // Generate SVG curve points based on EQ sliders
  const getEqPath = () => {
    const lowOffset = currentEq.low * 2.5; // -30 to +30
    const midOffset = currentEq.mid * 2.5;
    const highOffset = currentEq.high * 2.5;

    const p1 = `10,${45 - lowOffset}`;
    const p2 = `120,${45 - lowOffset * 0.8}`;
    const p3 = `260,${45 - midOffset}`;
    const p4 = `420,${45 - highOffset * 0.6}`;
    const p5 = `590,${45 - highOffset}`;

    return `M 0,${45 - lowOffset} C 80,${45 - lowOffset} 180,${45 - midOffset} 260,${45 - midOffset} S 460,${45 - highOffset} 600,${45 - highOffset}`;
  };

  return (
    <div className="bg-[#070b14] text-slate-100 rounded-xl border border-slate-800/90 shadow-2xl p-4 space-y-4 font-sans select-none">
      {/* 1. Multichannel Mixing Console Desk Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5 text-xs font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span className="font-bold text-slate-100 tracking-wider">
            MULTICHANNEL MIXING CONSOLE DESK
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            32-BIT FLOATING DSP
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            24 PPQN CLOCK SYNC
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-400 hidden md:inline text-[11px]">
            DYNAMIC BUS SUMMING
          </span>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setDimActive(!dimActive)}
            className={`px-3 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
              dimActive
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            DIM (-20dB)
          </button>
          <button
            onClick={() => setBypassDsp(!bypassDsp)}
            className={`px-3 py-1 rounded text-[11px] font-bold border transition-all cursor-pointer ${
              bypassDsp
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_8px_rgba(244,63,94,0.2)]'
                : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            BYPASS DSP
          </button>
          <button
            onClick={() => setAuditionMix(auditionMix === 'A' ? 'B' : 'A')}
            className="px-3 py-1 rounded text-[11px] font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>AUDITION: ACTIVE MIX ({auditionMix})</span>
          </button>
          {onOpenStemExport && (
            <button
              onClick={onOpenStemExport}
              className="px-3 py-1 rounded text-[11px] font-bold bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/50 hover:border-purple-400 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <FileArchive className="w-3.5 h-3.5 text-purple-400" />
              <span>EXPORT STEMS (.ZIP)</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Channel Strips + Summing Busses Rack */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="flex items-stretch gap-2.5 min-w-[1080px]">
          {/* 8 Track Channel Strips */}
          {channelStrips.map((ch) => {
            const isFocused = ch.id === focusedChannelId;
            return (
              <div
                key={ch.id}
                className={`w-[118px] shrink-0 rounded-lg p-2.5 flex flex-col justify-between space-y-2.5 transition-all ${
                  isFocused
                    ? 'bg-[#0f182c] border border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                    : 'bg-[#0b1220]/90 border border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Header: Title + Dot */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-400 font-bold">CH {ch.chNum}</span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: ch.color }}
                    />
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-100 truncate">
                    {ch.name}
                  </div>

                  {/* Category + FOCUS Button */}
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-900/60 uppercase">
                      {ch.category}
                    </span>
                    <button
                      onClick={() => handleFocus(ch.id)}
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border transition-all cursor-pointer ${
                        isFocused
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      FOCUS
                    </button>
                  </div>
                </div>

                {/* INSERTS (6 slots) */}
                <div className="bg-[#070b14] rounded border border-slate-800/80 p-1.5 space-y-1 font-mono text-[9px]">
                  <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800/80 pb-0.5">
                    <span>INSERTS</span>
                    <span className="text-slate-400 text-[8px]">6 SLOTS</span>
                  </div>
                  {ch.inserts.map((ins, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleInsertToggle(ch.id, idx)}
                      className="flex items-center justify-between text-slate-300 hover:text-slate-100 cursor-pointer"
                    >
                      <span className="truncate">{ins.name}</span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          ins.active
                            ? 'bg-cyan-400 shadow-[0_0_4px_#06b6d4]'
                            : 'bg-slate-700'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* AUX SENDS */}
                <div className="bg-[#070b14] rounded border border-slate-800/80 p-1.5 space-y-1 font-mono text-[9px]">
                  <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800/80 pb-0.5">
                    <span>AUX SENDS</span>
                    <span className="text-slate-400 text-[8px]">POST</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">S1 Reverb</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={ch.reverbSend}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setChannelStrips((prev) =>
                            prev.map((c) =>
                              c.id === ch.id ? { ...c, reverbSend: v } : c
                            )
                          );
                        }}
                        className="w-12 h-1 accent-amber-500 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">S2 Delay</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={ch.delaySend}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setChannelStrips((prev) =>
                            prev.map((c) =>
                              c.id === ch.id ? { ...c, delaySend: v } : c
                            )
                          );
                        }}
                        className="w-12 h-1 accent-purple-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* PAN */}
                <div className="space-y-0.5 font-mono text-[9px]">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>PAN</span>
                    <span className="text-amber-400 font-bold">
                      {ch.pan === 0
                        ? 'C'
                        : ch.pan < 0
                        ? `L${Math.abs(ch.pan)}`
                        : `R${ch.pan}`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-50}
                    max={50}
                    value={ch.pan}
                    onChange={(e) => handlePanChange(ch.id, Number(e.target.value))}
                    className="w-full h-1 accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Controls: Solo, Mute, Arm, Automation */}
                <div className="grid grid-cols-4 gap-1 font-mono text-[9px] font-bold">
                  <button
                    onClick={() => handleToggleChannelSolo(ch.id)}
                    className={`py-1 rounded border transition-colors cursor-pointer ${
                      ch.solo
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={() => handleToggleChannelMute(ch.id)}
                    className={`py-1 rounded border transition-colors cursor-pointer ${
                      ch.mute
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-sm'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => handleToggleChannelArm(ch.id)}
                    className={`py-1 rounded border transition-colors cursor-pointer ${
                      ch.arm
                        ? 'bg-rose-600 text-white border-rose-500 font-black shadow-sm animate-pulse'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    ARM
                  </button>
                  <button
                    title="SeedSignature Track Lock"
                    className="py-1 rounded border bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-400 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  </button>
                </div>

                {/* Long Vertical Fader + Peak Meter */}
                <div className="h-44 bg-[#070b14] rounded-lg border border-slate-800/90 p-2 flex items-center justify-center space-x-3">
                  {/* Fader slider container */}
                  <div className="relative h-36 w-6 flex items-center justify-center">
                    {/* Dark recessed center slot */}
                    <div className="absolute top-0 bottom-0 w-1.5 bg-slate-950 rounded-full border border-slate-800 shadow-inner" />

                    {/* Range input rotated */}
                    <input
                      type="range"
                      min={-36}
                      max={6}
                      step={0.5}
                      value={ch.faderDb}
                      onChange={(e) => handleFaderChange(ch.id, Number(e.target.value))}
                      style={{
                        transform: 'rotate(-90deg)',
                        width: '136px',
                      }}
                      className="absolute accent-cyan-400 cursor-pointer opacity-90 hover:opacity-100"
                    />
                  </div>

                  {/* Multi-segment LED Peak Meter */}
                  <div className="h-36 w-2.5 bg-slate-950 rounded border border-slate-800/80 p-[1px] flex flex-col justify-end overflow-hidden">
                    <div
                      style={{ height: `${ch.levelPeak}%` }}
                      className="w-full bg-gradient-to-t from-emerald-500 via-yellow-400 to-rose-500 rounded-sm transition-all duration-150"
                    />
                  </div>
                </div>

                {/* dB Readout */}
                <div className="text-center font-mono text-[11px] font-bold text-slate-200 bg-[#070b14] py-0.5 rounded border border-slate-800/60">
                  {ch.faderDb > 0 ? `+${ch.faderDb}` : ch.faderDb}dB
                </div>
              </div>
            );
          })}

          {/* Summing Busses on Right */}
          {busses.map((bus) => (
            <div
              key={bus.id}
              className="w-[124px] shrink-0 rounded-lg p-2.5 flex flex-col justify-between space-y-2.5 bg-[#120d20]/80 border border-purple-900/60 shadow-lg"
            >
              {/* Bus Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-purple-400 font-bold">BUS</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#a855f7]" />
                </div>
                <div className="font-mono text-xs font-bold text-slate-100 truncate">
                  {bus.name}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {bus.tracksSummed} Tracks Summed
                </div>
              </div>

              {/* BUS INSERTS */}
              <div className="bg-[#070b14] rounded border border-purple-900/50 p-1.5 space-y-1 font-mono text-[9px]">
                <div className="text-purple-300 font-bold border-b border-slate-800/80 pb-0.5">
                  BUS INSERTS
                </div>
                {bus.inserts.map((ins, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-slate-300"
                  >
                    <span className="truncate">{ins.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_4px_#a855f7] shrink-0" />
                  </div>
                ))}
              </div>

              {/* Fader + Dual Stereo Meter */}
              <div className="h-44 bg-[#070b14] rounded-lg border border-purple-900/40 p-2 flex items-center justify-center space-x-2.5">
                {/* Fader track */}
                <div className="relative h-36 w-6 flex items-center justify-center">
                  <div className="absolute top-0 bottom-0 w-1.5 bg-slate-950 rounded-full border border-slate-800" />
                  <input
                    type="range"
                    min={-36}
                    max={6}
                    step={0.5}
                    value={bus.faderDb}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setBusses((prev) =>
                        prev.map((b) => (b.id === bus.id ? { ...b, faderDb: v } : b))
                      );
                    }}
                    style={{
                      transform: 'rotate(-90deg)',
                      width: '136px',
                    }}
                    className="absolute accent-purple-500 cursor-pointer"
                  />
                </div>

                {/* Dual Stereo Meter */}
                <div className="flex space-x-1 h-36">
                  <div className="w-2 bg-slate-950 rounded border border-slate-800 p-[1px] flex flex-col justify-end overflow-hidden">
                    <div
                      style={{ height: `${bus.meterLeft}%` }}
                      className="w-full bg-gradient-to-t from-purple-500 via-cyan-400 to-rose-500 rounded-sm transition-all duration-150"
                    />
                  </div>
                  <div className="w-2 bg-slate-950 rounded border border-slate-800 p-[1px] flex flex-col justify-end overflow-hidden">
                    <div
                      style={{ height: `${bus.meterRight}%` }}
                      className="w-full bg-gradient-to-t from-purple-500 via-cyan-400 to-rose-500 rounded-sm transition-all duration-150"
                    />
                  </div>
                </div>
              </div>

              {/* Readout */}
              <div className="text-center font-mono text-[11px] font-bold text-purple-300 bg-[#070b14] py-0.5 rounded border border-purple-900/50">
                {bus.faderDb > 0 ? `+${bus.faderDb}` : bus.faderDb}dB
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bottom Split Section: Left (Channel Focus Inspector) & Right (Co-Engineer Suite) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT CARD: Channel Focus Inspector */}
        <div className="bg-[#0b1220] rounded-xl border border-slate-800/90 p-4 space-y-3.5 shadow-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: focusedChannel.color }}
                />
                <span className="font-mono text-xs font-black uppercase text-slate-100 tracking-wider">
                  {focusedChannel.name}
                </span>
                <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-1.5 py-0.2 rounded uppercase">
                  {focusedChannel.category} FOCUS
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                4-Band Parametric EQ Graph • Dynamic RTA • Modular Inserts • Dual-View Waveform
              </p>
            </div>

            {/* Switcher Pills */}
            <div className="flex items-center space-x-1 font-mono text-[10px]">
              {(['4-BAND EQ', 'DYNAMICS', 'INSERTS', 'WAVEFORM'] as const).map(
                (tab) => {
                  const isActive = inspectorTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setInspectorTab(tab)}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* 4-Band EQ Mode View */}
          {inspectorTab === '4-BAND EQ' && (
            <div className="space-y-3">
              {/* Interactive SVG Parametric EQ Graph */}
              <div className="h-32 bg-[#070b14] rounded-lg border border-slate-800 relative overflow-hidden flex flex-col justify-between p-2">
                {/* Frequency grid lines with labels */}
                <div className="absolute inset-0 flex justify-between px-6 py-2 pointer-events-none opacity-25">
                  <div className="border-r border-slate-600 h-full text-[9px] font-mono text-slate-400">
                    100 Hz
                  </div>
                  <div className="border-r border-slate-600 h-full text-[9px] font-mono text-slate-400">
                    500 Hz
                  </div>
                  <div className="border-r border-slate-600 h-full text-[9px] font-mono text-slate-400">
                    2 kHz
                  </div>
                  <div className="border-r border-slate-600 h-full text-[9px] font-mono text-slate-400">
                    8 kHz
                  </div>
                  <div className="text-[9px] font-mono text-slate-400">20 kHz</div>
                </div>

                {/* Horizontal center 0dB reference line */}
                <div className="absolute inset-x-0 top-1/2 border-b border-slate-700/60 pointer-events-none" />

                {/* SVG Curve with glowing cyan stroke & fill */}
                <svg
                  className="w-full h-full overflow-visible z-10"
                  viewBox="0 0 600 90"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="eqGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Fill area beneath curve */}
                  <path
                    d={`${getEqPath()} L 600,90 L 0,90 Z`}
                    fill="url(#eqGradient)"
                  />
                  {/* Glowing line */}
                  <path
                    d={getEqPath()}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="filter drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                  />
                </svg>

                {/* Bottom Frequency Readouts */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
                  <span>
                    Low: {currentEq.low > 0 ? `+${currentEq.low}` : currentEq.low} dB
                    (100Hz)
                  </span>
                  <span>
                    Mid: {currentEq.mid > 0 ? `+${currentEq.mid}` : currentEq.mid} dB
                    (1.2kHz)
                  </span>
                  <span>
                    High: {currentEq.high > 0 ? `+${currentEq.high}` : currentEq.high} dB
                    (10kHz Air)
                  </span>
                </div>
              </div>

              {/* 3 Parameter Sliders */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                {/* Low Shelf */}
                <div className="bg-[#070b14] p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">LOW SHELF</span>
                    <span className="text-cyan-400 font-bold">
                      {currentEq.low > 0 ? `+${currentEq.low}` : currentEq.low}dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={0.5}
                    value={currentEq.low}
                    onChange={(e) => handleEqChange('low', Number(e.target.value))}
                    className="w-full h-1 accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Parametric Mid */}
                <div className="bg-[#070b14] p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">PARAMETRIC MID</span>
                    <span className="text-cyan-400 font-bold">
                      {currentEq.mid > 0 ? `+${currentEq.mid}` : currentEq.mid}dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={0.5}
                    value={currentEq.mid}
                    onChange={(e) => handleEqChange('mid', Number(e.target.value))}
                    className="w-full h-1 accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Air High Shelf */}
                <div className="bg-[#070b14] p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">AIR HIGH SHELF</span>
                    <span className="text-cyan-400 font-bold">
                      {currentEq.high > 0 ? `+${currentEq.high}` : currentEq.high}dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-12}
                    max={12}
                    step={0.5}
                    value={currentEq.high}
                    onChange={(e) => handleEqChange('high', Number(e.target.value))}
                    className="w-full h-1 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMICS Mode View */}
          {inspectorTab === 'DYNAMICS' && (
            <div className="bg-[#070b14] rounded-lg border border-slate-800 p-3 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-cyan-400 font-bold">
                  VCA FEED-FORWARD COMPRESSOR
                </span>
                <span className="text-slate-400 text-[10px]">Ratio: 4:1 · Opto Model</span>
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                <div className="bg-slate-900 p-2 rounded text-center">
                  <span className="text-[10px] text-slate-400 block">THRESHOLD</span>
                  <span className="text-slate-100 font-bold">-18.5 dB</span>
                </div>
                <div className="bg-slate-900 p-2 rounded text-center">
                  <span className="text-[10px] text-slate-400 block">ATTACK</span>
                  <span className="text-slate-100 font-bold">14 ms</span>
                </div>
                <div className="bg-slate-900 p-2 rounded text-center">
                  <span className="text-[10px] text-slate-400 block">RELEASE</span>
                  <span className="text-slate-100 font-bold">120 ms</span>
                </div>
                <div className="bg-slate-900 p-2 rounded text-center">
                  <span className="text-[10px] text-slate-400 block">GAIN REDUCTION</span>
                  <span className="text-rose-400 font-bold">-2.8 dB</span>
                </div>
              </div>
            </div>
          )}

          {/* INSERTS Mode View */}
          {inspectorTab === 'INSERTS' && (
            <div className="bg-[#070b14] rounded-lg border border-slate-800 p-3 space-y-2 font-mono text-xs">
              <span className="text-cyan-400 font-bold block text-[11px]">
                MODULAR INSERT RACK (6 DSP SLOTS)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {focusedChannel.inserts.map((ins, i) => (
                  <div
                    key={i}
                    className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-slate-200">{ins.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded ${
                        ins.active ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {ins.active ? 'ACTIVE' : 'BYPASS'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WAVEFORM Mode View */}
          {inspectorTab === 'WAVEFORM' && (
            <div className="bg-[#070b14] rounded-lg border border-slate-800 p-3 space-y-2 font-mono text-xs">
              <span className="text-cyan-400 font-bold block text-[11px]">
                REAL-TIME DUAL-VIEW TRANSIENT OSCILLOSCOPE
              </span>
              <div className="h-20 bg-slate-950 rounded flex items-center justify-center space-x-1 px-4">
                {[0.2, 0.5, 0.8, 0.9, 0.6, 0.4, 0.7, 0.85, 0.9, 0.4, 0.3, 0.6, 0.8, 0.95, 0.7, 0.5].map(
                  (v, i) => (
                    <div
                      key={i}
                      style={{ height: `${v * 100}%` }}
                      className="flex-1 bg-cyan-400/80 rounded-full"
                    />
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT CARD: Co-Engineer & Acoustic Suite */}
        <div className="bg-[#0b1220] rounded-xl border border-slate-800/90 p-4 space-y-3.5 shadow-lg">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-mono text-xs font-black uppercase text-slate-100 tracking-wider">
                  CO-ENGINEER & ACOUSTIC SUITE
                </span>
                <span className="text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded uppercase flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>TELEMETRY LIVE</span>
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Masking Detection • Meter Bridge • Reference A/B Matching • Mix Snapshots
              </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 font-mono text-[10px]">
              {(['AI ADVISOR', 'METERS', 'REFERENCE', 'SCENES'] as const).map(
                (tab) => {
                  const isActive = coEngineerTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setCoEngineerTab(tab)}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* AI ADVISOR TAB */}
          {coEngineerTab === 'AI ADVISOR' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                  ACOUSTIC MASKING & BALANCE
                </span>

                <button
                  onClick={handleAnalyseMix}
                  disabled={isAnalysing}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono rounded shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isAnalysing ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isAnalysing
                      ? 'Analysing Spectral Bounces...'
                      : hasAnalysed
                      ? 'RE-ANALYSE THIS MIX'
                      : 'ANALYSE THIS MIX'}
                  </span>
                </button>
              </div>

              {!hasAnalysed && !isAnalysing ? (
                /* Initial state before analysis */
                <div className="p-4 bg-[#070b14] rounded-lg border border-slate-800/80 text-center space-y-2">
                  <p className="text-xs text-slate-400 font-sans max-w-md mx-auto leading-relaxed">
                    Nothing measured yet. Analysing bounces each track on its own and
                    compares where two of them put energy in the same band at the same
                    time.
                  </p>
                </div>
              ) : isAnalysing ? (
                /* Loading State */
                <div className="p-6 bg-[#070b14] rounded-lg border border-slate-800/80 text-center space-y-3 font-mono">
                  <div className="text-xs text-amber-400 font-bold animate-pulse">
                    Calculating 8-Track Cross-Correlation & Frequency Collision Matrix...
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 animate-[progress_1.2s_ease-in-out_infinite]" />
                  </div>
                </div>
              ) : (
                /* Analyzed Interactive Telemetry Feed */
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {/* Collision 1: Kick vs 808 */}
                  <div className="p-3 bg-[#070b14] rounded-lg border border-rose-900/40 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span className="font-bold text-slate-100">
                          Kick (Thump) vs 808 / Bass
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                        78% SEVERE MASKING
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans">
                      Kick transient fundamental (65Hz) is colliding with 808 sub root,
                      causing -2.6dB dynamic phase cancellation.
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400">
                        Rec: Sidechain duck 808 at 70Hz
                      </span>
                      <button
                        onClick={() =>
                          onProposeChangeSet(
                            'Sidechain duck 808 by -3.2dB on Kick strikes to eliminate low-end masking'
                          )
                        }
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded cursor-pointer transition-all flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Formulate ChangeSet</span>
                      </button>
                    </div>
                  </div>

                  {/* Collision 2: Synth vs Vocal */}
                  <div className="p-3 bg-[#070b14] rounded-lg border border-amber-900/40 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-bold text-slate-100">
                          Melody / Synth vs Lead Vocal
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
                        44% MODERATE MASKING
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 font-sans">
                      Synth upper chorus harmonics compete with vocal formant lane between
                      1.4kHz and 2.6kHz.
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px]">
                      <span className="text-slate-400">
                        Rec: Dip Synth 2kHz lane by -2.0dB
                      </span>
                      <button
                        onClick={() =>
                          onProposeChangeSet(
                            'Carve out 2kHz pocket on Melody Synth during Lead Vocal phrases'
                          )
                        }
                        className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded cursor-pointer transition-all flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Formulate ChangeSet</span>
                      </button>
                    </div>
                  </div>

                  {/* Health check */}
                  <div className="p-2.5 bg-slate-950 rounded border border-emerald-500/30 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Phase Correlation: +0.88 (Clean Stereo Summing)</span>
                    </div>
                    <span className="text-slate-400">True Peak: -1.2 dBFS</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* METERS TAB */}
          {coEngineerTab === 'METERS' && (
            <div className="bg-[#070b14] rounded-lg border border-slate-800 p-3 space-y-3 font-mono text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    INTEGRATED LUFS
                  </span>
                  <span className="text-lg font-bold text-emerald-400">-14.2 LUFS</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">MAX TRUE PEAK</span>
                  <span className="text-lg font-bold text-cyan-400">-1.0 dBTP</span>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">
                    DYNAMIC RANGE
                  </span>
                  <span className="text-lg font-bold text-amber-400">11.4 LU</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                Ready for Spotify, Apple Music & Tidal delivery guidelines with zero
                inter-sample clipping.
              </div>
            </div>
          )}

          {/* REFERENCE TAB */}
          {coEngineerTab === 'REFERENCE' && (
            <div className="bg-[#070b14] rounded-lg border border-slate-800 p-3 space-y-2 font-mono text-xs">
              <span className="text-amber-400 font-bold block text-[11px]">
                A/B REFERENCE MATCHING: "D'ANGELO - BROWN SUGAR"
              </span>
              <p className="text-[11px] text-slate-300 font-sans">
                Comparing tonal tilt and frequency distribution against selected analog
                reference target.
              </p>
              <div className="p-2 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-[11px]">
                <span>Tonal Balance Match:</span>
                <span className="text-emerald-400 font-bold">92% Correlation</span>
              </div>
            </div>
          )}

          {/* SCENES TAB */}
          {coEngineerTab === 'SCENES' && (
            <div className="bg-[#070b14] rounded-lg border border-slate-800 p-3 space-y-2 font-mono text-xs">
              <span className="text-cyan-400 font-bold block text-[11px]">
                MIX SCENE SNAPSHOTS (INSTANT RECALL)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <button className="p-2 rounded border bg-cyan-500 text-slate-950 font-bold cursor-pointer">
                  Scene A: Clean Dry
                </button>
                <button className="p-2 rounded border bg-slate-900 text-slate-300 border-slate-800 hover:text-white cursor-pointer">
                  Scene B: Warm Gospel
                </button>
                <button className="p-2 rounded border bg-slate-900 text-slate-300 border-slate-800 hover:text-white cursor-pointer">
                  Scene C: Radio Push
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
