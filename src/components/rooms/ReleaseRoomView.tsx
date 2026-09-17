import React, { useState } from 'react';
import {
  Download,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Package,
  Layers,
  Sparkles,
  Radio,
} from 'lucide-react';

export const ReleaseRoomView: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              RELEASE ROOM · EXPORT DELIVERABLES
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              24-bit lossless masters, multi-track stem bundles, ISRC metadata, and Atmos handoff.
            </p>
          </div>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded border border-emerald-500/40">
          Distribution Ready
        </div>
      </div>

      {/* Deliverable Bundles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Master Package */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-400">
            <Package className="w-4 h-4" />
            <span>STEREO MASTER PACKAGE</span>
          </div>
          <p className="text-xs text-slate-300">
            Full resolution 48kHz / 24-bit WAV Master + 320kbps MP3 reference with embedded ID3 metadata.
          </p>
          <div className="text-[11px] font-mono text-slate-400 space-y-1">
            <div>Format: 24-bit / 48 kHz Linear PCM</div>
            <div>Loudness: -14.0 LUFS (-1.0 dBTP)</div>
          </div>
        </div>

        {/* Multi-Track Stem Bundle */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-cyan-400">
            <Layers className="w-4 h-4" />
          <span>MULTI-TRACK STEM BUNDLE</span>
          </div>
          <p className="text-xs text-slate-300">
            5 phase-aligned dry and wet stems (Drums, Keys, Lead Vocal, Marcus Bass, BGV Choir).
          </p>
          <div className="text-[11px] font-mono text-slate-400 space-y-1">
            <div>5 Stereo Stem WAVs (Zipped)</div>
            <div>Full mix headroom aligned</div>
          </div>
        </div>

        {/* Provenance & Rights Receipt */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>SEEDSIGNATURE™ RECEIPT</span>
          </div>
          <p className="text-xs text-slate-300">
            Cryptographic ledger proving 82% human creator origin for commercial licensing and streaming royalties.
          </p>
          <div className="text-[11px] font-mono text-slate-400 space-y-1">
            <div>Hash: ss_c09e7f...e409</div>
            <div>Status: Commercial Cleared</div>
          </div>
        </div>
      </div>

      {/* ISRC and Metadata Information */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3 font-mono text-xs">
        <span className="font-bold text-slate-200 uppercase">
          Streaming Metadata & Credits Manifest
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">TRACK TITLE</span>
            <span className="font-bold text-slate-200">Untitled Soul (Final Master)</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">ARTIST / CREATOR</span>
            <span className="font-bold text-slate-200">Creator Origin</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">ISRC CODE</span>
            <span className="font-bold text-slate-200">US-SLS-26-04912</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
            <span className="text-[10px] text-slate-500 block">GENRE & KEY</span>
            <span className="font-bold text-slate-200">Neo-Soul / C Minor (110 BPM)</span>
          </div>
        </div>
      </div>

      {/* Trigger Export Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="text-xs font-mono text-slate-400">
          Includes full SeedSignature verification certificate
        </div>

        <button
          onClick={handleDownload}
          disabled={isExporting}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isExporting ? 'Generating Bundle...' : downloadSuccess ? 'Master Package Ready!' : 'Download Complete Release Package'}</span>
        </button>
      </div>
    </div>
  );
};
