import React from 'react';
import {
  Sliders,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Layers,
  Music,
} from 'lucide-react';
import { SMIRIntent } from '../../types/soulsonus';

interface SmirInspectorViewProps {
  intent: SMIRIntent;
}

export const SmirInspectorView: React.FC<SmirInspectorViewProps> = ({ intent }) => {
  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              SMIR INTENT INSPECTOR (SOURCE MUSICAL INTENT REPRESENTATION)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Raw melody vectors, groove delta, micro-timing, and preservation boundaries decoupled from realization.
            </p>
          </div>
        </div>

        <div className="font-mono text-xs text-slate-400">
          Source Element:{' '}
          <strong className="text-amber-400 font-mono">{intent.title}</strong>
        </div>
      </div>

      {/* 3-Box Representation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3.5 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-slate-400 font-bold block">
            1. RAW SOURCE
          </span>
          <div className="text-xs font-bold text-slate-200">
            {intent.source}
          </div>
          <div className="text-[10px] text-slate-400">
            Original 48kHz WAV audio buffer · 100% Preserved Immutable
          </div>
        </div>

        <div className="bg-slate-900/90 border border-cyan-500/40 rounded-lg p-3.5 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-cyan-400 font-bold block">
            2. SOULSONUS SMIR INTENT
          </span>
          <div className="text-xs font-bold text-cyan-300">
            Continuous Melodic Contour + Micro-Timing
          </div>
          <div className="text-[10px] text-slate-400">
            Phrase: "{intent.phrase}"
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/40 rounded-lg p-3.5 space-y-1 font-mono">
          <span className="text-[10px] uppercase text-amber-400 font-bold block">
            3. RENDERED REALIZATION
          </span>
          <div className="text-xs font-bold text-amber-300">
            {intent.intendedRole}
          </div>
          <div className="text-[10px] text-slate-400">
            Provider: {intent.providerUsed}
          </div>
        </div>
      </div>

      {/* Melodic Contour SVG Graph */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="font-bold text-slate-200">CONTINUOUS PITCH CONTOUR (PITCH VECTOR)</span>
          <span>Sample Rate: 100 Hz Interpolation</span>
        </div>

        <div className="h-32 bg-slate-950 rounded-lg border border-slate-800 relative flex items-center px-4 overflow-hidden">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-20">
            <div className="border-b border-slate-600" />
            <div className="border-b border-slate-600" />
            <div className="border-b border-slate-600" />
            <div className="border-b border-slate-600" />
          </div>

          {/* SVG curve */}
          <svg className="w-full h-24 overflow-visible">
            <path
              d="M 10,60 Q 60,10 120,40 T 220,20 T 320,50 T 420,15 T 520,45 T 620,30"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Target quantized note steps underneath */}
            <path
              d="M 10,60 L 60,60 L 60,40 L 120,40 L 120,20 L 220,20 L 220,50 L 320,50 L 320,20 L 420,20 L 420,40 L 520,40 L 520,30 L 620,30"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="text-cyan-400">― Expressive Pitch Contour (Vibrato & Glides)</span>
          <span className="text-amber-400">--- Quantized Musical Scale Steps (C Minor)</span>
        </div>
      </div>

      {/* Micro-Timing and Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        {/* Expressive Parameters */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-2.5">
          <span className="text-xs font-bold text-slate-200 uppercase">
            Acoustic & Groove Vectors
          </span>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Groove Delta:</span>
              <span className="text-amber-400 font-bold">{intent.grooveDelta}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Emotional Direction:</span>
              <span className="text-slate-200">{intent.emotionalDirection}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Realization:</span>
              <span className="text-slate-200 truncate">{intent.currentRealization}</span>
            </div>
          </div>
        </div>

        {/* Preservation Rules */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>INVIOLABLE PRESERVATION REQUIREMENTS</span>
          </div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            {intent.preservationRequirements.map((rule, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
