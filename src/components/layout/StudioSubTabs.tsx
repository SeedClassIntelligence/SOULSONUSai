import React from 'react';
import {
  Sparkles,
  Radio,
  Mic,
  Sliders,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { StudioTab } from '../../types/soulsonus';

interface StudioSubTabsProps {
  activeTab: StudioTab;
  onSelectTab: (tab: StudioTab) => void;
  onOpenIntelligence?: () => void;
  isIntelligenceOpen?: boolean;
}

export const StudioSubTabs: React.FC<StudioSubTabsProps> = ({
  activeTab,
  onSelectTab,
  onOpenIntelligence,
  isIntelligenceOpen = true,
}) => {
  const tabs: { key: StudioTab; label: string; icon: React.ReactNode }[] = [
    {
      key: 'CREATE',
      label: '1. CREATE',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      key: 'SOUNDS',
      label: '2. MY SOUNDS & TRAINING',
      icon: <Radio className="w-3.5 h-3.5" />,
    },
    {
      key: 'WRITE & RECORD',
      label: '3. WRITE & RECORD',
      icon: <Mic className="w-3.5 h-3.5" />,
    },
    {
      key: 'MIX',
      label: '4. MIX',
      icon: <Sliders className="w-3.5 h-3.5" />,
    },
    {
      key: 'MASTER',
      label: '5. MASTER',
      icon: <Activity className="w-3.5 h-3.5" />,
    },
    {
      key: 'RELEASE',
      label: '6. RELEASE',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="h-10 bg-[#070b14] border-b border-slate-800/80 px-4 flex items-center justify-between shrink-0 select-none font-mono">
      {/* Tab pills */}
      <div className="flex items-center space-x-2 sm:space-x-3 text-xs font-bold">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#121a2c] text-slate-100 border border-slate-600/90 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-black ring-1 ring-slate-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center space-x-2">
        <button className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded bg-[#0b1220] border border-amber-500/40 text-[11px] font-bold text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>BLANK CANVAS</span>
        </button>

        <button
          onClick={onOpenIntelligence}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded font-black text-xs shadow-md transition-all cursor-pointer ${
            isIntelligenceOpen
              ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.35)] ring-1 ring-amber-300'
              : 'bg-[#0b1220] border border-amber-500/50 text-amber-300 hover:bg-amber-500/20'
          }`}
          title={isIntelligenceOpen ? 'Collapse Studio Intelligence' : 'Expand Studio Intelligence'}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isIntelligenceOpen ? 'fill-slate-950 text-slate-950' : 'text-amber-400'}`} />
          <span>STUDIO INTELLIGENCE</span>
          <span className="text-[9px] opacity-75">{isIntelligenceOpen ? '◀' : '▶'}</span>
        </button>
      </div>
    </div>
  );
};
