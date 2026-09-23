import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileCheck,
  Key,
  ExternalLink,
  Award,
} from 'lucide-react';
import { ProjectMetadata } from '../../types/soulsonus';

interface ProvenanceRightsViewProps {
  metadata: ProjectMetadata;
}

export const ProvenanceRightsView: React.FC<ProvenanceRightsViewProps> = ({
  metadata,
}) => {
  const creatorPct = metadata.creatorOriginPct || 82;
  const aiPct = 100 - creatorPct;

  const auditReceipts = [
    { timestamp: '14:02:11', event: 'Creator Audio Buffer Recorded (Track 03)', actor: 'Devon Cole (Creator)', receiptHash: '0x8f2a...110e' },
    { timestamp: '13:48:30', event: 'ChangeSet Applied: Warm Vocal Insert', actor: 'Studio Intelligence', receiptHash: '0x3c99...e591' },
    { timestamp: '13:00:15', event: 'BGV Harmony Triad Synthesized', actor: 'Elena + Composite', receiptHash: '0x71bb...402a' },
    { timestamp: 'Yesterday', event: 'Marcus Session Bass Realization (Take 3)', actor: 'Marcus Persona AI', receiptHash: '0x10ae...c890' },
    { timestamp: 'Session Init', event: 'SeedSignature Genesis Block Created', actor: 'SoulSonus Kernel', receiptHash: '0x0001...genesis' },
  ];

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              SEEDSIGNATURE™ · CRYPTOGRAPHIC PROVENANCE & RIGHTS
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Tamper-evident ledger documenting human creator origin, model contributions, and commercial rights chain.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-500/40">
          <Lock className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHICALLY SEALED</span>
        </div>
      </div>

      {/* Main Highlights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Creator Origin Percentage */}
        <div className="bg-slate-900/90 rounded-xl border border-amber-500/40 p-4 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            Human Creator Origin
          </span>
          <div className="text-4xl font-mono font-black text-amber-400">
            {creatorPct}%
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Direct audio recording, melody, lyrics, and human pocket performance.
          </p>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              style={{ width: `${creatorPct}%` }}
              className="h-full bg-amber-500"
            />
          </div>
        </div>

        {/* AI Model Execution Percentage */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            AI-Assisted Realization
          </span>
          <div className="text-4xl font-mono font-black text-cyan-400">
            {aiPct}%
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Bounded execution models (Session Bass timbre & pitch tracking).
          </p>
          <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              style={{ width: `${aiPct}%` }}
              className="h-full bg-cyan-500"
            />
          </div>
        </div>

        {/* Commercial Status */}
        <div className="bg-slate-900/90 rounded-xl border border-emerald-500/40 p-4 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
            Commercial Export Status
          </span>
          <div className="text-2xl font-mono font-black text-emerald-400 flex items-center space-x-2 pt-1">
            <Award className="w-6 h-6" />
            <span>100% CLEARED</span>
          </div>
          <p className="text-xs text-slate-300 font-mono">
            Verified clean training lineage & creator copyright ownership.
          </p>
        </div>
      </div>

      {/* Signature Hash & Audit Log */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200 uppercase">
            Root SeedSignature Hash
          </span>
          <span className="text-amber-400 font-bold">{metadata.seedSignature}</span>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">
            Tamper-Evident Execution Log & Receipts:
          </span>
          <div className="space-y-1.5">
            {auditReceipts.map((log, idx) => (
              <div
                key={idx}
                className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-[11px]"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-slate-500">{log.timestamp}</span>
                  <span className="text-slate-200 font-semibold">{log.event}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400">{log.actor}</span>
                  <span className="text-emerald-400 font-mono">{log.receiptHash}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
