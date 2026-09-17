import React, { useState } from 'react';
import {
  Wrench,
  ChevronRight,
  ChevronLeft,
  Mic2,
  Music,
  Piano,
  Grid,
  Database,
  Layers,
  Users,
  Radio,
  Sparkles,
  Sliders,
  Activity,
  ShieldCheck,
  Disc3,
  Compass,
  FileText,
  Brain,
  Cpu,
  Target,
  Eye,
} from 'lucide-react';
import { StudioRoom } from '../../types/soulsonus';

interface StudioSidebarProps {
  currentRoom: StudioRoom;
  onSelectRoom: (room: StudioRoom) => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  currentRoom,
  onSelectRoom,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const navItems: {
    room: StudioRoom;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      room: 'creator_training',
      label: 'Creator Training & My Sounds',
      icon: <Sparkles className="w-3.5 h-3.5" />,
      color: 'text-sky-400',
    },
    {
      room: 'booth',
      label: 'The Booth (Recording)',
      icon: <Mic2 className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
    },
    {
      room: 'piano_keys',
      label: 'Rhodes & Keys',
      icon: <Piano className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
    },
    {
      room: 'beat_machine',
      label: 'Beat Machine',
      icon: <Grid className="w-3.5 h-3.5" />,
      color: 'text-teal-400',
    },
    {
      room: 'instrument',
      label: 'Instrument Workstation',
      icon: <Database className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
    },
    {
      room: 'band',
      label: 'The Band (Session Players)',
      icon: <Users className="w-3.5 h-3.5" />,
      color: 'text-purple-400',
    },
    {
      room: 'collaboration',
      label: 'Collaboration Room',
      icon: <Users className="w-3.5 h-3.5" />,
      color: 'text-indigo-400',
    },
    {
      room: 'bgv',
      label: 'BGV Gospel Studio',
      icon: <Music className="w-3.5 h-3.5" />,
      color: 'text-pink-400',
    },
    {
      room: 'vocal_to_lyric',
      label: 'Vocal to Lyric Alignment',
      icon: <Radio className="w-3.5 h-3.5" />,
      color: 'text-rose-400',
    },
    {
      room: 'songwriting',
      label: 'Songwriting & Lyrics',
      icon: <FileText className="w-3.5 h-3.5" />,
      color: 'text-amber-300',
    },
    {
      room: 'mix',
      label: 'Multichannel Mix Desk',
      icon: <Sliders className="w-3.5 h-3.5" />,
      color: 'text-cyan-400',
    },
    {
      room: 'master',
      label: 'Mastering Suite',
      icon: <Activity className="w-3.5 h-3.5" />,
      color: 'text-blue-400',
    },
    {
      room: 'release',
      label: 'Release & Delivery',
      icon: <Disc3 className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
    },
    {
      room: 'smir_inspector',
      label: 'SMIR Intent Inspector',
      icon: <Eye className="w-3.5 h-3.5" />,
      color: 'text-yellow-400',
    },
    {
      room: 'pipeline',
      label: '11-Stage Pipeline',
      icon: <Brain className="w-3.5 h-3.5" />,
      color: 'text-purple-300',
    },
    {
      room: 'capability_registry',
      label: 'Capability Registry',
      icon: <Cpu className="w-3.5 h-3.5" />,
      color: 'text-cyan-300',
    },
    {
      room: 'seedsignature',
      label: 'SeedSignature™ Provenance',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      color: 'text-amber-400',
    },
    {
      room: 'calibration',
      label: 'Acoustic Calibration',
      icon: <Target className="w-3.5 h-3.5" />,
      color: 'text-teal-300',
    },
  ];

  return (
    <aside
      className={`bg-[#070b14] border-r border-slate-800/80 flex flex-col shrink-0 select-none py-2 transition-all duration-200 z-20 ${
        isExpanded ? 'w-56' : 'w-11'
      }`}
    >
      {/* Top Toggle Header */}
      <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/60 mb-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer w-full justify-center"
          title={isExpanded ? 'Collapse Rail' : 'Expand Sidebar'}
        >
          <Wrench className="w-3.5 h-3.5" />
          {isExpanded ? (
            <span className="text-[10px] font-mono font-bold flex-1 text-left pl-1">
              STUDIO TOOLS
            </span>
          ) : null}
          {isExpanded ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3 h-3 text-slate-500" />
          )}
        </button>
      </div>

      {/* Nav Icon Stack */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 px-1.5 scrollbar-none">
        {navItems.map((item) => {
          const isActive = currentRoom === item.room;
          return (
            <button
              key={item.room}
              onClick={() => onSelectRoom(item.room)}
              title={item.label}
              className={`w-full flex items-center rounded-lg py-1.5 transition-all cursor-pointer ${
                isExpanded ? 'px-2 space-x-2.5 text-left' : 'justify-center px-0'
              } ${
                isActive
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)] ring-1 ring-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <span className={isActive ? 'text-cyan-400' : item.color}>
                {item.icon}
              </span>
              {isExpanded && (
                <span className="text-xs font-mono font-medium truncate">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
