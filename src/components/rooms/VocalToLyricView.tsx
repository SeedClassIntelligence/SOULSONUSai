import React, { useState } from 'react';
import {
  Type,
  Mic,
  Sparkles,
  ArrowRight,
  Check,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface VocalToLyricViewProps {
  onAcceptLyric: (lyric: string, section: string) => void;
}

export const VocalToLyricView: React.FC<VocalToLyricViewProps> = ({
  onAcceptLyric,
}) => {
  const [scratchVocalTake, setScratchVocalTake] = useState<string>('Lead Vocal · Take 1 (Scratch)');
  const [phoneticBreakdown] = useState<string[]>([
    'wɔː·kɪŋ', 'θruː', 'ðə', 'reɪn', 'æt', 'mɪd·naɪt'
  ]);
  const [transcribedSyllables] = useState<string>('wah-king throo thuh rayn at mid-nyt');
  const [proposedLyric, setProposedLyric] = useState<string>('Walking through the rain at midnight');
  const [alternativeLyrics] = useState<string[]>([
    'Waiting through the pain at twilight',
    'Calling out your name in sunlight',
    'Holding through the strain of midnight',
  ]);

  const handleAudition = () => {
    // Play melody tone
    audioEngine.playNote(261.63, 'sine', 0.4);
    setTimeout(() => audioEngine.playNote(311.13, 'sine', 0.4), 200);
    setTimeout(() => audioEngine.playNote(293.66, 'sine', 0.4), 400);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-5 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
              VOCAL-TO-LYRIC · PHONETIC PRESERVATION ENGINE
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Preserves the exact rhythm, vowels, and emotional cadences of creator scratch vocals while refining text.
            </p>
          </div>
        </div>

        <button
          onClick={handleAudition}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-pink-300 border border-pink-500/40 text-xs font-mono font-semibold"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audition Syllabic Rhythm</span>
        </button>
      </div>

      {/* 3 Step Conversion Journey */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Scratch Vocal Source */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              Step 1 · Scratch Audio
            </span>
            <span className="text-[9px] font-mono text-emerald-400">PRESERVED</span>
          </div>
          <div className="text-xs font-mono font-bold text-slate-100">
            {scratchVocalTake}
          </div>
          <p className="text-[11px] text-slate-400">
            Creator-origin vocal take recorded in The Booth with natural intonation.
          </p>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 font-mono text-xs text-slate-300">
            Tempo: 110 BPM · Bar 5 (Verse 1)
          </div>
        </div>

        {/* Step 2: Phonetic Transcriptions */}
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              Step 2 · Phonetic Extraction
            </span>
            <span className="text-[9px] font-mono text-cyan-400">7 Syllables</span>
          </div>
          <div className="text-xs font-mono font-bold text-cyan-300">
            &ldquo;{transcribedSyllables}&rdquo;
          </div>
          <div className="flex flex-wrap gap-1 pt-1">
            {phoneticBreakdown.map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded bg-slate-950 text-cyan-200 border border-cyan-500/30 text-[10px] font-mono"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Step 3: Lyric Proposal */}
        <div className="bg-slate-900/90 rounded-xl border border-pink-500/40 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-pink-400 uppercase">
              Step 3 · Lyric Realization
            </span>
            <span className="text-[9px] font-mono text-pink-400">Meter Match</span>
          </div>
          <input
            type="text"
            value={proposedLyric}
            onChange={(e) => setProposedLyric(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 font-mono font-bold text-xs p-2 rounded border border-slate-700 focus:border-pink-500 outline-none"
          />
          <p className="text-[10px] text-slate-400">
            Matches vowel resonance of &ldquo;wah-king throo...&rdquo; exactly.
          </p>
        </div>
      </div>

      {/* Alternative Proposals */}
      <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
        <div className="text-xs font-mono font-bold text-slate-300 uppercase">
          Alternative Syllable-Preserved Proposals:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {alternativeLyrics.map((alt, idx) => (
            <button
              key={idx}
              onClick={() => setProposedLyric(alt)}
              className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-pink-500 text-left transition-colors cursor-pointer text-xs font-mono text-slate-200"
            >
              {alt}
            </button>
          ))}
        </div>

        {/* Accept Button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-xs font-mono text-slate-400">
            Updates Songwriting Sheet & Track 03 Vocal Labels
          </div>
          <button
            onClick={() => onAcceptLyric(proposedLyric, 'verse_1')}
            className="px-5 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Accept into Songwriting & DAW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
