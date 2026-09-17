import React, { useState } from 'react';
import { X, Plus, Layers, PlayCircle, Radio, Music, Sliders, Check } from 'lucide-react';
import { CreatorSoundItem, SessionInterpretation } from '../../../types/creatorIntelligence';

interface AddToSessionModalProps {
  sound: CreatorSoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onConfirm: (sound: CreatorSoundItem, mode: SessionInterpretation, destination: 'playhead' | 'selected_track') => void;
}

const USE_MODES: { mode: SessionInterpretation; desc: string; icon: string }[] = [
  { mode: 'Original Audio', desc: 'Place untouched raw performance directly on track', icon: '🎙️' },
  { mode: 'Loop', desc: 'Seamlessly repeat across bars matching project BPM', icon: '🔁' },
  { mode: 'One-Shot', desc: 'Trigger as instantaneous percussive / melodic hit', icon: '🎯' },
  { mode: 'MIDI / Pattern', desc: 'Convert detected notes or transients into MIDI phrasing', icon: '🎹' },
  { mode: 'Layer With Sounds', desc: 'Blend with current track instruments as a ghost layer', icon: '🥞' },
  { mode: 'Vocal Reference', desc: 'Route to Vocal-to-Lyric alignment or guide bus', icon: '🗣️' },
  { mode: 'Instrument Reference', desc: 'Map as acoustic tuning reference for session players', icon: '🎸' },
];

export const AddToSessionModal: React.FC<AddToSessionModalProps> = ({
  sound,
  isOpen,
  onClose,
  projectName,
  onConfirm,
}) => {
  const [selectedMode, setSelectedMode] = useState<SessionInterpretation>('Original Audio');
  const [destination, setDestination] = useState<'playhead' | 'selected_track'>('playhead');

  if (!isOpen || !sound) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-[#060a17] border border-slate-800/90 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold">
              Add Sound to Session
            </div>
            <h3 className="text-lg font-black text-slate-100 font-mono tracking-tight mt-0.5">
              {sound.name}
            </h3>
            <div className="text-xs text-slate-400 font-mono">
              Target Project: <span className="text-sky-300 font-bold">{projectName}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. How would you like to use this sound? */}
        <div className="space-y-2.5">
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            1. How would you like to use it?
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
            {USE_MODES.map((item) => (
              <button
                key={item.mode}
                onClick={() => setSelectedMode(item.mode)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedMode === item.mode
                    ? 'bg-[#0f1b38] border-sky-500 text-white shadow-md'
                    : 'bg-[#080d20] border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-mono font-bold">{item.mode}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-sans mt-1">
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Destination */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            2. Destination in {projectName}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDestination('playhead')}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                destination === 'playhead'
                  ? 'bg-[#0b221f] border-emerald-500 text-white'
                  : 'bg-[#080d20] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-mono font-bold text-emerald-300">
                Add at Playhead
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Insert at active transport position (Bar 04.2)
              </div>
            </button>

            <button
              onClick={() => setDestination('selected_track')}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                destination === 'selected_track'
                  ? 'bg-[#0b221f] border-emerald-500 text-white'
                  : 'bg-[#080d20] border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-mono font-bold text-emerald-300">
                Add to Selected Track
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Target currently highlighted DAW channel strip
              </div>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(sound, selectedMode, destination);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold flex items-center space-x-1.5 shadow-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Confirm &amp; Place in Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
