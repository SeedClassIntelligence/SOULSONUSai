import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Square,
  Sparkles,
  Download,
  Plus,
  Trash2,
  Sliders,
  Music2,
  Check,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';
import { generateStandardMidiFile } from '../../services/stemExporter';

export interface MidiNote {
  id: string;
  noteNumber: number; // MIDI note number e.g. 60 = C4
  startStep: number; // 16th note steps (0 to 63 for 4 bars)
  durationSteps: number; // in 16th notes
  velocity: number; // 1 to 127
}

interface MidiPianoRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  bpm?: number;
  initialNotes?: { note: string; midi: number; startTime: number; duration: number }[];
  initialTitle?: string;
  clipTitle?: string;
  onCommitToTrack?: (trackId: string, notesSummary: string, midiNotes: MidiNote[]) => void;
  onCommitNotes?: (notes: MidiNote[]) => void;
}

// Note mapping helpers
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function midiToNoteName(midi: number): string {
  const octave = Math.floor(midi / 12) - 1;
  const noteIndex = midi % 12;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function isBlackKey(midi: number): boolean {
  const noteIndex = midi % 12;
  return [1, 3, 6, 8, 10].includes(noteIndex);
}

// Musical scales in C
const SCALES: Record<string, number[]> = {
  'C Minor': [0, 2, 3, 5, 7, 8, 10], // C, D, Eb, F, G, Ab, Bb
  'C Dorian (Neo-Soul)': [0, 2, 3, 5, 7, 9, 10], // C, D, Eb, F, G, A, Bb
  'Gospel Blues': [0, 3, 5, 6, 7, 10], // C, Eb, F, F#, G, Bb
  'Minor Pentatonic': [0, 3, 5, 7, 10],
  Chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

export const MidiPianoRollModal: React.FC<MidiPianoRollModalProps> = ({
  isOpen,
  onClose,
  bpm = 92,
  initialNotes,
  initialTitle = 'Vocal-to-MIDI Melody Roll',
  clipTitle,
  onCommitToTrack,
  onCommitNotes,
}) => {
  // Range from C2 (36) to C5 (72)
  const minMidi = 40; // E2
  const maxMidi = 72; // C5
  const totalSteps = 64; // 4 bars of 16th notes

  // Internal MIDI Notes state
  const [notes, setNotes] = useState<MidiNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedScale, setSelectedScale] = useState<string>('C Minor');
  const [selectedTrack, setSelectedTrack] = useState<string>('t2'); // Elena Keys
  const [quantizeMode, setQuantizeMode] = useState<'none' | '16th' | 'swing' | '8th'>('16th');
  const [activeNoteAudition, setActiveNoteAudition] = useState<number | null>(null);
  const [committedNotice, setCommittedNotice] = useState<string | null>(null);

  const playbackTimerRef = useRef<number | null>(null);

  // Initialize notes from props or default Neo-Soul progression
  useEffect(() => {
    if (initialNotes && initialNotes.length > 0) {
      const converted: MidiNote[] = initialNotes.map((n, i) => {
        // Convert startTime in seconds to 16th steps
        const stepDurationSec = 60 / bpm / 4;
        const startStep = Math.min(totalSteps - 2, Math.max(0, Math.round(n.startTime / stepDurationSec)));
        const durationSteps = Math.max(1, Math.min(8, Math.round(n.duration / stepDurationSec)));
        return {
          id: `note_${i}_${Date.now()}`,
          noteNumber: Math.min(maxMidi, Math.max(minMidi, n.midi)),
          startStep,
          durationSteps,
          velocity: 96,
        };
      });
      setNotes(converted);
    } else {
      // Default initial melodic motif
      setNotes([
        { id: 'n1', noteNumber: 60, startStep: 0, durationSteps: 3, velocity: 90 }, // C4
        { id: 'n2', noteNumber: 63, startStep: 4, durationSteps: 4, velocity: 95 }, // Eb4
        { id: 'n3', noteNumber: 65, startStep: 8, durationSteps: 2, velocity: 88 }, // F4
        { id: 'n4', noteNumber: 67, startStep: 12, durationSteps: 4, velocity: 102 }, // G4
        { id: 'n5', noteNumber: 65, startStep: 16, durationSteps: 3, velocity: 92 }, // F4
        { id: 'n6', noteNumber: 63, startStep: 20, durationSteps: 4, velocity: 96 }, // Eb4
        { id: 'n7', noteNumber: 58, startStep: 26, durationSteps: 6, velocity: 90 }, // Bb3
        { id: 'n8', noteNumber: 60, startStep: 32, durationSteps: 8, velocity: 105 }, // C4
      ]);
    }
  }, [initialNotes, bpm]);

  // Audio tone preview helper
  const previewNoteSound = (midi: number) => {
    const freq = midiToFrequency(midi);
    audioEngine.playNote(freq, 'triangle', 0.25);
    setActiveNoteAudition(midi);
    setTimeout(() => setActiveNoteAudition(null), 250);
  };

  // Playhead playback loop
  useEffect(() => {
    if (!isPlaying) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      return;
    }

    const stepMs = (60 / bpm / 4) * 1000;
    playbackTimerRef.current = window.setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % totalSteps;
        // Check if any note triggers on this step
        const triggered = notes.filter((n) => n.startStep === next);
        triggered.forEach((n) => {
          previewNoteSound(n.noteNumber);
        });
        return next;
      });
    }, stepMs);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, bpm, notes]);

  // Click on grid to add or select note
  const handleGridClick = (midi: number, step: number) => {
    // Check if clicked on existing note
    const existing = notes.find((n) => n.noteNumber === midi && step >= n.startStep && step < n.startStep + n.durationSteps);
    if (existing) {
      setSelectedNoteId(existing.id);
      previewNoteSound(existing.noteNumber);
      return;
    }

    // Otherwise create new note
    const newNote: MidiNote = {
      id: `n_${Date.now()}`,
      noteNumber: midi,
      startStep: step,
      durationSteps: 2,
      velocity: 96,
    };
    setNotes((prev) => [...prev, newNote]);
    setSelectedNoteId(newNote.id);
    previewNoteSound(midi);
  };

  // Delete selected note
  const handleDeleteSelected = () => {
    if (!selectedNoteId) return;
    setNotes((prev) => prev.filter((n) => n.id !== selectedNoteId));
    setSelectedNoteId(null);
  };

  // Quantize notes
  const handleQuantize = (mode: '16th' | 'swing' | '8th') => {
    setQuantizeMode(mode);
    setNotes((prev) =>
      prev.map((n) => {
        let quantizedStart = n.startStep;
        if (mode === '8th') {
          quantizedStart = Math.round(n.startStep / 2) * 2;
        } else if (mode === '16th') {
          quantizedStart = Math.round(n.startStep);
        } else if (mode === 'swing') {
          // 62% SoulSonus laid-back pocket on offbeat 16ths
          if (n.startStep % 2 === 1) {
            quantizedStart = n.startStep; // retains swung placement
          }
        }
        return {
          ...n,
          startStep: Math.max(0, Math.min(totalSteps - 1, quantizedStart)),
        };
      })
    );
  };

  // Transpose notes up or down
  const handleTranspose = (semitones: number) => {
    setNotes((prev) =>
      prev.map((n) => ({
        ...n,
        noteNumber: Math.max(minMidi, Math.min(maxMidi, n.noteNumber + semitones)),
      }))
    );
  };

  // Export MIDI .mid file
  const handleDownloadMidi = () => {
    const converted = notes.map((n) => ({
      noteNumber: n.noteNumber,
      startBarFraction: n.startStep / 16,
      durationBarFraction: n.durationSteps / 16,
      velocity: n.velocity,
    }));
    const midiBytes = generateStandardMidiFile(converted, bpm);
    const blob = new Blob([midiBytes.buffer as ArrayBuffer], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(clipTitle || initialTitle).replace(/[^a-zA-Z0-9]/g, '_')}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Commit notes to DAW track
  const handleCommit = () => {
    const notesSummary = `${notes.length} notes in ${selectedScale} (${midiToNoteName(notes[0]?.noteNumber || 60)} motif)`;
    if (onCommitToTrack) {
      onCommitToTrack(selectedTrack, notesSummary, notes);
    }
    if (onCommitNotes) {
      onCommitNotes(notes);
    }
    setCommittedNotice(`Successfully committed ${notes.length} MIDI notes to Track ${selectedTrack.toUpperCase()}!`);
    setTimeout(() => {
      setCommittedNotice(null);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  // Build rows array from maxMidi down to minMidi
  const midiRows: number[] = [];
  for (let m = maxMidi; m >= minMidi; m--) {
    midiRows.push(m);
  }

  const activeScaleNotes = SCALES[selectedScale] || SCALES['C Minor'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-slate-950 border border-purple-500/40 rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">{initialTitle}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                  Spotify Basic Pitch Adapter
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Interactive Piano Roll · {bpm} BPM · {notes.length} Note Events · Chromatic Range E2 - C5
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Stop' : 'Audition Roll'}</span>
            </button>

            <button
              onClick={handleDownloadMidi}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-semibold cursor-pointer"
              title="Download Standard MIDI File (.mid)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MID</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Scale, Quantize, Transpose, Destination */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-slate-900/60 border-b border-slate-800 text-xs font-mono">
          <div className="flex items-center space-x-4">
            {/* Scale Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Scale Guide:</span>
              <select
                value={selectedScale}
                onChange={(e) => setSelectedScale(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono outline-none"
              >
                {Object.keys(SCALES).map((sc) => (
                  <option key={sc} value={sc}>
                    {sc}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantize */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 px-1.5 uppercase font-bold">Quantize:</span>
              <button
                onClick={() => handleQuantize('16th')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  quantizeMode === '16th' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1/16
              </button>
              <button
                onClick={() => handleQuantize('swing')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  quantizeMode === 'swing' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Apply SoulSonus 62% creator swing pocket"
              >
                62% Swing
              </button>
              <button
                onClick={() => handleQuantize('8th')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  quantizeMode === '8th' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                1/8
              </button>
            </div>

            {/* Transpose */}
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">Transpose:</span>
              <button
                onClick={() => handleTranspose(-1)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
              >
                -1st
              </button>
              <button
                onClick={() => handleTranspose(1)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
              >
                +1st
              </button>
              <button
                onClick={() => handleTranspose(12)}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
              >
                +8ve
              </button>
            </div>
          </div>

          {/* Destination and Commit */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Target Track:</span>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs font-mono outline-none"
            >
              <option value="t2">Track 2: Elena Keys (Rhodes 73)</option>
              <option value="t4">Track 4: Marcus Bass (Moog / P-Bass)</option>
              <option value="t1">Track 1: Jay Drums (Percussion Pitch)</option>
              <option value="t3">Track 3: Lead Vocal (Pitch Guide)</option>
            </select>

            <button
              onClick={handleCommit}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg cursor-pointer transition-all shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Commit to Track</span>
            </button>
          </div>
        </div>

        {committedNotice && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/50 text-emerald-300 px-5 py-2 text-xs font-mono flex items-center space-x-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{committedNotice}</span>
          </div>
        )}

        {/* Piano Roll Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Piano Keyboard Column */}
          <div className="w-24 bg-slate-950 border-r border-slate-800 overflow-y-auto flex flex-col shrink-0">
            {midiRows.map((m) => {
              const isBlack = isBlackKey(m);
              const noteName = midiToNoteName(m);
              const inScale = activeScaleNotes.includes(m % 12);
              const isAuditioning = activeNoteAudition === m;

              return (
                <div
                  key={m}
                  onClick={() => previewNoteSound(m)}
                  className={`h-6 border-b border-slate-800 flex items-center justify-between px-2 text-[10px] font-mono cursor-pointer transition-colors ${
                    isAuditioning
                      ? 'bg-purple-500 text-white'
                      : isBlack
                      ? 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                      : 'bg-slate-950 text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <span className={`font-bold ${isBlack ? 'text-purple-300' : 'text-slate-100'}`}>{noteName}</span>
                  {inScale && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" title="In chosen scale" />}
                </div>
              );
            })}
          </div>

          {/* Center Grid + Timeline */}
          <div className="flex-1 flex flex-col overflow-x-auto overflow-y-auto relative bg-slate-950/90">
            {/* Timeline Bar Header (Bars 1 to 4) */}
            <div className="h-6 bg-slate-900/90 border-b border-slate-800 sticky top-0 z-20 flex text-[10px] font-mono text-slate-400">
              {Array.from({ length: 4 }).map((_, barIdx) => (
                <div key={barIdx} className="w-64 border-r border-slate-700 px-2 flex items-center font-bold">
                  Bar {barIdx + 1}
                </div>
              ))}
            </div>

            {/* Playhead traveling line */}
            {isPlaying && (
              <div
                className="absolute top-6 bottom-0 w-0.5 bg-amber-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                style={{ left: `${currentStep * 16}px` }}
              />
            )}

            {/* Note Grid Rows */}
            <div className="relative min-w-[1024px]">
              {midiRows.map((m) => {
                const isBlack = isBlackKey(m);
                const inScale = activeScaleNotes.includes(m % 12);

                return (
                  <div
                    key={m}
                    className={`h-6 border-b border-slate-800/60 flex relative ${
                      isBlack ? 'bg-slate-950' : inScale ? 'bg-slate-900/30' : 'bg-slate-950/50'
                    }`}
                  >
                    {/* 64 16th-note step cells */}
                    {Array.from({ length: totalSteps }).map((_, stepIdx) => {
                      const isBarBorder = (stepIdx + 1) % 16 === 0;
                      const isBeatBorder = (stepIdx + 1) % 4 === 0;

                      return (
                        <div
                          key={stepIdx}
                          onClick={() => handleGridClick(m, stepIdx)}
                          className={`w-4 h-full border-r ${
                            isBarBorder
                              ? 'border-slate-700'
                              : isBeatBorder
                              ? 'border-slate-800'
                              : 'border-slate-900/50'
                          } hover:bg-purple-500/20 cursor-pointer`}
                        />
                      );
                    })}
                  </div>
                );
              })}

              {/* Rendered Notes Overlay */}
              {notes.map((note) => {
                const rowIndex = maxMidi - note.noteNumber;
                if (rowIndex < 0 || rowIndex >= midiRows.length) return null;

                const topPx = rowIndex * 24; // each row is 24px (h-6)
                const leftPx = note.startStep * 16;
                const widthPx = Math.max(16, note.durationSteps * 16 - 2);
                const isSelected = selectedNoteId === note.id;

                return (
                  <div
                    key={note.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNoteId(note.id);
                      previewNoteSound(note.noteNumber);
                    }}
                    style={{
                      top: `${topPx + 2}px`,
                      left: `${leftPx}px`,
                      width: `${widthPx}px`,
                      height: '20px',
                    }}
                    className={`absolute rounded px-1.5 flex items-center justify-between text-[9px] font-mono font-bold shadow-md cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 z-10'
                        : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110'
                    }`}
                  >
                    <span className="truncate">{midiToNoteName(note.noteNumber)}</span>
                    <span className="text-[8px] opacity-75">{note.velocity}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Inspector Bar */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-4">
            {selectedNoteId ? (
              <>
                <span className="text-slate-400">Selected Note:</span>
                <span className="font-bold text-amber-300">
                  {midiToNoteName(notes.find((n) => n.id === selectedNoteId)?.noteNumber || 60)}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  Step: {notes.find((n) => n.id === selectedNoteId)?.startStep}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">
                  Length: {notes.find((n) => n.id === selectedNoteId)?.durationSteps} 16ths
                </span>

                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete Note</span>
                </button>
              </>
            ) : (
              <span className="text-slate-500 italic">Click on grid to add note · Click on piano keys to audition</span>
            )}
          </div>

          <div className="text-slate-400 text-[11px]">
            <span>Spotify Basic Pitch Neural Model · Auto-extracted discrete MIDI events</span>
          </div>
        </div>
      </div>
    </div>
  );
};
