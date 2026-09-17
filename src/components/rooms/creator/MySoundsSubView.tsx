import React, { useState, useRef } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Play,
  Pause,
  Star,
  MoreVertical,
  Radio,
  FileAudio,
  Sparkles,
  Layers,
  Trash2,
  Copy,
  Edit2,
  Tag,
  Mic,
  Music2,
  Sliders,
  Check,
} from 'lucide-react';
import { CreatorSoundItem, SessionInterpretation } from '../../../types/creatorIntelligence';
import { SoundDetailDrawer } from './SoundDetailDrawer';
import { AddToSessionModal } from './AddToSessionModal';
import { audioEngine } from '../../../services/audioEngine';
import { assetStore } from '../../../services/assetStore';

interface MySoundsSubViewProps {
  sounds: CreatorSoundItem[];
  projectName: string;
  onRecordNewClick: () => void;
  onImportAudio: (file: File) => void;
  onUpdateSounds: (sounds: CreatorSoundItem[]) => void;
  onAddToSessionConfirm: (
    sound: CreatorSoundItem,
    mode: SessionInterpretation,
    destination: 'playhead' | 'selected_track'
  ) => void;
}

const CATEGORIES = [
  'All',
  'Voice',
  'Vocals',
  'Beatbox',
  'Drums',
  'Hum',
  'Melodies',
  'Spoken Ideas',
  'Instrument',
  'Textures',
  'Ad-libs',
  'Loops',
  'One-Shots',
  'Favorites',
  'Recently Created',
];

