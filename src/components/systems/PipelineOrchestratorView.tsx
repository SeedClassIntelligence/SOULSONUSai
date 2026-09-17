import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PipelineStage } from '../../types/soulsonus';

interface PipelineOrchestratorViewProps {
  stages: PipelineStage[];
}

export const PipelineOrchestratorView: React.FC<PipelineOrchestratorViewProps> = ({
  stages,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('p4');

  const currentStage = stages.find((s) => s.id === selectedStageId) || stages[3];

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              ENGINEERING PIPELINE · 11-STAGE ORCHESTRATOR
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              SoulSonus owns the workflow and project model. External models provide bounded, swappable execution.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>ALL 11 STAGES MONITORED</span>
        </div>
      </div>

      {/* Horizontal / Scrollable 11 Stages Timeline Track */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-2">
        <div className="text-[10px] font-mono text-slate-400 font-bold uppercase mb-2">
          EXECUTION STAGES PIPELINE (Click any node to inspect payload)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {stages.map((stage, idx) => {
            const isSelected = stage.id === selectedStageId;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-slate-100 ring-1 ring-amber-500/50 shadow-md'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-mono font-bold text-amber-500">
                    STAGE {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${stage.status === 'completed' ? 'bg-emerald-400' : stage.status === 'active' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'}`} />
                </div>
                <div className="text-xs font-mono font-bold truncate">{stage.label}</div>
                <div className="text-[9px] font-mono text-slate-500 mt-1 truncate">
                  {stage.sublabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspected Stage Node Details */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
              NODE INSPECTOR · {currentStage.label}
            </span>
            <h3 className="text-sm font-bold text-slate-100 font-mono mt-0.5">
              {currentStage.sublabel}
            </h3>
          </div>
          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px]">STAGE STATUS</span>
            <span className="text-emerald-400 font-bold uppercase">{currentStage.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {/* Detail Contract */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">
              EXECUTION CONTRACT & CONSTRAINTS
            </span>
            <p className="text-slate-300 text-xs">{currentStage.detail}</p>
          </div>

          {/* Model Isolation Rule */}
          <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">
              SOULSONUS INVARIANCE GUARANTEE
            </span>
            <p className="text-slate-300 text-xs">
              Raw audio buffers are immutable. Model predictions undergo strict SMIR boundary checks before ChangeSet formulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
