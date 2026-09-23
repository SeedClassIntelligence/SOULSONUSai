import React from 'react';
import { UserPlus, Plus } from 'lucide-react';
import { SessionPlayerPersona } from '../../types/soulsonus';

interface BandSessionRowProps {
  players: SessionPlayerPersona[];
  selectedPlayerId: string | null;
  onSelectPlayer: (player: SessionPlayerPersona) => void;
  onAddPlayerClick?: () => void;
}

export const BandSessionRow: React.FC<BandSessionRowProps> = ({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onAddPlayerClick,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-amber-400">THE BAND · SESSION PLAYERS</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">SoulSonus musicians; realization engines remain replaceable</span>
        </div>

        {onAddPlayerClick && (
          <button
            onClick={onAddPlayerClick}
            className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-mono text-[11px] font-bold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
          >
            <UserPlus className="w-3 h-3" />
            <span>+ Recruit Musician / Vocalist</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {players.map((p) => {
          const isSelected = selectedPlayerId === p.id;
          const isVocal = p.role.toLowerCase().includes('vocal');
          return (
            <div
              key={p.id}
              onClick={() => onSelectPlayer(p)}
              className={`p-3 rounded-lg border transition-all cursor-pointer select-none relative ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              {/* Name & Role */}
              <div className="flex items-baseline justify-between mb-1">
                <span className="font-bold text-xs tracking-wider text-slate-100 font-mono">
                  {p.name} · {p.role}
                </span>
              </div>

              {/* Tags */}
              <div className="text-[10px] text-slate-400 font-mono mb-2 truncate">
                {p.tags.join(' · ')}
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-1.5 text-[10px] font-mono font-medium">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    p.status === 'LISTENING READY'
                      ? 'bg-emerald-400 animate-pulse'
                      : p.status === 'HARMONY READY'
                      ? 'bg-purple-400'
                      : 'bg-cyan-400'
                  }`}
                />
                <span
                  className={
                    p.status === 'LISTENING READY'
                      ? 'text-emerald-400 font-semibold'
                      : p.status === 'HARMONY READY'
                      ? 'text-purple-300'
                      : 'text-cyan-400'
                  }
                >
                  {p.status}
                </span>
              </div>
            </div>
          );
        })}

        {/* Quick Add Player / Vocalist Tile */}
        {onAddPlayerClick && (
          <div
            onClick={onAddPlayerClick}
            className="p-3 rounded-lg border border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-950/50 hover:bg-amber-500/5 transition-all cursor-pointer select-none flex flex-col items-center justify-center text-center space-y-1 group min-h-[78px]"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 group-hover:bg-amber-500/20 border border-slate-700 group-hover:border-amber-500/50 flex items-center justify-center text-slate-400 group-hover:text-amber-400 transition-colors">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-mono font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
              + Add Musician / Vocalist
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