export const MySoundsSubView: React.FC<MySoundsSubViewProps> = ({
  sounds,
  projectName,
  onRecordNewClick,
  onImportAudio,
  onUpdateSounds,
  onAddToSessionConfirm,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'duration'>('recent');
  const [auditioningId, setAuditioningId] = useState<string | null>(null);
  const [selectedSoundDetail, setSelectedSoundDetail] = useState<CreatorSoundItem | null>(null);
  const [sessionTargetSound, setSessionTargetSound] = useState<CreatorSoundItem | null>(null);
  const [actionMenuSoundId, setActionMenuSoundId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAudition = async (sound: CreatorSoundItem) => {
    if (auditioningId === sound.id) {
      setAuditioningId(null);
      return;
    }
    setAuditioningId(sound.id);

    if (sound.assetId) {
      const asset = await assetStore.getAsset(sound.assetId);
      if (asset && (asset.blobUrl || asset.blob)) {
        audioEngine.playAudioBlob(asset.blobUrl || asset.blob!);
        setTimeout(() => setAuditioningId(null), Math.max(1200, (asset.durationSeconds || 1) * 1000));
        return;
      }
    }

    if (sound.audioFreqOrType === 'kick') {
      audioEngine.playDrum('kick');
    } else if (sound.audioFreqOrType === 'snare') {
      audioEngine.playDrum('snare');
    } else if (sound.audioFreqOrType === 'hihat') {
      audioEngine.playDrum('hihat');
    } else if (sound.audioFreqOrType === 'clap') {
      audioEngine.playDrum('clap');
    } else if (sound.audioFreqOrType === 'hum') {
      audioEngine.playNote(174.61, 'triangle', 1.2);
      setTimeout(() => audioEngine.playNote(207.65, 'sine', 0.8), 240);
    } else {
      audioEngine.playNote(261.63, 'sine', 0.4);
      setTimeout(() => audioEngine.playNote(311.13, 'sine', 0.4), 180);
    }

    setTimeout(() => {
      setAuditioningId(null);
    }, 1000);
  };

  const toggleFavorite = (soundId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateSounds(
      sounds.map((s) => (s.id === soundId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
    showNotification('Favorites updated');
  };

  const handleDeleteSound = (soundId: string) => {
    onUpdateSounds(sounds.filter((s) => s.id !== soundId));
    setActionMenuSoundId(null);
    showNotification('Sound removed from Creator Roots');
  };

  const handleDuplicateSound = (sound: CreatorSoundItem) => {
    const duplicated: CreatorSoundItem = {
      ...sound,
      id: `sound-${Date.now()}`,
      name: `${sound.name} (Copy)`,
      dateCaptured: 'Today',
      isFavorite: false,
    };
    onUpdateSounds([duplicated, ...sounds]);
    setActionMenuSoundId(null);
    showNotification(`Duplicated "${sound.name}"`);
  };

  const handleRenameSound = (sound: CreatorSoundItem) => {
    const newName = window.prompt('Rename sound:', sound.name);
    if (newName && newName.trim()) {
      onUpdateSounds(
        sounds.map((s) => (s.id === sound.id ? { ...s, name: newName.trim() } : s))
      );
      showNotification('Sound renamed');
    }
    setActionMenuSoundId(null);
  };

  // Filtering & Sorting
  const filteredSounds = sounds
    .filter((sound) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = sound.name.toLowerCase().includes(query);
        const matchesRole = sound.musicalRole.toLowerCase().includes(query);
        const matchesTag = sound.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchesName && !matchesRole && !matchesTag) return false;
      }

      // Category chip filter
      if (activeCategory === 'All') return true;
      if (activeCategory === 'Favorites') return sound.isFavorite;
      if (activeCategory === 'Recently Created') return true; // already sorted
      if (activeCategory === 'Ad-libs') return sound.tags.includes('ad-lib') || sound.category === 'Ad-libs';
      if (activeCategory === 'Loops') return sound.tags.includes('loop') || sound.category === 'Loops';
      if (activeCategory === 'One-Shots') return sound.tags.includes('one-shot') || sound.category === 'One-Shots';
      if (activeCategory === 'Spoken Ideas') return sound.tags.includes('spoken') || sound.category === 'Spoken Ideas';
      if (activeCategory === 'Melodies') return sound.category === 'Melodies' || sound.category === 'Hum';
      if (activeCategory === 'Vocals') return sound.category === 'Voice' || sound.category === 'Vocals';
      return sound.category.toLowerCase() === activeCategory.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'duration') return a.duration.localeCompare(b.duration);
      return 0; // Default recent insertion order
    });

  return (
    <div className="space-y-6 animate-fade-in">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onImportAudio(e.target.files[0]);
          }
        }}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase">
            CREATOR INTELLIGENCE · MEMORY BANK
          </div>
          <h2 className="text-2xl lg:text-3xl font-black text-slate-100 font-mono tracking-tight mt-0.5">
            My Sounds &amp; Creator Roots
          </h2>
          <p className="text-xs lg:text-sm text-slate-400 mt-1 max-w-2xl font-sans">
            Your personal library of sounds, performances, ideas, and sonic building blocks. Stored as permanent, non-destructive source material.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 rounded-xl bg-[#080d22] hover:bg-[#0e1634] border border-slate-700/80 text-slate-200 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-sky-400" />
            <span>Import Audio</span>
          </button>

          <button
            onClick={onRecordNewClick}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record New Sound</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fade-in shadow-md">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Search, Filter Bar, & Sort */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sounds, roles, tags (#beatbox, #kick, #vocal)..."
            className="w-full bg-[#070b1a] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
          />
        </div>

        {/* Sort Dropdown & Count */}
        <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
          <span className="hidden sm:inline">
            <strong className="text-slate-200">{filteredSounds.length}</strong> sounds available
          </span>
          <div className="flex items-center space-x-1.5 bg-[#070b1a] border border-slate-800 rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="recent" className="bg-slate-900">Sort: Recently Created</option>
              <option value="name" className="bg-slate-900">Sort: Name (A-Z)</option>
              <option value="duration" className="bg-slate-900">Sort: Duration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Filter Chips Horizontal Row */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-sky-500/20 border border-sky-400/80 text-sky-300 font-bold shadow-sm'
                : 'bg-[#070c1e] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid of Sound Cards */}
      {filteredSounds.length === 0 ? (
        <div className="p-12 text-center bg-[#070b1a] border border-slate-800/80 rounded-2xl space-y-3">
          <FileAudio className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-200 font-mono">No sounds match this filter</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            Start a quick training session to capture raw beatbox, humming, or vocal ad-libs into your personal sound memory.
          </p>
          <button
            onClick={onRecordNewClick}
            className="mt-2 px-4 py-2 bg-sky-500 text-slate-950 font-mono font-bold text-xs rounded-xl shadow-md cursor-pointer hover:bg-sky-400 transition-colors inline-flex items-center space-x-1.5"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Open Creator Training</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSounds.map((sound) => {
            const isPlaying = auditioningId === sound.id;
            return (
              <div
                key={sound.id}
                onClick={() => setSelectedSoundDetail(sound)}
                className="bg-[#070b1a] border border-slate-800 hover:border-sky-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all duration-200 shadow-md group cursor-pointer relative"
              >
                {/* Top Row: Name, Category, Favorite, Menu */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-sky-400 font-bold">
                        {sound.category}
                      </span>
                      {sound.key && (
                        <span className="text-[10px] font-mono text-purple-300 font-bold">
                          {sound.key}
                        </span>
                      )}
                      {sound.bpm && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {sound.bpm} BPM
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-100 font-mono group-hover:text-sky-300 transition-colors leading-tight">
                      {sound.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Role: <strong className="text-slate-300">{sound.musicalRole}</strong> · {sound.duration}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => toggleFavorite(sound.id, e)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        sound.isFavorite
                          ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                          : 'border-slate-800 text-slate-600 hover:text-slate-300'
                      }`}
                      title={sound.isFavorite ? 'Favorited' : 'Add to Favorites'}
                    >
                      <Star className={`w-3.5 h-3.5 ${sound.isFavorite ? 'fill-current' : ''}`} />
                    </button>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActionMenuSoundId(actionMenuSoundId === sound.id ? null : sound.id);
                        }}
                        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {actionMenuSoundId === sound.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-8 w-44 bg-[#080d22] border border-slate-700 rounded-xl p-1.5 shadow-2xl z-30 space-y-0.5 text-xs font-mono"
                        >
                          <button
                            onClick={() => handleRenameSound(sound)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={() => handleDuplicateSound(sound)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Duplicate</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSoundDetail(sound);
                              setActionMenuSoundId(null);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left text-purple-300 hover:bg-purple-950/40 flex items-center space-x-2"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Analyze Details</span>
                          </button>
                          <div className="border-t border-slate-800 my-1" />
                          <button
                            onClick={() => handleDeleteSound(sound.id)}
                            className="w-full px-2.5 py-1.5 rounded-lg text-left text-rose-400 hover:bg-rose-950/40 flex items-center space-x-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Simulated Waveform Preview Bar */}
                <div className="h-10 bg-[#040712] rounded-xl border border-slate-800/80 p-2 flex items-center justify-between space-x-1 overflow-hidden">
                  {Array.from({ length: 24 }).map((_, idx) => {
                    const height = 20 + ((idx * 17) % 65);
                    return (
                      <div
                        key={idx}
                        style={{ height: `${height}%` }}
                        className={`w-1 rounded-full transition-all ${
                          isPlaying
                            ? 'bg-sky-400 animate-pulse'
                            : 'bg-slate-700 group-hover:bg-sky-500/50'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Tags & Captured Source */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
                  <div className="flex items-center space-x-1 truncate max-w-[65%]">
                    <Tag className="w-3 h-3 text-slate-600 shrink-0" />
                    <span className="truncate">{sound.tags.slice(0, 2).map((t) => `#${t}`).join(' ')}</span>
                  </div>
                  <span>{sound.dateCaptured}</span>
                </div>

                {/* Action Buttons: Audition + + Add to Session */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center space-x-2 pt-2 border-t border-slate-800/80"
                >
                  <button
                    onClick={() => handleAudition(sound)}
                    className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                      isPlaying
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'bg-[#0a1024] border border-slate-700 text-slate-200 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isPlaying ? 'Pause' : 'Audition'}
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setSessionTargetSound(sound)}
                    className="flex-1 bg-[#09122a] hover:bg-[#12234e] border border-slate-700 hover:border-sky-500/70 text-slate-200 hover:text-sky-300 text-xs font-mono font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add to Session</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Sound Detail Drawer */}
      <SoundDetailDrawer
        sound={selectedSoundDetail}
        onClose={() => setSelectedSoundDetail(null)}
        projectName={projectName}
        onAddToSession={(s) => setSessionTargetSound(s)}
      />

      {/* Add To Session Modal */}
      <AddToSessionModal
        sound={sessionTargetSound}
        isOpen={Boolean(sessionTargetSound)}
        onClose={() => setSessionTargetSound(null)}
        projectName={projectName}
        onConfirm={(sound, mode, dest) => {
          onAddToSessionConfirm(sound, mode, dest);
          showNotification(`Added "${sound.name}" as [${mode}] to ${projectName}!`);
        }}
      />
    </div>
  );
};
