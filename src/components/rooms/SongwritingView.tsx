import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  X,
  Plus,
  Trash2,
  Clock,
  Play,
  Pause,
  Layers,
  Scissors,
  Circle,
  Activity,
  Music2,
  ShieldCheck,
  Sliders,
  ChevronDown,
  List,
  Sparkles,
  Volume2,
  RotateCcw,
  Check,
  Radio,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';

interface SongwritingViewProps {
  onUpdateLyrics?: (sectionId: string, text: string) => void;
  onClose?: () => void;
  focusedTrackName?: string;
  bpm?: number;
}

type VocalTab =
  | 'LYRICS & CADENCE'
  | 'TAKES & POOL'
  | 'COMP BUILDER'
  | 'PUNCH & OVERDUB'
  | 'PITCH & TIMING'
  | 'HARMONY & DOUBLES'
  | 'VOICE IDENTITY'
  | 'VOCAL DSP';

interface LyricLine {
  id: string;
  lineNum: number;
  bar: number;
  rhyme: string;
  syllablesCount: number;
  text: string;
}

interface SyllableItem {
  id: string;
  text: string;
  isStressed: boolean;
}

export const SongwritingView: React.FC<SongwritingViewProps> = ({
  onUpdateLyrics,
  onClose,
  focusedTrackName = 'Kick (Thump)',
  bpm = 110,
}) => {
  // 8 Vocal Suite Tabs - Defaults to 1. LYRICS & CADENCE matching Capture.PNG
  const [activeTab, setActiveTab] = useState<VocalTab>('LYRICS & CADENCE');

  // Section Selector: 'Intro Beat', 'Verse Pocket', 'Chorus Lead Hook', 'Outro Resolving Tail'
  const [activeSection, setActiveSection] = useState<string>('Intro Beat');

  // Version selector
  const [activeVersion, setActiveVersion] = useState<string>('Verse 1 v1 (Initial Draft)');

  // Selected Lyric Line for Cadence Alignment (Line 1 is active by default)
  const [selectedLineId, setSelectedLineId] = useState<string>('l1');

  // New line input
  const [newLineText, setNewLineText] = useState<string>('');

  // Audition playback state
  const [isAuditioning, setIsAuditioning] = useState<boolean>(false);
  const [auditionStep, setAuditionStep] = useState<number>(-1);
  const auditionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lyric lines state for current verse
  const [lyricLines, setLyricLines] = useState<LyricLine[]>([
    {
      id: 'l1',
      lineNum: 1,
      bar: 5,
      rhyme: 'A',
      syllablesCount: 14,
      text: 'Walking through the neon rain, watching shadows fade away',
    },
    {
      id: 'l2',
      lineNum: 2,
      bar: 6,
      rhyme: 'A',
      syllablesCount: 14,
      text: 'Every heartbeat in my chest knows the words I cannot say',
    },
  ]);

  // Syllables & Downbeat Stresses for Line 1 (Interactive toggles)
  const [syllables, setSyllables] = useState<SyllableItem[]>([
    { id: 's1', text: 'Walk-', isStressed: true },
    { id: 's2', text: 'ing', isStressed: false },
    { id: 's3', text: 'through', isStressed: true },
    { id: 's4', text: 'the', isStressed: false },
    { id: 's5', text: 'ne-', isStressed: true },
    { id: 's6', text: 'on', isStressed: false },
    { id: 's7', text: 'rain,', isStressed: true },
    { id: 's8', text: 'watch-', isStressed: true },
    { id: 's9', text: 'ing', isStressed: false },
    { id: 's10', text: 'shad-', isStressed: true },
    { id: 's11', text: 'ows', isStressed: false },
    { id: 's12', text: 'fade', isStressed: true },
    { id: 's13', text: 'a-', isStressed: false },
    { id: 's14', text: 'way', isStressed: true },
  ]);

  // 16th Note Grid (Bar 5): 1 e & a | 2 e & a | 3 e & a | 4 e & a
  const [steps16] = useState([
    { step: '1', active: true, tick: '|', color: 'pink' },
    { step: 'e', active: false, tick: ':', color: 'dark' },
    { step: '&', active: true, tick: '\'', color: 'pink' },
    { step: 'a', active: false, tick: '|', color: 'dark' },
    { step: '2', active: true, tick: '|', color: 'pink' },
    { step: 'e', active: false, tick: '|', color: 'dark' },
    { step: '&', active: true, tick: '|', color: 'pink' },
    { step: 'a', active: false, tick: '|', color: 'dark' },
    { step: '3', active: true, tick: '|', color: 'pink' },
    { step: 'e', active: false, tick: ':', color: 'dark' },
    { step: '&', active: true, tick: '|', color: 'pink' },
    { step: 'a', active: false, tick: '|', color: 'dark' },
    { step: '4', active: true, tick: '|', color: 'cyan' },
    { step: 'e', active: false, tick: '|', color: 'dark' },
    { step: '&', active: false, tick: '.', color: 'dark' },
    { step: 'a', active: false, tick: '.', color: 'dark' },
  ]);

  // Handle toggling downbeat stress on a syllable
  const toggleStress = (id: string) => {
    setSyllables((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isStressed: !s.isStressed } : s))
    );
  };

  // Add new line
  const handleAddLine = () => {
    if (!newLineText.trim()) return;
    const newLine: LyricLine = {
      id: `l-${Date.now()}`,
      lineNum: lyricLines.length + 1,
      bar: 5 + lyricLines.length,
      rhyme: 'B',
      syllablesCount: newLineText.trim().split(/\s+/).length * 2,
      text: newLineText.trim(),
    };
    setLyricLines([...lyricLines, newLine]);
    setNewLineText('');
  };

  // Delete line
  const handleDeleteLine = (id: string) => {
    setLyricLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Cadence Audition Audio Loop
  const handleToggleAudition = () => {
    if (isAuditioning) {
      if (auditionTimerRef.current) clearInterval(auditionTimerRef.current);
      setIsAuditioning(false);
      setAuditionStep(-1);
    } else {
      setIsAuditioning(true);
      let curStep = 0;
      // 16th note interval at current BPM: (60 / BPM / 4) * 1000 ms
      const intervalMs = (60 / bpm / 4) * 1000;

      auditionTimerRef.current = setInterval(() => {
        setAuditionStep(curStep);
        const isDownbeat = curStep % 4 === 0;
        audioEngine.playDrum(isDownbeat ? 'rim' : 'hihat');

        curStep = (curStep + 1) % 16;
      }, intervalMs);
    }
  };

  useEffect(() => {
    return () => {
      if (auditionTimerRef.current) clearInterval(auditionTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-[#050814] rounded-2xl border border-slate-800/90 p-5 space-y-4 select-none text-slate-200 font-mono shadow-2xl">
      {/* 1. Top Header Bar matching Capture.PNG */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center space-x-3.5">
          {/* Magenta/Pink Rounded Mic Badge */}
          <div className="w-10 h-10 rounded-xl bg-fuchsia-950/60 border border-fuchsia-500/60 flex items-center justify-center text-fuchsia-400 shadow-md">
            <Mic className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase">
                SONGWRITING SUITE & VOCAL BOOTH
              </h1>

              {/* Purple BPM Badge */}
              <span className="bg-[#301242] border border-fuchsia-500/50 text-fuchsia-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                {bpm} BPM • 4/4
              </span>

              {/* Track Badge */}
              <span className="bg-[#0e172a] border border-slate-700/80 text-slate-300 text-[11px] font-mono px-2.5 py-0.5 rounded-md">
                Track: {focusedTrackName}
              </span>
            </div>

            {/* Subtitle with dot separators */}
            <p className="text-[11px] text-slate-400 mt-1">
              Lyrics &amp; Cadence • Takes &amp; Pool • Comp Builder • Punch &amp; Overdub • Pitch &amp; Timing • Harmony • Voice Identity • Vocal DSP
            </p>
          </div>
        </div>

        {/* Top Right Close X Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            title="Close Suite"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* 2. Sub-Header Room Indicator Banner */}
      <div className="bg-[#090f20] border border-slate-800/90 rounded-xl p-3 flex items-center justify-between shadow-inner">
        <div className="flex items-center space-x-2.5">
          {/* Purple Circular Dot Indicator */}
          <div className="w-5 h-5 rounded-full bg-purple-900/60 border border-purple-400/80 flex items-center justify-center shadow-sm">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-black tracking-wide text-slate-100 uppercase">
              WRITE &amp; RECORD VOCAL ROOM
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 font-medium">
              Room 3 of Permanent Studio
            </span>
          </div>
        </div>

        {/* Right Gold Accent Box: WRITING TO: LEAD VOCAL TRACK */}
        <div className="bg-amber-950/30 border border-amber-500/70 text-amber-300 font-bold px-3 py-1 rounded text-[11px] tracking-wider uppercase shadow-sm">
          WRITING TO: LEAD VOCAL TRACK
        </div>
      </div>

      {/* 3. 8-Stage Modular Vocal Suite Tabs */}
      <div className="bg-[#070c18] border border-slate-800/90 rounded-xl p-2.5 space-y-1.5">
        {/* Row 1: Stages 1-3 */}
        <div className="grid grid-cols-3 gap-2">
          {/* 1. LYRICS & CADENCE (Active by default) */}
          <button
            onClick={() => setActiveTab('LYRICS & CADENCE')}
            className={`py-2 px-3 rounded-lg text-xs font-black tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'LYRICS & CADENCE'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black ring-1 ring-pink-300'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>1. LYRICS &amp; CADENCE</span>
          </button>

          {/* 2. TAKES & POOL */}
          <button
            onClick={() => setActiveTab('TAKES & POOL')}
            className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'TAKES & POOL'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black ring-1 ring-pink-300'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. TAKES &amp; POOL</span>
          </button>

          {/* 3. COMP BUILDER */}
          <button
            onClick={() => setActiveTab('COMP BUILDER')}
            className={`py-2 px-3 rounded-lg text-xs font-bold tracking-wide transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'COMP BUILDER'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black ring-1 ring-pink-300'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>3. COMP BUILDER</span>
          </button>
        </div>

        {/* Row 2: Stages 4-8 */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {/* 4. PUNCH & OVERDUB */}
          <button
            onClick={() => setActiveTab('PUNCH & OVERDUB')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-tight transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'PUNCH & OVERDUB'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <Circle className="w-3 h-3 fill-current" />
            <span>4. PUNCH &amp; OVERDUB</span>
          </button>

          {/* 5. PITCH & TIMING */}
          <button
            onClick={() => setActiveTab('PITCH & TIMING')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-tight transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'PITCH & TIMING'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <Activity className="w-3 h-3" />
            <span>5. PITCH &amp; TIMING</span>
          </button>

          {/* 6. HARMONY & DOUBLES */}
          <button
            onClick={() => setActiveTab('HARMONY & DOUBLES')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-tight transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'HARMONY & DOUBLES'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <Music2 className="w-3 h-3" />
            <span>6. HARMONY &amp; DOUBLES</span>
          </button>

          {/* 7. VOICE IDENTITY */}
          <button
            onClick={() => setActiveTab('VOICE IDENTITY')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-tight transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'VOICE IDENTITY'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>7. VOICE IDENTITY</span>
          </button>

          {/* 8. VOCAL DSP */}
          <button
            onClick={() => setActiveTab('VOCAL DSP')}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold tracking-tight transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              activeTab === 'VOCAL DSP'
                ? 'bg-[#ec4899] text-slate-950 shadow-[0_0_15px_rgba(236,72,153,0.35)] font-black'
                : 'bg-[#091022] text-slate-300 hover:text-white hover:bg-[#0e172e] border border-slate-800'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>8. VOCAL DSP</span>
          </button>
        </div>
      </div>

      {/* 4. ACTIVE TAB CONTENT: TAB 1 matching Capture.PNG */}
      {activeTab === 'LYRICS & CADENCE' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-4 space-y-4 shadow-xl">
          {/* Header row: LYRIC & CADENCE WORKSPACE • VERSE 1 */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <List className="w-4 h-4 text-pink-400" />
              <span className="uppercase tracking-wider">
                LYRIC &amp; CADENCE WORKSPACE • VERSE 1
              </span>
            </div>

            {/* Purple BPM Pill */}
            <span className="bg-[#301242] border border-fuchsia-500/50 text-fuchsia-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
              {bpm} BPM • 4/4
            </span>
          </div>

          {/* Sub-bar: Version Dropdown + Song Section Pills */}
          <div className="bg-[#090f20] border border-slate-800/90 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2">
            {/* Version selector dropdown & + VER button */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-[#0d152a] border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 cursor-pointer hover:border-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeVersion}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              <button
                onClick={() => setActiveVersion(`Verse 1 v${parseInt(activeVersion.split('v')[1] || '1') + 1} (Alternative)`)}
                className="bg-[#301242] hover:bg-[#43185c] border border-fuchsia-500/60 text-fuchsia-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                + VER
              </button>
            </div>

            {/* Song Section Pills: Intro Beat, Verse Pocket, Chorus Lead Hook, Outro Resolving Tail */}
            <div className="flex items-center space-x-1.5">
              {[
                { name: 'Intro Beat', key: 'Intro Beat' },
                { name: 'Verse Pocket', key: 'Verse Pocket' },
                { name: 'Chorus Lead Hook', key: 'Chorus Lead Hook' },
                { name: 'Outro Resolving Tail', key: 'Outro Resolving Tail' },
              ].map((sec) => (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(sec.key)}
                  className={`px-4 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    activeSection === sec.key
                      ? 'bg-[#ec4899] text-slate-950 font-black shadow-[0_0_10px_rgba(236,72,153,0.3)]'
                      : 'bg-[#0d152a] border border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-[#121c38]'
                  }`}
                >
                  {sec.name}
                </button>
              ))}
            </div>
          </div>

          {/* Two-Column Layout: Left (Lyric Lines) | Right (Cadence & 16th-Note Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column: LYRIC LINES (2 Lines in Verse 1) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-slate-300 uppercase">
                  LYRIC LINES ({lyricLines.length} Lines in Verse 1)
                </span>
                <span className="text-slate-400 text-[11px]">
                  Click to align cadence
                </span>
              </div>

              {/* Lyric Line Cards */}
              <div className="space-y-2.5">
                {lyricLines.map((line) => {
                  const isSelected = selectedLineId === line.id;
                  return (
                    <div
                      key={line.id}
                      onClick={() => setSelectedLineId(line.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0c1224] border-pink-500/80 shadow-[0_0_16px_rgba(236,72,153,0.18)]'
                          : 'bg-[#0a0f20] border-slate-800/90 hover:border-slate-700'
                      }`}
                    >
                      {/* Top status info */}
                      <div className="flex items-center justify-between pb-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="text-pink-400 font-bold text-xs">
                            LINE {line.lineNum} • BAR {line.bar}
                          </span>

                          <span className="bg-[#24133d] border border-purple-600/70 text-purple-300 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
                            RHYME: {line.rhyme}
                          </span>

                          <span className="text-slate-400 text-xs font-mono">
                            {line.syllablesCount} Syllables
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLine(line.id);
                          }}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
                          title="Delete Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Lyric Text */}
                      <div className="text-slate-100 text-xs font-mono font-medium leading-relaxed">
                        {line.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Line Input Row */}
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  value={newLineText}
                  onChange={(e) => setNewLineText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddLine();
                  }}
                  placeholder={`Type line for ${activeSection}...`}
                  className="flex-1 bg-[#0a0f20] border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500/30 outline-none"
                />

                <button
                  onClick={handleAddLine}
                  className="bg-[#ec4899] hover:bg-[#db2777] text-white font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-1 shadow-md transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD</span>
                </button>
              </div>
            </div>

            {/* Right Column: E08 CADENCE & 16TH-NOTE RHYTHMIC GRID */}
            <div className="bg-[#090f20] border border-slate-800/90 rounded-2xl p-4 space-y-4 shadow-md">
              {/* Header with AUDITION CADENCE button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="uppercase tracking-wider text-slate-200">
                    E08 CADENCE &amp; 16TH-NOTE RHYTHMIC GRID
                  </span>
                </div>

                <button
                  onClick={handleToggleAudition}
                  className={`border px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                    isAuditioning
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-[#181208] border-amber-500/70 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  {isAuditioning ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>STOPPING...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>AUDITION CADENCE</span>
                    </>
                  )}
                </button>
              </div>

              {/* Syllables & Downbeat Stresses Section */}
              <div className="space-y-2">
                <p className="text-slate-400 text-[11px] font-mono">
                  Syllables &amp; Downbeat Stresses (Click to toggle downbeat hit):
                </p>

                {/* Syllable Chips with Stress Indicator (Pink for Stressed, Navy for Unstressed) */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {syllables.map((syl) => (
                    <button
                      key={syl.id}
                      onClick={() => toggleStress(syl.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center space-x-1 shadow-sm ${
                        syl.isStressed
                          ? 'bg-[#ec4899] text-white shadow-[0_0_8px_rgba(236,72,153,0.3)] hover:bg-[#f43f5e]'
                          : 'bg-[#0d152a] text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{syl.text}</span>
                      {syl.isStressed && <span className="text-[10px]">▲</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 16th Note Sub-beat Resolution Box */}
              <div className="bg-[#060a16] border border-slate-800/90 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-400 uppercase">
                    16TH NOTE SUB-BEAT RESOLUTION (BAR 5):
                  </span>
                  <span className="font-bold text-pink-400 tracking-wider">
                    1 e &amp; a | 2 e &amp; a | 3 e &amp; a | 4 e &amp; a
                  </span>
                </div>

                {/* 16-step visual matrix */}
                <div className="grid grid-cols-16 gap-1 pt-1 text-center font-mono">
                  {steps16.map((item, idx) => {
                    const isPlayheadHere = auditionStep === idx;
                    return (
                      <div key={idx} className="flex flex-col items-center space-y-1">
                        {/* Step block */}
                        <div
                          className={`w-full py-1 rounded text-[10px] font-black transition-all ${
                            isPlayheadHere
                              ? 'bg-amber-400 text-slate-950 scale-110 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                              : item.color === 'cyan'
                              ? 'bg-[#0f2e38] text-cyan-300 border border-cyan-500/50'
                              : item.active
                              ? 'bg-[#3b122e] text-pink-300 border border-pink-500/60'
                              : 'bg-[#0b1222] text-slate-500 border border-slate-800/60'
                          }`}
                        >
                          {item.step}
                        </div>

                        {/* Tick mark indicator */}
                        <div
                          className={`text-[9px] font-bold ${
                            isPlayheadHere
                              ? 'text-amber-400 font-black'
                              : item.active
                              ? 'text-pink-400'
                              : 'text-slate-600'
                          }`}
                        >
                          {item.tick}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TAKES & POOL */}
      {activeTab === 'TAKES & POOL' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <Layers className="w-4 h-4 text-pink-400" />
              <span className="uppercase tracking-wider">
                VOCAL TAKE POOL &amp; PERFORMANCE COMPING
              </span>
            </div>
            <span className="text-emerald-400 text-xs font-bold">
              4 Takes Recorded • 1 Active Composite
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'tk-1', name: 'Take 1 (Full Run - Verse 1)', rating: '★★★★☆', timing: 'Pocket: +4ms', active: true },
              { id: 'tk-2', name: 'Take 2 (Falsetto Doubles)', rating: '★★★★★', timing: 'Pocket: 0ms', active: false },
              { id: 'tk-3', name: 'Take 3 (Punch bar 6-8)', rating: '★★★☆☆', timing: 'Pocket: -8ms', active: false },
              { id: 'tk-4', name: 'Take 4 (Ad-lib dynamic hooks)', rating: '★★★★☆', timing: 'Pocket: +2ms', active: false },
            ].map((take) => (
              <div
                key={take.id}
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  take.active
                    ? 'bg-[#0d162e] border-pink-500/70 shadow-sm'
                    : 'bg-[#090f20] border-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-100 text-xs">{take.name}</div>
                  <div className="text-[11px] text-slate-400">{take.timing} • Rating: {take.rating}</div>
                </div>
                <button className="px-3 py-1 rounded bg-slate-800 hover:bg-pink-500 hover:text-slate-950 text-xs font-bold transition-all">
                  AUDITION
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: COMP BUILDER */}
      {activeTab === 'COMP BUILDER' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <Scissors className="w-4 h-4 text-pink-400" />
              <span className="uppercase tracking-wider">
                MULTI-LANE VOCAL COMP BUILDER
              </span>
            </div>
            <button className="px-3 py-1 bg-pink-500 text-slate-950 font-bold text-xs rounded hover:bg-pink-400">
              FLATTEN TO MASTER TRACK
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Swipe-comp phrases across takes. Automatic micro-crossfades (4ms equal-power) prevent click transients between spliced takes.
          </p>
          <div className="h-28 bg-[#050914] rounded-xl border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
            Multi-lane swipe comp canvas ready • Splicing Take 1 &amp; Take 2 seamlessly
          </div>
        </div>
      )}

      {/* TAB 4: PUNCH & OVERDUB */}
      {activeTab === 'PUNCH & OVERDUB' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <Circle className="w-4 h-4 text-rose-500 fill-current" />
              <span className="uppercase tracking-wider">
                AUTO-PUNCH &amp; OVERDUB ENGINE
              </span>
            </div>
            <span className="text-rose-400 font-bold text-xs">Pre-roll: 2 Bars • Post-roll: 1 Bar</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800">
              <div className="text-slate-400">PUNCH IN:</div>
              <div className="text-pink-400 font-bold text-sm">Bar 5.1.00</div>
            </div>
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800">
              <div className="text-slate-400">PUNCH OUT:</div>
              <div className="text-pink-400 font-bold text-sm">Bar 7.1.00</div>
            </div>
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800">
              <div className="text-slate-400">CROSSFADE LENGTH:</div>
              <div className="text-emerald-400 font-bold text-sm">6.5 ms (Equal Power)</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PITCH & TIMING */}
      {activeTab === 'PITCH & TIMING' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="uppercase tracking-wider">
                SPECTRAL PITCH &amp; FORMANT TUNER
              </span>
            </div>
            <span className="text-cyan-400 font-bold text-xs">Key Lock: C Minor (Natural Scale)</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold">RETUNE SPEED (12ms):</div>
              <input type="range" min="0" max="50" defaultValue="12" className="w-full accent-pink-500" />
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>0ms (Hard Tune)</span>
                <span>50ms (Natural)</span>
              </div>
            </div>
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-400 font-bold">FORMANT SHIFT (0.0 semitones):</div>
              <input type="range" min="-12" max="12" defaultValue="0" className="w-full accent-cyan-400" />
              <div className="flex justify-between text-slate-500 text-[10px]">
                <span>-12 (Deep)</span>
                <span>+12 (Airy)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: HARMONY & DOUBLES */}
      {activeTab === 'HARMONY & DOUBLES' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <Music2 className="w-4 h-4 text-amber-400" />
              <span className="uppercase tracking-wider">
                INTELLIGENT HARMONY &amp; STEREO DOUBLER
              </span>
            </div>
            <span className="text-amber-400 font-bold text-xs">Interval Generator: Active</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800">
              <div className="text-slate-400">UPPER 3RD:</div>
              <div className="text-amber-400 font-bold text-sm">+4 Semitones (C Minor)</div>
            </div>
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800">
              <div className="text-slate-400">LOWER 5TH:</div>
              <div className="text-amber-400 font-bold text-sm">-7 Semitones (Sub-support)</div>
            </div>
            <div className="p-3 bg-[#090f20] rounded-xl border border-slate-800">
              <div className="text-slate-400">STEREO SPREAD:</div>
              <div className="text-emerald-400 font-bold text-sm">±18 Cents / 22ms Delay</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: VOICE IDENTITY */}
      {activeTab === 'VOICE IDENTITY' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="uppercase tracking-wider">
                VOICE IDENTITY &amp; TIMBRE SIGNATURE
              </span>
            </div>
            <span className="text-emerald-400 font-bold text-xs">Creator Rights Provenance Calibrated</span>
          </div>
          <p className="text-xs text-slate-400">
            Voice identity cryptographic profile locked to project SeedSignature. No unverified third-party models used.
          </p>
        </div>
      )}

      {/* TAB 8: VOCAL DSP */}
      {activeTab === 'VOCAL DSP' && (
        <div className="bg-[#070b18] rounded-2xl border border-slate-800/90 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 text-slate-100 font-bold text-xs">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="uppercase tracking-wider">
                BROADCAST VOCAL DSP STRIP
              </span>
            </div>
            <span className="text-purple-300 font-bold text-xs">Neve 1073 → 1176LN → Pultec EQ → EMT 140</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-[#090f20] rounded-lg border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px]">PREAMP GAIN</div>
              <div className="text-pink-400 font-bold mt-1">+36 dB</div>
            </div>
            <div className="p-2.5 bg-[#090f20] rounded-lg border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px]">COMP RATIO</div>
              <div className="text-pink-400 font-bold mt-1">4:1 (Fast Attack)</div>
            </div>
            <div className="p-2.5 bg-[#090f20] rounded-lg border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px]">DE-ESSER</div>
              <div className="text-pink-400 font-bold mt-1">6.2 kHz (-3.5 dB)</div>
            </div>
            <div className="p-2.5 bg-[#090f20] rounded-lg border border-slate-800 text-center">
              <div className="text-slate-400 text-[10px]">PLATE REVERB</div>
              <div className="text-pink-400 font-bold mt-1">1.8s Tail (18% Wet)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
