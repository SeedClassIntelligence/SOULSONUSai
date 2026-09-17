import React from 'react';
import { SongSection } from '../../types/soulsonus';

interface SongSectionsBarProps {
  sections: SongSection[];
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
}

export const SongSectionsBar: React.FC<SongSectionsBarProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
      {sections.map((sec) => {
        const isActive = activeSectionId === sec.id;
        return (
          <button
            key={sec.id}
            onClick={() => onSelectSection(sec.id)}
            className={`flex-1 py-1.5 px-3 rounded text-center text-xs font-mono font-bold tracking-wider transition-all border ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            {sec.name}
          </button>
        );
      })}
    </div>
  );
};
