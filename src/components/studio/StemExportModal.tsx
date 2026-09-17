import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  Sliders,
  FileArchive,
  Layers,
  Sparkles,
  Music2,
  FileText,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Track, ProjectMetadata } from '../../types/soulsonus';
import {
  exportStudioStemsZip,
  StemExportOptions,
  ExportProgress,
} from '../../services/stemExporter';

interface StemExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: ProjectMetadata;
  tracks: Track[];
}

export const StemExportModal: React.FC<StemExportModalProps> = ({
  isOpen,
  onClose,
  metadata,
  tracks,
}) => {
  const [options, setOptions] = useState<StemExportOptions>({
    includeWavStems: true,
    includeMidi: true,
    includeMasterStereo: true,
    includeSmirManifest: true,
    includeDawGuide: true,
    bitDepth: '24',
    sampleRate: '48k',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);
    setProgress({ stage: 'Initiating export...', percent: 5 });

    try {
      const zipBlob = await exportStudioStemsZip(metadata, tracks, options, (p) => {
        setProgress(p);
      });

      // Trigger automatic browser download
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_Stems_${metadata.bpm}BPM.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(true);
      setIsExporting(false);
    } catch (err) {
      console.error('Stem export failed:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-slate-950 border border-purple-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <FileArchive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                EXPORT MULTI-STEM DAW PACKAGE (.ZIP)
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {metadata.name} · {metadata.bpm} BPM · {metadata.key} · Ready for Ableton, Pro Tools & Logic
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Format Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Sample Rate</span>
              <div className="flex space-x-2">
                {(['48k', '44.1k'] as const).map((sr) => (
                  <button
                    key={sr}
                    onClick={() => setOptions({ ...options, sampleRate: sr })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all ${
                      options.sampleRate === sr
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {sr === '48k' ? '48 kHz (Broadcast)' : '44.1 kHz (CD)'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">Bit Depth</span>
              <div className="flex space-x-2">
                {(['24', '16'] as const).map((bd) => (
                  <button
                    key={bd}
                    onClick={() => setOptions({ ...options, bitDepth: bd })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border cursor-pointer transition-all ${
                      options.bitDepth === bd
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {bd}-bit Linear PCM
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Included Components Checklist */}
          <div className="space-y-2">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">Archive Contents</span>

            <div className="space-y-2 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeWavStems}
                  onChange={(e) => setOptions({ ...options, includeWavStems: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-200 flex-1">
                  Individual Audio Stems (Jay Drums, Elena Keys, Lead Vocal, Marcus Bass)
                </span>
                <span className="text-slate-500 text-[10px]">{tracks.length} Tracks</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeMasterStereo}
                  onChange={(e) => setOptions({ ...options, includeMasterStereo: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200 flex-1">Pre-Master Stereo Print (-14 LUFS Integrated)</span>
                <span className="text-slate-500 text-[10px]">WAV</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeMidi}
                  onChange={(e) => setOptions({ ...options, includeMidi: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <Music2 className="w-4 h-4 text-purple-400" />
                <span className="text-slate-200 flex-1">Standard MIDI Files (.mid SMF Type 0 for chord & melody)</span>
                <span className="text-slate-500 text-[10px]">MIDI</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeSmirManifest}
                  onChange={(e) => setOptions({ ...options, includeSmirManifest: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-200 flex-1">
                  SMIR Provenance Manifest & Cryptographic SeedSignatures (.json)
                </span>
                <span className="text-slate-500 text-[10px]">SHA-256</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeDawGuide}
                  onChange={(e) => setOptions({ ...options, includeDawGuide: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-0 bg-slate-950 border-slate-700"
                />
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-slate-200 flex-1">DAW Import Guide for Ableton, Logic, Pro Tools & FL Studio</span>
                <span className="text-slate-500 text-[10px]">TXT</span>
              </label>
            </div>
          </div>

          {/* Progress or Success view */}
          {isExporting && progress && (
            <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-300 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>{progress.stage}</span>
                </span>
                <span className="text-purple-200 font-bold">{progress.percent}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-center space-x-3 text-xs font-mono text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">Export complete!</span> Multi-stem ZIP archive downloaded directly to your
                downloads folder.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            Compliant with AES/EBU stem delivery guidelines & open standards
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs font-mono rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating ZIP...' : 'Package & Download ZIP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
