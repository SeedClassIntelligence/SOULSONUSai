import React from 'react';
import {
  Volume2,
  Cpu,
  Folder,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface StudioFooterProps {
  onOpenSeedSignature: () => void;
  onOpenRegistry: () => void;
}

export const StudioFooter: React.FC<StudioFooterProps> = ({
  onOpenSeedSignature,
  onOpenRegistry,
}) => {
  return (
    <footer className="h-6 bg-[#050810] border-t border-slate-800/80 px-3 flex items-center justify-between text-[10px] font-mono shrink-0 select-none text-slate-400 overflow-x-auto scrollbar-none">
      {/* Left side telemetry */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
          <Volume2 className="w-3 h-3" />
          <span>MASTER BUS: -0.5dB LIMITER ACTIVE</span>
        </div>

        <span className="text-slate-600">•</span>

        <div className="flex items-center space-x-1 text-cyan-400">
          <Cpu className="w-3 h-3" />
          <span>DSP CPU: 3%</span>
        </div>

        <span className="text-slate-600">•</span>

        <div className="flex items-center space-x-1 text-amber-400">
          <Folder className="w-3 h-3" />
          <span>PROJECT: Blank Canvas (Record Live) (v1.0.0)</span>
        </div>

        <span className="text-slate-600">•</span>

        <div className="flex items-center space-x-1 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>SAVED 08:59 AM</span>
        </div>

        <span className="text-slate-600">•</span>

        <span className="text-slate-500">BUILD: 63f37aa</span>
      </div>

      {/* Right side rights & seed signature */}
      <div className="flex items-center space-x-2.5 shrink-0 pl-3">
        <button
          onClick={onOpenSeedSignature}
          className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3" />
          <span>SEEDSIGNATURE: READY TO SIGN</span>
          <span className="text-slate-400">SIGNATURE: 0x1d388</span>
        </button>

        <span className="text-slate-600">•</span>

        <div className="flex items-center space-x-1 text-cyan-400">
          <Shield className="w-3 h-3" />
          <span>RIGHTS: 100% SoulSonus Master Creator</span>
        </div>

        <span className="text-slate-600">•</span>

        <div className="flex items-center space-x-1 text-purple-400">
          <Users className="w-3 h-3" />
          <span>COLLAB: 1 ACTIVE</span>
        </div>
      </div>
    </footer>
  );
};
