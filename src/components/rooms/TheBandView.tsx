import React, { useState } from 'react';
import {
  Users,
  Music,
  Sliders,
  Sparkles,
  Play,
  RotateCcw,
  Check,
  Plus,
  Volume2,
  GitBranch,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { SessionPlayerPersona } from '../../types/soulsonus';
import { audioEngine } from '../../services/audioEngine';
import { RecruitPlayerModal } from './RecruitPlayerModal';

interface TheBandViewProps {
  players: SessionPlayerPersona[];
  onUpdatePlayerTake: (playerId: string, takeId: number) => void;
  onInstructPlayer: (playerId: string, instruction: string) => void;
  onAddPlayer: (newPlayer: SessionPlayerPersona, createDawTrack?: boolean) => void;
  onDeletePlayer?: (playerId: string) => void;
}

export const TheBandView: React.FC<TheBandViewProps> = ({
  players,
  onUpdatePlayerTake,
  onInstructPlayer,
  onAddPlayer,
  onDeletePlayer,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(
    players[0]?.id || 'player_marcus'
  );
  const [instructionText, setInstructionText] = useState<string>('Marcus, stay out of the vocal.');
  const [hearingSection, setHearingSection] = useState<string>('VERSE 1');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('Fender Jazz Bass 1974 (Flatwounds)');
  const [isCompingActive, setIsCompingActive] = useState<boolean>(false);
  const [takeA, setTakeA] = useState<number>(1);
  const [takeB, setTakeB] = useState<number>(3);
  const [compSplitBar, setCompSplitBar] = useState<number>(4);

  // Modal and Delete confirmation state
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activePlayer = players.find((p) => p.id === selectedPlayerId) || players[0];

  const instrumentsList = [
    activePlayer?.instrument || 'Standard Instrument',
    'Fender Jazz Bass 1974 (Flatwounds)',
    'Upright Acoustic Double Bass (Gut Strings)',
    '1968 Precision Bass (Sponge Muted)',
    '1962 Fender Stratocaster',
    'Yamaha C7 Concert Grand',
    'Fender Rhodes Stage 73',
    'Moog Minitaur Analog Sub Bass',
  ];

  const handlePlayTake = (takeId: number) => {
    // Play demonstration tone
    audioEngine.playNote(takeId === 1 ? 65.41 : takeId === 2 ? 77.78 : 87.31, 'sawtooth', 0.6);
  };

  const handleApplyComp = () => {
    setIsCompingActive(false);
    if (!activePlayer) return;
    onInstructPlayer(
      activePlayer.id,
      `Comped: Bars 1-${compSplitBar} from Take ${takeA}, Bars ${compSplitBar + 1}-8 from Take ${takeB}`
    );
  };

  const handleRecruit = (newPlayer: SessionPlayerPersona, createDawTrack: boolean) => {
    onAddPlayer(newPlayer, createDawTrack);
    setSelectedPlayerId(newPlayer.id);
  };

  const handleDeleteActivePlayer = (playerId: string) => {
    if (onDeletePlayer) {
      onDeletePlayer(playerId);
      const remaining = players.filter((p) => p.id !== playerId);
      if (remaining.length > 0) {
        setSelectedPlayerId(remaining[0].id);
      }
    }
    setConfirmDeleteId(null);
  };

  if (!activePlayer && players.length === 0) {
    return (
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-8 text-center space-y-4">
        <Users className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
        <h3 className="text-lg font-bold text-slate-100 font-mono">No Session Players in Band</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          You have dismissed all session players. Recruit musicians and background vocalists to accompany your session.
        </p>
        <button
          onClick={() => setIsRecruitModalOpen(true)}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center space-x-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Recruit Session Players</span>
        </button>
        <RecruitPlayerModal
          isOpen={isRecruitModalOpen}
          onClose={() => setIsRecruitModalOpen(false)}
          onRecruitPlayer={handleRecruit}
          existingPlayerIds={players.map((p) => p.id)}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Recruit Modal */}
      <RecruitPlayerModal
        isOpen={isRecruitModalOpen}
        onClose={() => setIsRecruitModalOpen(false)}
        onRecruitPlayer={handleRecruit}
        existingPlayerIds={players.map((p) => p.id)}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              THE BAND · SESSION PLAYER STUDIO
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Direct live musicians naturally. Persona, pocket, and intent remain intact across all realization engines.
            </p>
          </div>
        </div>

        {/* Player Switcher Tabs & + Recruit Button */}
        <div className="flex items-center space-x-2 flex-wrap gap-1">
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlayerId(p.id)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedPlayerId === p.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {/* + Add Player / Vocalist Button */}
          <button
            onClick={() => setIsRecruitModalOpen(true)}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 border border-amber-500/50 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
            title="Add or recruit new session player / vocalist"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Add Player / Vocalist</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid: Persona & Directing Left, Takes & Realization Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Musician Persona & Natural Language Directing */}
        <div className="lg:col-span-6 space-y-4">
          {/* Persona Card */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider">
                  Session Persona Card
                </span>
                <h3 className="text-base font-bold text-slate-100 font-mono">
                  {activePlayer.name} · {activePlayer.role}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                  {activePlayer.status}
                </span>

                {/* Dismiss / Delete Player Button */}
                {confirmDeleteId === activePlayer.id ? (
                  <div className="flex items-center space-x-1 bg-rose-950/80 border border-rose-500/60 rounded px-2 py-0.5">
                    <span className="text-[10px] text-rose-300 font-mono">Dismiss?</span>
                    <button
                      onClick={() => handleDeleteActivePlayer(activePlayer.id)}
                      className="text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-1.5 py-0.2 rounded"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-[10px] text-slate-400 hover:text-white px-1"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(activePlayer.id)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-colors cursor-pointer"
                    title={`Dismiss ${activePlayer.name} from session band`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {activePlayer.bio}
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 space-y-1.5 font-mono text-[11px]">
              <span className="text-slate-400 uppercase text-[9px] font-bold block">
                Active Architectural Rules
              </span>
              {activePlayer.rules.map((rule, idx) => (
                <div key={idx} className="flex items-start space-x-1.5 text-slate-300">
                  <span className="text-amber-400">▸</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            {/* Instrument Selection (Swap instrument while retaining groove) */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 font-bold">PHYSICAL INSTRUMENT</span>
                <span className="text-emerald-400 text-[10px]">Retains {activePlayer.name} Intent</span>
              </div>
              <select
                value={selectedInstrument}
                onChange={(e) => setSelectedInstrument(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-amber-500"
              >
                {instrumentsList.map((inst, idx) => (
                  <option key={idx} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Natural Direction Console */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DIRECT {activePlayer.name} NATURALLY</span>
              </span>
              <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                <span>Hears:</span>
                <select
                  value={hearingSection}
                  onChange={(e) => setHearingSection(e.target.value)}
                  className="bg-slate-950 text-slate-200 border border-slate-800 rounded px-1.5 py-0.5 text-[10px]"
                >
                  <option value="VERSE 1">Verse 1 (Bars 5-12)</option>
                  <option value="CHORUS">Chorus (Bars 13-20)</option>
                  <option value="FULL MIX">Full Mix Reference</option>
                  <option value="KICK ONLY">Kick Drum Solo</option>
                </select>
              </div>
            </div>

            <textarea
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 text-slate-200 border border-slate-700/80 rounded-lg p-2.5 text-xs font-mono outline-none focus:border-amber-500"
              placeholder={`Instruct ${activePlayer.name} (e.g. "Stay out of the vocal", "Walk into chorus")...`}
            />

            <div className="flex items-center justify-between">
              <div className="text-[10px] text-slate-400 font-mono">
                Preserves: Harmonic anchor & Jay kick lock
              </div>
              <button
                onClick={() => onInstructPlayer(activePlayer.id, instructionText)}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all cursor-pointer"
              >
                Send Direction
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Takes, Revision Comping, & Sound Engine */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wide">
                Available Takes & Performance Variations
              </span>
              <button
                onClick={() => setIsCompingActive(!isCompingActive)}
                className={`text-[10px] font-mono px-2.5 py-1 rounded border transition-colors ${
                  isCompingActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {isCompingActive ? 'Cancel Comping' : 'Open Comping Editor'}
              </button>
            </div>

            {/* Takes List */}
            <div className="space-y-2">
              {activePlayer.takes.map((take) => {
                const isActive = activePlayer.activeTake === take.id;
                return (
                  <div
                    key={take.id}
                    className={`p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-slate-950 border-amber-500/80 shadow-sm ring-1 ring-amber-500/30'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-slate-200">
                          {take.title}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                            ON TIMELINE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handlePlayTake(take.id)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="Audition Take"
                        >
                          <Play className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onUpdatePlayerTake(activePlayer.id, take.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors ${
                            isActive
                              ? 'bg-amber-500 text-slate-950 font-bold'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Select'}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-2">{take.description}</p>

                    <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-500">
                      <span>Vibe: <strong className="text-slate-300">{take.grooveVibe}</strong></span>
                      <span>Flavor: <strong className="text-slate-300">{take.harmonicFlavor}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Comping Tool Drawer */}
            {isCompingActive && (
              <div className="p-3.5 bg-slate-950 rounded-lg border border-cyan-500/40 space-y-3 mt-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-cyan-400">
                  <div className="flex items-center space-x-1.5">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>TAKE COMPING SLICE ENGINE</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Non-destructive</span>
                </div>

                <p className="text-xs text-slate-300">
                  Combine the best phrasing from multiple takes seamlessly:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">FIRST HALF (Bars 1-{compSplitBar})</label>
                    <select
                      value={takeA}
                      onChange={(e) => setTakeA(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    >
                      <option value={1}>Take 1 (Strict Pocket)</option>
                      <option value={2}>Take 2 (Melodic Neo-Soul)</option>
                      <option value={3}>Take 3 (Live Gospel)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">SECOND HALF (Bars {compSplitBar + 1}-8)</label>
                    <select
                      value={takeB}
                      onChange={(e) => setTakeB(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                    >
                      <option value={1}>Take 1 (Strict Pocket)</option>
                      <option value={2}>Take 2 (Melodic Neo-Soul)</option>
                      <option value={3}>Take 3 (Live Gospel)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                    <span>SPLIT SPLICE POINT: BAR {compSplitBar}</span>
                    <span>Crossfade: 15ms</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={6}
                    value={compSplitBar}
                    onChange={(e) => setCompSplitBar(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleApplyComp}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded shadow transition-colors flex items-center justify-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Build Comped Take ({`Take ${takeA} + Take ${takeB}`})</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
