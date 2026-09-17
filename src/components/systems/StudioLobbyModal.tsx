import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Clock,
  Users,
  HardDrive,
  ShieldCheck,
  Cpu,
  X,
  Check,
  Layers,
} from 'lucide-react';
import { ProjectMetadata } from '../../types/soulsonus';

interface StudioLobbyModalProps {
  isOpen: boolean;
  metadata: ProjectMetadata;
  onClose: () => void;
  onSwitchProject: (projectName: string) => void;
  onCreateNewProject: (projectName: string, template: string) => void;
}

export const StudioLobbyModal: React.FC<StudioLobbyModalProps> = ({
  isOpen,
  metadata,
  onClose,
  onSwitchProject,
  onCreateNewProject,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('Neo-Soul / Gospel');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const recentSessions = [
    { name: 'Untitled Soul', rev: 28, lastEdited: 'Just now', time: '110 BPM · C Min', size: '248 MB', origin: '82%' },
    { name: 'Sunday Morning Groove', rev: 14, lastEdited: '2 days ago', time: '96 BPM · F Min', size: '180 MB', origin: '91%' },
    { name: 'Midnight In Brooklyn', rev: 41, lastEdited: 'Last week', time: '88 BPM · Eb Maj', size: '390 MB', origin: '78%' },
  ];

  const templates = [
    'Neo-Soul / Gospel (Booth + Marcus + Elena + BGV)',
    'Modern R&B Production (Trap Drums + 808 + Vocal)',
    'Acoustic Singer-Songwriter (Mic + Guitar + Strings)',
    'Blank Canvas Session (Zero Tracks)',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-wider">
                SoulSonus Studio Lobby
              </div>
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Project Home & Session Manager
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Top telemetry pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase flex items-center space-x-1">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloud Storage</span>
              </span>
              <div className="text-sm font-bold text-slate-200">1.4 GB / 50 GB</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active SeedSignature</span>
              </span>
              <div className="text-sm font-bold text-emerald-400">ss_c09e...e409</div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase flex items-center space-x-1">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Engine Runtime</span>
              </span>
              <div className="text-sm font-bold text-slate-200">4 Providers Active</div>
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-200 uppercase">Recent Sessions</span>
              <span className="text-slate-400">3 Persistent Projects</span>
            </div>

            <div className="space-y-2">
              {recentSessions.map((proj) => {
                const isCurrent = proj.name === metadata.name;
                return (
                  <div
                    key={proj.name}
                    onClick={() => {
                      onSwitchProject(proj.name);
                      onClose();
                    }}
                    className={`p-3 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-slate-950 border-amber-500 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="font-bold text-slate-100 text-xs">{proj.name}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-400 text-[11px]">Rev {proj.rev}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                            OPEN NOW
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {proj.time} · {proj.size} · Edited {proj.lastEdited}
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="text-[10px] text-slate-400 block">CREATOR ORIGIN</span>
                      <span className="text-amber-400 font-bold">{proj.origin}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New Project Creator Drawer */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center space-x-1.5">
                <Plus className="w-4 h-4" />
                <span>Start New Project Session</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">PROJECT TITLE</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Soul Revival 1974"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">STARTER TEMPLATE</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 outline-none focus:border-amber-500"
                >
                  {templates.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  if (newProjectName.trim()) {
                    onCreateNewProject(newProjectName.trim(), selectedTemplate);
                    onClose();
                  }
                }}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all disabled:opacity-40 cursor-pointer"
              >
                Create & Open Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
