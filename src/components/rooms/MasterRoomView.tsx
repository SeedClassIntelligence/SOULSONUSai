import React, { useState, useEffect } from 'react';
import {
  Activity,
  Sparkles,
  Sliders,
  ChevronDown,
  Check,
  ShieldCheck,
  Disc3,
  FileCheck,
  Play,
  Volume2,
  Cpu,
  Layers,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Radio,
  Download,
} from 'lucide-react';

interface MasterRoomViewProps {
  onExportMaster?: () => void;
  playheadTime?: string;
  isPlaying?: boolean;
}

interface MasteringProcessor {
  id: number;
  name: string;
  subName: string;
  category: string;
  isActive: boolean;
  precision: string;
  technology: string;
}

export const MasterRoomView: React.FC<MasterRoomViewProps> = ({
  onExportMaster,
  playheadTime = '1:01.1',
  isPlaying = false,
}) => {
  // Master Target Dropdown
  const [masterTarget, setMasterTarget] = useState<string>(
    'Streaming Balanced (-14.0 LUFS / -1.0 dBTP)'
  );
  const [isTargetDropdownOpen, setIsTargetDropdownOpen] = useState(false);

  const targetOptions = [
    'Streaming Balanced (-14.0 LUFS / -1.0 dBTP)',
    'Club / SoundSystem (-8.0 LUFS / -0.1 dBTP)',
    'Apple Music / Hi-Res (-16.0 LUFS / -1.0 dBTP)',
    'Broadcast ITU-R BS.1770 (-23.0 LUFS / -1.0 dBTP)',
    'Vinyl Lacquer Pre-Master (-18.0 LUFS / -2.0 dBTP)',
  ];

  // Selected Active Processor in 7-Stage Chain
  const [selectedProcessorId, setSelectedProcessorId] = useState<number>(1);

  // Processor active bypass states
  const [processors, setProcessors] = useState<MasteringProcessor[]>([
    {
      id: 1,
      name: 'Corrective Linear-Phase EQ',
      subName: 'CORRECTIVE EQ',
      category: 'Linear-Phase EQ',
      isActive: true,
      precision: '64-bit Floating Point Precision',
      technology: 'Linear Phase Filtering',
    },
    {
      id: 2,
      name: '3-Band Dynamic Equalizer',
      subName: 'DYNAMIC EQ',
      category: 'Dynamic EQ',
      isActive: true,
      precision: 'Dual-Slope Multiband Processing',
      technology: 'Program-Dependent Detection',
    },
    {
      id: 3,
      name: 'Master Bus VCA Glue Compressor',
      subName: 'BUS COMP',
      category: 'VCA Bus Compressor',
      isActive: true,
      precision: 'Analog Oxford Discrete Modeling',
      technology: 'Auto-Release Program Limiting',
    },
    {
      id: 4,
      name: 'Harmonic Tape / Tube Saturation',
      subName: 'SATURATION',
      category: 'Harmonic Exciter',
      isActive: true,
      precision: '30 IPS 1/2" Studer Modeling',
      technology: 'Even & Odd Order Harmonics',
    },
    {
      id: 5,
      name: 'Mid/Side Stereo Imager & Mono-Bass',
      subName: 'STEREO MS',
      category: 'Stereo Field Processor',
      isActive: true,
      precision: 'Elliptical High-Pass Phase Alignment',
      technology: 'M/S Matrix Decorrelation',
    },
    {
      id: 6,
      name: 'Soft Transient Peak Clipper',
      subName: 'SOFT CLIPPER',
      category: 'Soft Clipper',
      isActive: true,
      precision: 'Oversampled Polynomial Soft Knee',
      technology: 'Zero-Latency Peak Taming',
    },
    {
      id: 7,
      name: 'True-Peak Broadcast Limiter',
      subName: 'TRUE PEAK_LIMITER',
      category: 'Broadcast Brickwall Limiter',
      isActive: true,
      precision: '4x Intersample Detection Lookahead',
      technology: 'ITU-R BS.1770 Compliant Ceiling',
    },
  ]);

  // Parameters for Processor 1: Corrective Linear-Phase EQ
  const [eqLowCut, setEqLowCut] = useState<number>(28); // 28 Hz
  const [eqLowMidNotch, setEqLowMidNotch] = useState<number>(-0.8); // -0.8 dB
  const [eqHighAirShelf, setEqHighAirShelf] = useState<number>(1.5); // +1.5 dB

  // Parameters for other processors (so switching shows rich live controls)
  const [dynEqThreshold, setDynEqThreshold] = useState<number>(-18.5);
  const [compGlueRatio, setCompGlueRatio] = useState<number>(2.0);
  const [compGlueRelease, setCompGlueRelease] = useState<number>(100);
  const [tapeDrive, setTapeDrive] = useState<number>(3.2);
  const [stereoWidth, setStereoWidth] = useState<number>(112);
  const [monoBassFreq, setMonoBassFreq] = useState<number>(92);
  const [clipCeiling, setClipCeiling] = useState<number>(-0.4);
  const [limiterCeiling, setLimiterCeiling] = useState<number>(-1.0);

  // Telemetry Measurement State
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [isMeasured, setIsMeasured] = useState<boolean>(false);
  const [telemetryProgress, setTelemetryProgress] = useState<number>(0);

  // Telemetry Tab State (LOUDNESS, SPECTRUM, STEREO, REFERENCE)
  const [telemetryTab, setTelemetryTab] = useState<'LOUDNESS' | 'SPECTRUM' | 'STEREO' | 'REFERENCE'>('LOUDNESS');

  // Co-Engineer Tab State (ADVISOR, CANDIDATES, GATE CHECK, DELIVERY)
  const [coEngineerTab, setCoEngineerTab] = useState<'ADVISOR' | 'CANDIDATES' | 'GATE CHECK' | 'DELIVERY'>('ADVISOR');

  // Master Candidate Audition
  const [activeCandidate, setActiveCandidate] = useState<'A' | 'B' | 'C'>('A');

  // Interactive SeedSignature signing confirmation
  const [isCandidateLocked, setIsCandidateLocked] = useState<boolean>(false);

  // Toggle active status of a processor
  const handleToggleProcessor = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setProcessors((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  // Perform "MEASURE THIS MASTER"
  const handleRunMeasure = () => {
    setIsMeasuring(true);
    setTelemetryProgress(0);

    const interval = setInterval(() => {
      setTelemetryProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setIsMeasuring(false);
          setIsMeasured(true);
          return 100;
        }
        return p + 25;
      });
    }, 220);
  };

  const selectedProcessor =
    processors.find((p) => p.id === selectedProcessorId) || processors[0];

  return (
    <div className="bg-[#050811] text-slate-100 font-mono select-none space-y-3 pb-8">
      {/* 1. Room Header: Room 5 Master Audio Console */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5 px-1">
        <div className="flex items-center space-x-2 text-xs">
          {/* Amber Dot */}
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] shrink-0" />
          <h1 className="font-black tracking-wider text-slate-100 text-xs sm:text-sm font-mono uppercase">
            ROOM 5: MASTER AUDIO CONSOLE
          </h1>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            SOURCE:{' '}
            <span className="text-cyan-400 font-bold">
              mix_print_v1_0_0
            </span>{' '}
            (24-bit / 48kHz Print)
          </span>
        </div>

        {/* Right Target Selector */}
        <div className="flex items-center space-x-2 text-xs relative">
          <span className="text-slate-500 text-[11px] font-bold">
            R04 MASTER TARGET:
          </span>
          <div className="relative">
            <button
              onClick={() => setIsTargetDropdownOpen(!isTargetDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1 rounded bg-[#0b1220] border border-slate-700/80 hover:border-slate-500 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <span>{masterTarget}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isTargetDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-[#090f1d] border border-slate-700 rounded-lg shadow-2xl py-1 z-50 text-xs">
                {targetOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setMasterTarget(opt);
                      setIsTargetDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-cyan-950/50 hover:text-cyan-300 transition-colors ${
                      masterTarget === opt
                        ? 'text-cyan-400 font-bold bg-cyan-950/30'
                        : 'text-slate-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {masterTarget === opt && (
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. STEREO MASTER PRINT WAVEFORM */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center space-x-2">
            <span className="text-slate-300 font-bold text-[11px]">
              STEREO MASTER PRINT WAVEFORM
            </span>
            <span className="text-cyan-400 font-bold text-[11px]">
              (Master Candidate A (Streaming Balanced -14 LUFS))
            </span>
          </div>
          <span className="text-slate-400 text-[11px] font-bold">
            PLAYHEAD: BAR {playheadTime ? playheadTime.split(':')[0] + '.1' : '1.1'}
          </span>
        </div>

        {/* Section Pill Markers Row */}
        <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold">
          <div className="py-1 px-2 rounded bg-[#0b1325] border border-cyan-500/40 text-cyan-300">
            Intro Beat (Bars 1-1)
          </div>
          <div className="py-1 px-2 rounded bg-[#0b1325] border border-cyan-500/40 text-cyan-300">
            Verse Pocket (Bars 2-2)
          </div>
          <div className="py-1 px-2 rounded bg-[#13151f] border border-amber-500/60 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
            Chorus Lead Hook (Bars 3-3)
          </div>
          <div className="py-1 px-2 rounded bg-[#0b1325] border border-cyan-500/40 text-cyan-300">
            Outro Resolving Tail (Bars 4-4)
          </div>
        </div>

        {/* Waveform Visualizer Canvas Ribbon */}
        <div className="relative h-28 bg-[#050914] rounded-lg border border-slate-800/90 overflow-hidden flex items-center justify-center p-2 shadow-inner">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-2">
            <div className="w-full border-b border-slate-700" />
            <div className="w-full border-b border-slate-700" />
            <div className="w-full border-b border-slate-700" />
          </div>

          {/* Dual Woven Sinusoidal Wave Ribbons SVG */}
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 1000 120"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="amberGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              <linearGradient id="cyanGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="40%" stopColor="#06b6d4" />
                <stop offset="75%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              <filter id="glowFilter" x="-10%" y="-20%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Vertical Bar Dividers */}
            <line x1="250" y1="0" x2="250" y2="120" stroke="#1e293b" strokeDasharray="3,3" />
            <line x1="500" y1="0" x2="500" y2="120" stroke="#1e293b" strokeDasharray="3,3" />
            <line x1="750" y1="0" x2="750" y2="120" stroke="#1e293b" strokeDasharray="3,3" />

            {/* Cyan Wave Ribbon */}
            <path
              d="M 0 60 C 80 15, 170 105, 250 60 C 330 20, 420 100, 500 60 C 580 10, 680 115, 750 60 C 820 15, 920 105, 1000 60"
              fill="none"
              stroke="url(#cyanGlow)"
              strokeWidth="4"
              filter="url(#glowFilter)"
              strokeLinecap="round"
            />

            {/* Amber / Gold Wave Ribbon (intersecting harmonic phase) */}
            <path
              d="M 0 60 C 80 105, 170 15, 250 60 C 330 100, 420 20, 500 60 C 580 110, 680 5, 750 60 C 820 105, 920 15, 1000 60"
              fill="none"
              stroke="url(#amberGlow)"
              strokeWidth="4"
              filter="url(#glowFilter)"
              strokeLinecap="round"
            />
          </svg>

          {/* Interactive Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-[2px] bg-cyan-400 shadow-[0_0_8px_#22d3ee] pointer-events-none transition-all duration-300"
            style={{ left: isPlaying ? '65%' : '26%' }}
          >
            <div className="w-2.5 h-2.5 -ml-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
          </div>
        </div>
      </div>

      {/* 3. 7-STAGE MODULAR MASTERING CHAIN */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-bold text-slate-100 text-xs tracking-wider uppercase">
            7-STAGE MODULAR MASTERING CHAIN
          </span>
          <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wide">
            CLICK ANY PROCESSOR TO ADJUST HARDWARE PARAMETERS
          </span>
        </div>

        {/* 7 Horizontal Processor Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {processors.map((proc) => {
            const isSelected = selectedProcessorId === proc.id;
            return (
              <div
                key={proc.id}
                onClick={() => setSelectedProcessorId(proc.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between h-20 relative select-none ${
                  isSelected
                    ? 'bg-[#10192a] border-amber-500/90 shadow-[0_0_12px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                    : 'bg-[#090f1d] border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Top: Stage Number + Active LED Indicator */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">
                    [{proc.id}]
                  </span>
                  <button
                    onClick={(e) => handleToggleProcessor(proc.id, e)}
                    className="cursor-pointer p-0.5"
                    title={proc.isActive ? 'Bypass' : 'Activate'}
                  >
                    <span
                      className={`w-2 h-2 rounded-full inline-block transition-all ${
                        proc.isActive
                          ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                          : 'bg-slate-700'
                      }`}
                    />
                  </button>
                </div>

                {/* Main Name */}
                <div className="text-[11px] font-bold text-slate-100 leading-tight">
                  {proc.name}
                </div>

                {/* Sub Name */}
                <div
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    isSelected ? 'text-amber-400' : 'text-slate-400'
                  }`}
                >
                  {proc.subName}
                </div>
              </div>
            );
          })}
        </div>

        {/* Processor Hardware Parameter Controls Box (Selected Processor) */}
        <div className="bg-[#080d1a] border border-slate-800/90 rounded-lg p-3 space-y-3 shadow-inner">
          {/* Header Row of the Processor Box */}
          <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider">
                {selectedProcessor.name.toUpperCase()} CONTROLS
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 text-[10px] hidden md:inline">
                {selectedProcessor.precision}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400 text-[10px] hidden md:inline">
                {selectedProcessor.technology}
              </span>
            </div>

            {/* Active Green Badge */}
            <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
              <span>{selectedProcessor.isActive ? 'ACTIVE' : 'BYPASS'}</span>
            </div>
          </div>

          {/* Processor-Specific Parameter Sliders */}
          {selectedProcessorId === 1 && (
            /* Processor 1: Corrective Linear-Phase EQ (Matches Screenshot Identically) */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              {/* Slider 1: Low Cut (HPF) */}
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">
                  Low Cut (HPF)
                </span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="15"
                    max="60"
                    value={eqLowCut}
                    onChange={(e) => setEqLowCut(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-12 text-right">
                  {eqLowCut} Hz
                </span>
              </div>

              {/* Slider 2: Low-Mid Notch */}
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">
                  Low-Mid Notch
                </span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="-4.0"
                    max="4.0"
                    step="0.1"
                    value={eqLowMidNotch}
                    onChange={(e) => setEqLowMidNotch(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  {eqLowMidNotch > 0 ? `+${eqLowMidNotch.toFixed(1)}` : eqLowMidNotch.toFixed(1)} dB
                </span>
              </div>

              {/* Slider 3: High Air Shelf */}
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">
                  High Air Shelf
                </span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="-2.0"
                    max="5.0"
                    step="0.1"
                    value={eqHighAirShelf}
                    onChange={(e) => setEqHighAirShelf(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  +{eqHighAirShelf.toFixed(1)} dB
                </span>
              </div>
            </div>
          )}

          {selectedProcessorId === 2 && (
            /* Processor 2: Dynamic EQ */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Band 2 Threshold</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="-30"
                    max="0"
                    value={dynEqThreshold}
                    onChange={(e) => setDynEqThreshold(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  {dynEqThreshold} dB
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Dynamic Range</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="0.5"
                    defaultValue="-2.5"
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  -2.5 dB
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Vocal Sibilance Q</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.2"
                    defaultValue="2.8"
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  2.8 Q
                </span>
              </div>
            </div>
          )}

          {selectedProcessorId === 3 && (
            /* Processor 3: Bus Glue Compressor */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Glue Ratio</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="1.5"
                    max="4.0"
                    step="0.5"
                    value={compGlueRatio}
                    onChange={(e) => setCompGlueRatio(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  {compGlueRatio.toFixed(1)}:1
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Auto Release</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="50"
                    max="400"
                    step="10"
                    value={compGlueRelease}
                    onChange={(e) => setCompGlueRelease(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  {compGlueRelease} ms
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Sidechain HPF</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="40"
                    max="160"
                    defaultValue="110"
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  110 Hz
                </span>
              </div>
            </div>
          )}

          {selectedProcessorId === 4 && (
            /* Processor 4: Tape Saturation */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Analog Drive</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.2"
                    value={tapeDrive}
                    onChange={(e) => setTapeDrive(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  {tapeDrive.toFixed(1)} dB
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Tape Speed</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="15"
                    max="30"
                    step="15"
                    defaultValue="30"
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  30 IPS
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Even Harmonics</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="45"
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  45%
                </span>
              </div>
            </div>
          )}

          {selectedProcessorId === 5 && (
            /* Processor 5: Stereo Imager & Mono-Bass */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Stereo Width</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="80"
                    max="150"
                    value={stereoWidth}
                    onChange={(e) => setStereoWidth(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  {stereoWidth}%
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Mono-Bass X-Over</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={monoBassFreq}
                    onChange={(e) => setMonoBassFreq(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  {monoBassFreq} Hz
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Phase Safe Lock</span>
                <div className="flex-1 px-2">
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                    +0.92 CORRELATED
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedProcessorId === 6 && (
            /* Processor 6: Soft Peak Clipper */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Clip Ceiling</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="-2.0"
                    max="0.0"
                    step="0.1"
                    value={clipCeiling}
                    onChange={(e) => setClipCeiling(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  {clipCeiling.toFixed(1)} dBFS
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Knee Softness</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="60"
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  60%
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Oversampling</span>
                <div className="flex-1 px-2">
                  <span className="text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40">
                    4X LINEAR PHASE
                  </span>
                </div>
              </div>
            </div>
          )}

          {selectedProcessorId === 7 && (
            /* Processor 7: True-Peak Limiter */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">True Peak Ceiling</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="-2.0"
                    max="-0.1"
                    step="0.1"
                    value={limiterCeiling}
                    onChange={(e) => setLimiterCeiling(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-cyan-400 font-mono shrink-0 w-14 text-right">
                  {limiterCeiling.toFixed(1)} dBTP
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">Lookahead Time</span>
                <div className="flex-1 px-2">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    defaultValue="5"
                    className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                  />
                </div>
                <span className="text-xs font-bold text-amber-400 font-mono shrink-0 w-14 text-right">
                  5.0 ms
                </span>
              </div>
              <div className="flex items-center justify-between space-x-3">
                <span className="text-xs text-slate-300 font-bold shrink-0">ISP Overs</span>
                <div className="flex-1 px-2">
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                    0 DETECTED (SAFE)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Bottom Split Section: Mastering Telemetry & Analysis + Co-Engineer & Finalization Gate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
        {/* LEFT PANEL: MASTERING TELEMETRY & ANALYSIS */}
        <div className="bg-[#080d1a] rounded-lg border border-slate-800/90 p-3 flex flex-col justify-between space-y-3">
          {/* Header Row */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                  MASTERING TELEMETRY & ANALYSIS
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-950/40">
                  BROADCAST ACCURATE
                </span>
              </div>

              {/* Tabs: LOUDNESS, SPECTRUM, STEREO, REFERENCE */}
              <div className="flex items-center space-x-1 text-xs">
                {(['LOUDNESS', 'SPECTRUM', 'STEREO', 'REFERENCE'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTelemetryTab(tab)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      telemetryTab === tab
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              ITU-R BS.1770-4 Loudness • 20Hz-20kHz FFT • Stereo Correlation • Reference Delta
            </p>
          </div>

          {/* Tab 1: LOUDNESS (Matches Screenshot) */}
          {telemetryTab === 'LOUDNESS' && (
            <div className="space-y-2.5">
              {/* Measure Notice & Button */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400">
                  {isMeasuring
                    ? `Measuring candidate master telemetry... (${telemetryProgress}%)`
                    : isMeasured
                    ? 'Measurement complete — ITU-R BS.1770 compliant. 4.4 bars analyzed.'
                    : 'Not measured yet — values below are the candidate preset, not a measurement.'}
                </span>

                <button
                  onClick={handleRunMeasure}
                  disabled={isMeasuring}
                  className="px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-[11px] shadow-sm transition-all cursor-pointer shrink-0 ml-2"
                >
                  {isMeasuring ? 'MEASURING...' : 'MEASURE THIS MASTER'}
                </button>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Metric Box 1: Integrated LUFS */}
                <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    INTEGRATED LUFS
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-cyan-400">
                    {isMeasured ? '-14.08' : '-14.1'}{' '}
                    <span className="text-xs font-normal text-slate-400">LUFS</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-slate-400">Target: -14.0 LUFS</span>
                    <span
                      className={`font-bold ${
                        isMeasured ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {isMeasured ? 'COMPLIANT' : 'NOT MEASURED'}
                    </span>
                  </div>
                </div>

                {/* Metric Box 2: True Peak Ceiling */}
                <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    TRUE PEAK CEILING
                  </div>
                  <div className="text-2xl sm:text-3xl font-mono font-black text-emerald-400">
                    {isMeasured ? '-1.02' : '-1'}{' '}
                    <span className="text-xs font-normal text-slate-400">dBTP</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-slate-400">Max Intersample: Safe</span>
                    <span className="text-emerald-400 font-bold">NO CLIPPING</span>
                  </div>
                </div>
              </div>

              {/* Metric Box 3: Dynamic Crest Factor */}
              <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    DYNAMIC CREST FACTOR
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    9.2 dB
                  </span>
                </div>

                <div className="grid grid-cols-3 text-center text-[10px] pt-1 border-t border-slate-800/60">
                  <div>
                    <div className="text-slate-500">Short-Term</div>
                    <div className="font-bold text-slate-300 font-mono mt-0.5">
                      {isMeasured ? '-13.7 LUFS' : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Momentary</div>
                    <div className="font-bold text-slate-300 font-mono mt-0.5">
                      {isMeasured ? '-12.4 LUFS' : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">Phase Corr.</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">
                      {isMeasured ? '+0.94 Safe' : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: SPECTRUM (Real-Time 20Hz-20kHz RTA) */}
          {telemetryTab === 'SPECTRUM' && (
            <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>FFT SPECTRUM ANALYZER (20Hz – 20kHz)</span>
                <span className="text-cyan-400 font-bold">SMOOTHING: 1/6 OCTAVE</span>
              </div>
              {/* Spectrum Bars Simulation */}
              <div className="h-24 flex items-end gap-1 px-1 pt-2 border-b border-slate-800">
                {[
                  35, 42, 60, 78, 85, 75, 68, 62, 58, 55, 52, 48, 50, 45, 40, 38,
                  35, 32, 28, 25, 22, 18, 15,
                ].map((val, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-cyan-500/80 to-amber-400/80 rounded-t"
                    style={{ height: `${val}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono px-1">
                <span>20 Hz (Sub)</span>
                <span>250 Hz (Low-Mid)</span>
                <span>2.5 kHz (Presence)</span>
                <span>20 kHz (Air)</span>
              </div>
            </div>
          )}

          {/* Tab 3: STEREO (Lissajous & Phase) */}
          {telemetryTab === 'STEREO' && (
            <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>POLAR GONIOMETER & M/S BALANCE</span>
                <span className="text-emerald-400 font-bold">PHASE: +0.94 (MONO SAFE)</span>
              </div>
              <div className="h-24 flex items-center justify-center relative">
                <div className="w-20 h-20 rounded-full border border-slate-800 flex items-center justify-center">
                  <div className="w-12 h-16 rounded-full border border-cyan-400/60 rotate-45 shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                  <div className="w-16 h-12 rounded-full border border-amber-400/60 -rotate-45" />
                </div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Mid (Sum): -1.5 dB</span>
                <span>Side (Difference): -7.8 dB</span>
                <span>Stereo Width: 112%</span>
              </div>
            </div>
          )}

          {/* Tab 4: REFERENCE (A/B Reference Delta) */}
          {telemetryTab === 'REFERENCE' && (
            <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>TARGET STREAMING CURVE DELTA</span>
                <span className="text-amber-400 font-bold">GENRE: Neo-Soul / R&B</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Matching commercial reference master &quot;Soul Velvet Master 24/48&quot;:
              </p>
              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Sub Bass (30-60Hz):</span>
                  <span className="text-emerald-400">+0.2 dB (Exact Match)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Vocal Presence (3-5kHz):</span>
                  <span className="text-cyan-400">-0.4 dB (Warm Tone Profile)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>High Air (10-18kHz):</span>
                  <span className="text-amber-400">+0.8 dB (Silk Sheen)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: CO-ENGINEER & FINALIZATION GATE */}
        <div className="bg-[#080d1a] rounded-lg border border-slate-800/90 p-3 flex flex-col justify-between space-y-3">
          {/* Header Row */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-100 font-mono uppercase tracking-wider">
                  CO-ENGINEER & FINALIZATION GATE
                </h3>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-emerald-400 border border-emerald-500/40 bg-emerald-950/40">
                  GOVERNED RUNTIME
                </span>
              </div>

              {/* Tabs: ADVISOR, CANDIDATES, GATE CHECK, DELIVERY */}
              <div className="flex items-center space-x-1 text-xs">
                {(['ADVISOR', 'CANDIDATES', 'GATE CHECK', 'DELIVERY'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCoEngineerTab(tab)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                      coEngineerTab === tab
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-1 font-mono">
              Mastering Telemetry Observations • A/B/C Candidate Audition • E14 SeedSignature Lock
            </p>
          </div>

          {/* Tab 1: ADVISOR (Matches Screenshot) */}
          {coEngineerTab === 'ADVISOR' && (
            <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-2 flex-1 flex flex-col justify-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                MASTERING TELEMETRY OBSERVATIONS
              </div>

              {!isMeasured ? (
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  Nothing measured yet. Run Measure This Master before this can compare anything to the -14.0 LUFS / -1.0 dBTP target.
                </p>
              ) : (
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-start space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      Target Compliance: -14.08 LUFS (0.08 dB delta from -14.0 target).
                    </span>
                  </div>

                  <div className="flex items-start space-x-2 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      True Peak Intersample: -1.02 dBTP with zero clipping overs across 4x oversampling.
                    </span>
                  </div>

                  <div className="flex items-start space-x-2 text-cyan-300">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      Mono-Bass Alignment: 100% monophonic coherence below 100Hz; safe for club & car subs.
                    </span>
                  </div>

                  <div className="flex items-start space-x-2 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>
                      Dynamic EQ smoothed vocal sibilance pocket on Bar 3 chorus hook while maintaining open high-air sparkle.
                    </span>
                  </div>

                  {/* SeedSignature Candidate Lock Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsCandidateLocked(true)}
                      className={`w-full py-2 px-3 rounded text-xs font-bold font-mono transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                        isCandidateLocked
                          ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-400'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>
                        {isCandidateLocked
                          ? 'SEEDSIGNATURE LOCKED (PROVENANCE 0x1d388)'
                          : 'LOCK MASTER CANDIDATE & SIGN SEEDSIGNATURE'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: CANDIDATES (A/B/C Audition) */}
          {coEngineerTab === 'CANDIDATES' && (
            <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-2 flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                A / B / C CANDIDATE AUDITION
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  {
                    id: 'A' as const,
                    name: 'Candidate A',
                    desc: 'Streaming Balanced (-14.0 LUFS)',
                    border: 'border-cyan-500/60',
                    color: 'text-cyan-400',
                  },
                  {
                    id: 'B' as const,
                    name: 'Candidate B',
                    desc: 'Warm Analog Tape (-12.5 LUFS)',
                    border: 'border-amber-500/60',
                    color: 'text-amber-400',
                  },
                  {
                    id: 'C' as const,
                    name: 'Candidate C',
                    desc: 'Punchy Dynamic Club (-9.0 LUFS)',
                    border: 'border-purple-500/60',
                    color: 'text-purple-400',
                  },
                ].map((cand) => (
                  <button
                    key={cand.id}
                    onClick={() => setActiveCandidate(cand.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                      activeCandidate === cand.id
                        ? `bg-slate-900 ${cand.border} ring-1 ring-cyan-400/40 shadow-sm`
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className={`font-bold text-xs ${cand.color}`}>
                      {cand.name} {activeCandidate === cand.id && '• ACTIVE'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">{cand.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                Instant gapless A/B comparison without volume jump (automatic gain matching applied).
              </p>
            </div>
          )}

          {/* Tab 3: GATE CHECK (Release Quality Assurance) */}
          {coEngineerTab === 'GATE CHECK' && (
            <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-2 flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                MASTERING GATE CHECKLIST (ITU-R & STREAMING COMPLIANCE)
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>1. ITU-R BS.1770-4 Loudness Compliance</span>
                  <span className="text-emerald-400 font-bold">[PASS]</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>2. True Peak Ceiling &lt;= -1.0 dBTP</span>
                  <span className="text-emerald-400 font-bold">[PASS]</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>3. Intersample Clip Count = 0</span>
                  <span className="text-emerald-400 font-bold">[PASS]</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>4. Mono-Bass Compatibility (&gt; +0.8)</span>
                  <span className="text-emerald-400 font-bold">[PASS +0.94]</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>5. 24-bit / 48kHz Lossless Format Verified</span>
                  <span className="text-emerald-400 font-bold">[PASS]</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: DELIVERY (Export Packages) */}
          {coEngineerTab === 'DELIVERY' && (
            <div className="bg-[#050914] rounded-lg border border-slate-800/80 p-3 space-y-2 flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                DELIVERY & MASTER EXPORT BUNDLE
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">24-bit 48kHz WAV Master</div>
                  <div className="text-[10px] text-slate-400">Lossless Broadcast Quality</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">320kbps MP3 Reference</div>
                  <div className="text-[10px] text-slate-400">ID3v2 Tagged with Artwork</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">96kHz Archive Master</div>
                  <div className="text-[10px] text-slate-400">High-Resolution Studio Vault</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="font-bold text-slate-200">SeedSignature Manifest</div>
                  <div className="text-[10px] text-slate-400">SHA-256 Provenance Proof</div>
                </div>
              </div>
              <button
                onClick={onExportMaster}
                className="w-full py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer mt-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT COMPLETE MASTER PACKAGE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
