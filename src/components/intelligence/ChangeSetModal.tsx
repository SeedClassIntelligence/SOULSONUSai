import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  FileDiff,
  Volume2,
} from 'lucide-react';
import { ChangeSet } from '../../types/soulsonus';
import { audioEngine } from '../../services/audioEngine';

interface ChangeSetModalProps {
  changeSet: ChangeSet | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (changeSet: ChangeSet) => void;
  onAlternative: (changeSet: ChangeSet) => void;
  onReject: (changeSet: ChangeSet) => void;
}

export const ChangeSetModal: React.FC<ChangeSetModalProps> = ({
  changeSet,
  isOpen,
  onClose,
  onApply,
  onAlternative,
  onReject,
}) => {
  const [isPreviewing, setIsPreviewing] = useState(false);

  if (!isOpen || !changeSet) return null;

  const handleTogglePreview = () => {
    if (isPreviewing) {
      audioEngine.stopTransport();
      setIsPreviewing(false);
    } else {
      setIsPreviewing(true);
      // Play brief bass demonstration tone with filtered groove
      audioEngine.playNote(65.41, 'sawtooth', 0.8);
      setTimeout(() => audioEngine.playNote(77.78, 'sawtooth', 0.6), 250);
      setTimeout(() => audioEngine.playNote(87.31, 'sawtooth', 0.8), 500);
      setTimeout(() => setIsPreviewing(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <FileDiff className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                SoulSonus ChangeSet · Contract Formulation
              </div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                &ldquo;{changeSet.naturalPrompt}&rdquo;
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          {/* Target Scope */}
          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Execution Scope
              </span>
              <span className="text-slate-200 font-semibold font-mono">
                {changeSet.targetScope}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 block">PROPOSED REVISION</span>
              <span className="text-amber-400 font-mono font-bold">
                Rev {changeSet.createdRevision}
              </span>
            </div>
          </div>

          {/* 3 Pillars: Preserved, Permitted, Prohibited */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Preserved Elements */}
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PRESERVED ELEMENTS</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-emerald-200/90 font-mono">
                {changeSet.preservedElements.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Permitted Changes */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PERMITTED CHANGES</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-amber-200/90 font-mono">
                {changeSet.permittedChanges.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                    <Check className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prohibited Changes */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-3 space-y-2">
              <div className="flex items-center space-x-1.5 text-rose-400 font-bold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>PROHIBITED CHANGES</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-rose-200/90 font-mono">
                {changeSet.prohibitedChanges.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-1.5 leading-snug">
                    <XCircle className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Impact summary & Acoustic analysis */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 space-y-1 font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Studio Intelligence Impact Analysis
            </span>
            <p className="text-slate-300 text-xs">{changeSet.impactSummary}</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {/* Preview Button */}
          <button
            onClick={handleTogglePreview}
            className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center space-x-1.5 border transition-all ${
              isPreviewing
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isPreviewing ? 'Previewing Simulation...' : 'Preview Delta'}</span>
          </button>

          {/* Right Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onReject(changeSet)}
              className="px-3 py-1.5 rounded-md font-semibold text-xs text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-colors"
            >
              Reject
            </button>

            <button
              onClick={() => onAlternative(changeSet)}
              className="px-3 py-1.5 rounded-md font-semibold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              Generate Alternative
            </button>

            <button
              onClick={() => onApply(changeSet)}
              className="px-4 py-1.5 rounded-md font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all active:scale-[0.98] flex items-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply to Revision {changeSet.createdRevision}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
