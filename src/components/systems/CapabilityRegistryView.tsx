import React from 'react';
import {
  Cpu,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CapabilityEntry } from '../../types/soulsonus';

interface CapabilityRegistryViewProps {
  items: CapabilityEntry[];
  onSwitchProvider: (capabilityId: string, newProvider: string) => void;
}

export const CapabilityRegistryView: React.FC<CapabilityRegistryViewProps> = ({
  items,
  onSwitchProvider,
}) => {
  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              CAPABILITY REGISTRY & PROVIDER SWITCHER
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              SoulSonus decouples artistic intent from physical realization models. Marcus remains Marcus regardless of engine.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded border border-cyan-500/30">
          Adapter Layer: ACTIVE
        </div>
      </div>

      {/* Capabilities List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase">
                  Category: {item.category}
                </span>
                <h3 className="text-sm font-bold text-slate-100 font-mono">
                  {item.capability}
                </h3>
              </div>

              {/* Provider dropdown selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-slate-400">ACTIVE PROVIDER:</span>
                <select
                  value={item.currentProvider}
                  onChange={(e) => onSwitchProvider(item.id, e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs font-mono font-bold outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {item.availableProviders.map((p, idx) => (
                    <option key={idx} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans">{item.description}</p>

            {item.isCompositeRecipe && item.compositeRecipeItems && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block">
                  Composite SoulSonus Recipe Components:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono text-slate-300">
                  {item.compositeRecipeItems.map((rec, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Architectural Division: SoulSonus Governance vs OSS Computation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-amber-500/20 space-y-1">
                <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  SoulSonus Governance & Interpretation
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {item.soulsonusLogic || 'Owns project intent, persona constraints, and ChangeSet safety validation.'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/20 space-y-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  Open Source Engine (Execution)
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed font-mono">
                  {item.ossEngine || item.currentProvider}
                </p>
              </div>
            </div>

            {/* License & Provenance Badges */}
            <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex items-center space-x-1 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Adapter Verified</span>
                </span>
                {item.codeLicense && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-[10px]">
                    Code: {item.codeLicense}
                  </span>
                )}
                {item.checkpointLicense && (
                  <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-700/40 text-[10px]">
                    Checkpoint: {item.checkpointLicense}
                  </span>
                )}
                {item.commercialStatus && (
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] font-bold ${
                      item.commercialStatus === 'COMMERCIAL_OK' || item.commercialStatus === 'PERMISSIVE'
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                        : item.commercialStatus === 'RIGHTS_CONTROLLED'
                        ? 'bg-purple-950/50 text-purple-300 border-purple-500/30'
                        : 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {item.commercialStatus}
                  </span>
                )}
                {item.modelHash && (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Hash: {item.modelHash}
                  </span>
                )}
              </div>
              <span className="text-slate-500">Latency: {item.latencyMs}ms · {item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
