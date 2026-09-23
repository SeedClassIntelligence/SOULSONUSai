import React from 'react';
import {
  History,
  GitBranch,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { RevisionNode } from '../../types/soulsonus';

interface RevisionTreeTakesViewProps {
  revisions: RevisionNode[];
  activeRevisionId: number;
  onRestoreRevision: (revisionId: number) => void;
}

export const RevisionTreeTakesView: React.FC<RevisionTreeTakesViewProps> = ({
  revisions,
  activeRevisionId,
  onRestoreRevision,
}) => {
  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              REVISION HISTORY & TAKES TREE
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Immutable session ledger. Every recording take and applied ChangeSet creates a safe rollback branch.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-amber-400">
          Current State: <strong>Revision {activeRevisionId}</strong>
        </div>
      </div>

      {/* Revision Tree / Timeline List */}
      <div className="space-y-3">
        {revisions.map((rev) => {
          const isCurrent = rev.revision === activeRevisionId;
          return (
            <div
              key={rev.id}
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-slate-900 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <GitBranch className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-slate-100">
                      Revision {rev.revision} · {rev.label}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                      ACTIVE HEAD
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  <span className="text-slate-400">{rev.timestamp}</span>
                  {!isCurrent && (
                    <button
                      onClick={() => onRestoreRevision(rev.revision)}
                      className="flex items-center space-x-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500 transition-all text-xs cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rollback to Rev {rev.revision}</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans mb-3">{rev.notes}</p>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Author: <strong className="text-slate-200">{rev.author}</strong></span>
                <span className="text-emerald-400 font-bold">Immutable Ledger Node</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
