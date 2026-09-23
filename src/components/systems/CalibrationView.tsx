import React, { useState } from 'react';
import {
  Compass,
  Sliders,
  CheckCircle2,
  Activity,
  Volume2,
  Check,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

export const CalibrationView: React.FC = () => {
  const [latencyCompensationMs, setLatencyCompensationMs] = useState<number>(4.2);
  const [micInputGain, setMicInputGain] = useState<number>(18.5);
  const [roomCorrectionActive, setRoomCorrectionActive] = useState<boolean>(true);
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);

  const handleRunPing = () => {
    setIsMeasuring(true);
    // Play calibration chirp
    audioEngine.playNote(1000, 'sine', 0.1);
    setTimeout(() => {
      audioEngine.playNote(2500, 'sine', 0.1);
      setIsMeasuring(false);
    }, 600);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              STUDIO HARDWARE & ACOUSTIC CALIBRATION
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Zero-latency audio buffer alignment, mic preamp curve profiling, and room impulse response compensation.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunPing}
          disabled={isMeasuring}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/40 text-xs font-mono font-semibold"
        >
          <Activity className={`w-3.5 h-3.5 ${isMeasuring ? 'animate-spin' : ''}`} />
          <span>{isMeasuring ? 'Pinging Loopback...' : 'Ping Audio Roundtrip'}</span>
        </button>
      </div>

      {/* 3 Calibration Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Latency */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
          <span className="text-xs font-mono font-bold text-blue-400 uppercase">
            01 · Roundtrip Latency
          </span>
          <div className="text-3xl font-mono font-bold text-slate-100">
            {latencyCompensationMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
          <p className="text-xs text-slate-400">
            Hardware buffer: 64 samples @ 48kHz. Direct hardware monitoring active.
          </p>
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>MANUAL LATENCY OFFSET</span>
              <span>{latencyCompensationMs} ms</span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={0.1}
              value={latencyCompensationMs}
              onChange={(e) => setLatencyCompensationMs(Number(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Input Gain */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase">
            02 · Mic Preamp Calibration
          </span>
          <div className="text-3xl font-mono font-bold text-slate-100">
            +{micInputGain} <span className="text-xs text-slate-400 font-normal">dB</span>
          </div>
          <p className="text-xs text-slate-400">
            Target: -18 dBFS nominal dialogue recording level with +12dB headroom.
          </p>
          <div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
              <span>PREAMP GAIN TRIM</span>
              <span>+{micInputGain} dB</span>
            </div>
            <input
              type="range"
              min={0}
              max={60}
              step={0.5}
              value={micInputGain}
              onChange={(e) => setMicInputGain(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Room Acoustics */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
            03 · Room Acoustics IR
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-slate-200">
              Filter Profile: Active
            </span>
            <button
              onClick={() => setRoomCorrectionActive(!roomCorrectionActive)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                roomCorrectionActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {roomCorrectionActive ? 'ENABLED' : 'BYPASS'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Cancels 140Hz flutter echo and desk reflection from creator microphone capsule.
          </p>
          <div className="text-[10px] font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
            RT60 Decay: 0.28s (Tight Studio Standard)
          </div>
        </div>
      </div>
    </div>
  );
};
