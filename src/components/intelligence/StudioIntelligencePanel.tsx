import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Volume2,
  Cpu,
  Layers,
  ShieldCheck,
  Music,
  Zap,
  GraduationCap,
  Compass,
  Folder,
  Send,
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';

interface StudioIntelligencePanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  focusedTrackName?: string;
  currentRoomName?: string;
  onProposeChangeSet: (promptText: string) => void;
  onOpenPipeline?: () => void;
  onOpenSmir?: () => void;
  onOpenSeedSignature?: () => void;
}

type RoleType = 'PRODUCER' | 'ENGINEER' | 'TUTOR' | 'GUIDE' | 'MANAGER';

interface ChatMessage {
  id: string;
  sender: string;
  time: string;
  role: RoleType;
  text: string;
  isUser?: boolean;
}

export const StudioIntelligencePanel: React.FC<StudioIntelligencePanelProps> = ({
  isOpen = true,
  onClose,
  focusedTrackName = 'Kick (Thump)',
  currentRoomName = 'CREATE',
  onProposeChangeSet,
  onOpenPipeline,
  onOpenSmir,
  onOpenSeedSignature,
}) => {
  // Active Role state
  const [activeRole, setActiveRole] = useState<RoleType>('TUTOR');

  // Directive / Question Input
  const [promptInput, setPromptInput] = useState<string>('');

  // Collapsible Sections
  const [isTelemetryCollapsed, setIsTelemetryCollapsed] = useState<boolean>(false);
  const [isOrchestratorExpanded, setIsOrchestratorExpanded] = useState<boolean>(true);

  // Master Bus & Acoustic Telemetry state
  const [masterFaderDb, setMasterFaderDb] = useState<number>(0);
  const [isLimiterEngaged, setIsLimiterEngaged] = useState<boolean>(true);

  // Chat message feed
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'SOULSONUS INTELLIGENCE (TUTOR)',
      time: '08:59 AM',
      role: 'TUTOR',
      text: `SoulSonus Studio Intelligence, tutor, for **SoulSonus Master Creator** in Room **${currentRoomName}** — 8 tracks at 120 BPM.\n\nAsk a question, issue a directive, or address a player: *"bass player, play what you feel in the hook"*. Anything that changes the session arrives as a candidate you approve.`,
    },
  ]);

  const quickPrompts = [
    'Why is my kick clashing with the 808?',
    'Suggest chord changes in C Minor',
  ];

  const handleSendPrompt = (textToSend?: string) => {
    const text = textToSend || promptInput;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'YOU',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: activeRole,
      text: text,
      isUser: true,
    };

    let replyText = '';
    if (text.toLowerCase().includes('kick') && text.toLowerCase().includes('808')) {
      replyText = `**Acoustic Masking Diagnostic:**\n• Detected 78% overlap at **65 Hz - 90 Hz** between \`Kick (Thump)\` and \`808 / Bass\`.\n• **Recommendation:** Apply sidechain ducking on the 808 (-2.5 dB on kick transient) and notch -1.8 dB at 72 Hz on the 808.\n• Ready to formulate a ChangeSet candidate?`;
    } else if (text.toLowerCase().includes('chord') || text.toLowerCase().includes('c minor')) {
      replyText = `**Harmonic Suggestion in C Minor (8-bar loop):**\n• **Progression:** Cm9 → Abmaj7 → Fm9 → G7alt.\n• **Voice Leading:** Sustaining the Bb and G common tones across the verse creates modern emotional warmth without crowding the lead vocal pocket.`;
    } else {
      replyText = `Understood. Analyzing session context for **${focusedTrackName}** in Room **${currentRoomName}**.\nI've generated a candidate transformation aligned with your production intent.`;
    }

    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}`,
      sender: `SOULSONUS INTELLIGENCE (${activeRole})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      role: activeRole,
      text: replyText,
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setPromptInput('');
  };

  const capabilitiesTable = [
    { cap: 'perception.onset.detect', provider: 'Spectral onset classifier' },
    { cap: 'perception.pitch.extract', provider: 'Basic Pitch (ONNX)' },
    { cap: 'perception.notes.transcribe', provider: 'Basic Pitch (ONNX)' },
    { cap: 'perception.tempo.estimate', provider: 'Onset-interval tempo reader' },
    { cap: 'interpretation.expression.classify', provider: 'Spectral onset classifier' },
    { cap: 'interpretation.role.infer', provider: 'SoulSonus Interpretation' },
    { cap: 'separation.stem', provider: 'Demucs v4' },
    { cap: 'separation.single', provider: 'Demucs v4' },
    { cap: 'realization.instrument', provider: 'SpectraSynth SoundFont playback' },
    { cap: 'realization.music', provider: 'ACE-Step 1.5' },
    { cap: 'transformation.repaint', provider: 'ACE-Step 1.5' },
    { cap: 'engineering.mix.analyse', provider: 'In-browser mix and master analytic' },
    { cap: 'engineering.master.analyse', provider: 'In-browser mix and master analytic' },
  ];

  return (
    <aside className="w-[390px] bg-[#070b16] border-l border-slate-800/90 flex flex-col shrink-0 overflow-y-auto select-none p-3 space-y-3.5 text-xs font-mono text-slate-200 z-30 transition-all duration-200 scrollbar-thin scrollbar-thumb-slate-800">
      {/* 1. Header: STUDIO INTELLIGENCE & MASTER HUB */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center space-x-2">
          {/* Amber Hexagon Icon */}
          <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div>
            <div className="font-black text-xs tracking-wider text-slate-100 uppercase">
              STUDIO INTELLIGENCE & MASTER HUB
            </div>
            <div className="text-[10px] text-slate-400">
              Focus:{' '}
              <span className="text-cyan-400 font-bold">{focusedTrackName}</span>
              {' '}• Room:{' '}
              <span className="text-amber-400 font-bold">{currentRoomName}</span>
            </div>
          </div>
        </div>

        {/* Right controls: Native Brain badge + Close X button */}
        <div className="flex items-center space-x-1.5">
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded border border-amber-500/40 bg-amber-950/40 text-amber-300 text-[10px] font-bold">
            <span className="text-[11px]">⬡</span>
            <span>NATIVE BRAIN</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              title="Collapse Studio Intelligence (Expand Workstation)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Directive Input Bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendPrompt();
            }}
            placeholder={`Ask ${activeRole} or issue a production directive...`}
            className="w-full bg-[#0b1222] text-slate-100 text-xs font-mono rounded-lg border border-slate-700/80 px-3 py-2 pr-16 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 outline-none placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSendPrompt()}
            className="absolute right-1.5 px-2.5 py-1 rounded bg-amber-600/40 hover:bg-amber-500 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-slate-950 font-bold text-[11px] transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Send className="w-3 h-3" />
            <span>ASK</span>
          </button>
        </div>

        {/* QUICK: Chips */}
        <div className="flex items-center space-x-1.5 text-[10px] overflow-x-auto scrollbar-none py-0.5">
          <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0">
            QUICK:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                setPromptInput(qp);
                handleSendPrompt(qp);
              }}
              className="px-2 py-0.5 rounded bg-[#0b1222] hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 hover:border-slate-700 transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* 5 Role Selector Pills: PRODUCER, ENGINEER, TUTOR, GUIDE, MANAGER */}
        <div className="grid grid-cols-5 gap-1 pt-1">
          {(
            [
              { role: 'PRODUCER', icon: <Music className="w-3 h-3" /> },
              { role: 'ENGINEER', icon: <Zap className="w-3 h-3" /> },
              { role: 'TUTOR', icon: <GraduationCap className="w-3 h-3" /> },
              { role: 'GUIDE', icon: <Compass className="w-3 h-3" /> },
              { role: 'MANAGER', icon: <Folder className="w-3 h-3" /> },
            ] as const
          ).map((item) => {
            const isActive = activeRole === item.role;
            return (
              <button
                key={item.role}
                onClick={() => setActiveRole(item.role)}
                className={`py-1.5 px-1 rounded-md text-[9px] font-bold tracking-tight transition-all flex items-center justify-center space-x-1 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.3)] font-black'
                    : 'bg-[#0b1222] text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.role}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MASTER BUS & ACOUSTIC TELEMETRY (Collapsible Card) */}
      <div className="bg-[#090f1e] rounded-lg border border-cyan-950/80 p-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-[11px]">
            <Activity className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">
              MASTER BUS & ACOUSTIC TELEMETRY
            </span>
          </div>

          <button
            onClick={() => setIsTelemetryCollapsed(!isTelemetryCollapsed)}
            className="text-[10px] text-slate-400 hover:text-cyan-300 font-bold cursor-pointer"
          >
            {isTelemetryCollapsed ? 'EXPAND' : 'COLLAPSE'}
          </button>
        </div>

        {!isTelemetryCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[10px]">
            {/* Master Fader */}
            <div className="bg-[#050914] rounded p-2 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>MASTER FADER:</span>
                <span className="text-amber-400 font-bold">
                  {masterFaderDb} dB
                </span>
              </div>
              <div className="flex items-center space-x-2 pt-0.5">
                <Volume2 className="w-3 h-3 text-amber-400 shrink-0" />
                <input
                  type="range"
                  min="-12"
                  max="6"
                  value={masterFaderDb}
                  onChange={(e) => setMasterFaderDb(Number(e.target.value))}
                  className="w-full accent-amber-400 h-1 bg-slate-800 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* LUFS / True Peak */}
            <div className="bg-[#050914] rounded p-2 border border-slate-800 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">LUFS TARGET:</span>
                <span className="text-cyan-400 font-bold">-14.0 LUFS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TRUE PEAK:</span>
                <span className="text-cyan-400 font-bold">-1.0 dBFS</span>
              </div>
            </div>

            {/* Master Limiter Toggle */}
            <div className="bg-[#050914] rounded p-2 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-slate-400">MASTER LIMITER:</div>
                <div className="text-emerald-400 font-bold">
                  {isLimiterEngaged ? 'ENGAGED' : 'BYPASS'}
                </div>
              </div>

              <button
                onClick={() => setIsLimiterEngaged(!isLimiterEngaged)}
                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                  isLimiterEngaged
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-500 border-slate-700'
                }`}
              >
                {isLimiterEngaged ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. SOULSONUS INTELLIGENCE MESSAGE FEED */}
      <div className="space-y-2.5">
        {messages.map((msg) => (
          <div key={msg.id} className="space-y-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              {msg.sender} • {msg.time}
            </div>
            <div
              className={`p-3 rounded-lg border text-xs leading-relaxed ${
                msg.isUser
                  ? 'bg-[#0f172a] border-cyan-500/30 text-slate-200'
                  : 'bg-[#0b1222] border-slate-800 text-slate-300'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* One-click Action if applicable */}
              {msg.text.includes('ChangeSet') && (
                <button
                  onClick={() =>
                    onProposeChangeSet(
                      'Carve 70Hz on 808 and duck 2.4dB during kick transient'
                    )
                  }
                  className="mt-2.5 w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] rounded transition-all flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>FORMULATE CHANGESET CANDIDATE</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 5. CAPABILITY ORCHESTRATOR (Cyan Themed) */}
      <div className="bg-[#080f1d] rounded-lg border border-cyan-900/60 p-3 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-cyan-400 font-bold">
            <Cpu className="w-4 h-4" />
            <span className="uppercase tracking-wider">
              CAPABILITY ORCHESTRATOR
            </span>
          </div>

          <button
            onClick={() => setIsOrchestratorExpanded(!isOrchestratorExpanded)}
            className="text-[10px] text-slate-400 hover:text-cyan-300 cursor-pointer"
          >
            {isOrchestratorExpanded ? 'COLLAPSE' : 'EXPAND'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          SoulSonus owns the workflow. External engines supply bounded, replaceable capabilities.
        </p>

        {isOrchestratorExpanded && (
          <div className="space-y-2.5 pt-1">
            {/* Pipeline Stage Flow Box */}
            <div className="bg-[#050914] rounded-md border border-slate-800/90 p-2.5 text-[10px] space-y-1 font-mono text-cyan-300/90">
              <div>• Capability contract</div>
              <div>• Provider resolution</div>
              <div>• Adapter</div>
              <div>• Engine</div>
              <div>• Normalize</div>
              <div>• Validate</div>
              <div className="text-emerald-400 font-bold">• Take / ChangeSet</div>
            </div>

            {/* 3 Metric Stats: CAPABILITIES (13), PROVIDERS (8), UNAPPROVED (0) */}
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="bg-[#050914] rounded border border-slate-800/80 p-2">
                <div className="text-lg font-black text-cyan-400">13</div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">
                  CAPABILITIES
                </div>
              </div>

              <div className="bg-[#050914] rounded border border-slate-800/80 p-2">
                <div className="text-lg font-black text-cyan-400">8</div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">
                  PROVIDERS
                </div>
              </div>

              <div className="bg-[#050914] rounded border border-slate-800/80 p-2">
                <div className="text-lg font-black text-cyan-400">0</div>
                <div className="text-[9px] text-slate-400 uppercase font-bold">
                  UNAPPROVED
                </div>
              </div>
            </div>

            {/* Capability Table */}
            <div className="bg-[#050914] rounded border border-slate-800/80 p-2 space-y-1 text-[10px] max-h-48 overflow-y-auto scrollbar-thin">
              {capabilitiesTable.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-0.5 border-b border-slate-900/60 last:border-none"
                >
                  <span className="text-cyan-400/90 font-mono text-[9px] truncate max-w-[170px]">
                    {item.cap}
                  </span>
                  <span className="text-emerald-400 font-mono text-[9px] truncate max-w-[140px] text-right">
                    {item.provider}
                  </span>
                </div>
              ))}
            </div>

            {/* Yellow / Amber Policy Notice */}
            <div className="text-[9px] text-amber-400/90 leading-relaxed font-mono bg-amber-950/20 border border-amber-500/30 p-2 rounded">
              This table describes. Requests still dispatch through the realization router and the PAN provider, so a row added here changes what the studio reports, not what it runs. 4 of 8 providers carry an unverified license and are not cleared for release.
            </div>
          </div>
        )}
      </div>

      {/* 6. SOURCE → INTENT → REALIZATION (Gold Themed) */}
      <div
        onClick={onOpenSmir}
        className="bg-[#0d121c] rounded-lg border border-amber-500/40 p-3 space-y-2 cursor-pointer hover:border-amber-400/70 transition-colors shadow-sm"
      >
        <div className="flex items-center justify-between text-amber-400 font-bold">
          <div className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">
              SOURCE → INTENT → REALIZATION
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          The creator&apos;s expression, what SoulSonus made of it, and what it currently sounds like stay three things. Changing the last one never rewrites the first.
        </p>

        {/* 4 Rounded Information Display Fields */}
        <div className="space-y-1.5 pt-1 text-[10px]">
          <div className="bg-[#070c17] rounded border border-slate-800 p-1.5">
            <div className="text-slate-500 text-[9px] uppercase">CHANNEL</div>
            <div className="font-bold text-slate-100">{focusedTrackName}</div>
          </div>

          <div className="bg-[#070c17] rounded border border-slate-800 p-1.5">
            <div className="text-slate-500 text-[9px] uppercase">SOURCE</div>
            <div className="italic text-slate-400">
              Nothing recorded on this channel yet
            </div>
          </div>

          <div className="bg-[#070c17] rounded border border-slate-800 p-1.5">
            <div className="text-slate-500 text-[9px] uppercase">
              INTERPRETATION
            </div>
            <div className="font-bold text-slate-100">Read as kick</div>
          </div>

          <div className="bg-[#070c17] rounded border border-slate-800 p-1.5">
            <div className="text-slate-500 text-[9px] uppercase">
              REALIZATION
            </div>
            <div className="font-bold text-slate-100">
              The recording itself, untouched
            </div>
          </div>
        </div>
      </div>

      {/* 7. PROVENANCE / RIGHTS (Green/Cyan Themed) */}
      <div
        onClick={onOpenSeedSignature}
        className="bg-[#081219] rounded-lg border border-teal-500/40 p-3 space-y-2 cursor-pointer hover:border-teal-400/70 transition-colors shadow-sm"
      >
        <div className="flex items-center justify-between text-teal-400 font-bold">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider">
              PROVENANCE / RIGHTS
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-snug">
          Creator origin, provider, adapter, revision and execution receipts follow every derived artifact.
        </p>

        {/* Two Metric Boxes: REVISIONS & CREATOR SIGNATURE */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-[#050914] rounded border border-slate-800 p-2">
            <div className="text-[9px] text-slate-400 uppercase">REVISIONS</div>
            <div className="text-xl font-black text-cyan-400 mt-0.5">0</div>
          </div>

          <div className="bg-[#050914] rounded border border-slate-800 p-2">
            <div className="text-[9px] text-slate-400 uppercase">
              CREATOR SIGNATURE
            </div>
            <div className="text-xs font-black text-emerald-400 mt-1">
              CALIBRATED
            </div>
          </div>
        </div>

        {/* Warning text in amber */}
        <div className="text-[9px] text-amber-400/90 leading-relaxed font-mono bg-amber-950/20 border border-amber-500/30 p-2 rounded">
          4 provider licenses are unverified. Until they are read, nothing rendered through them is cleared for release - that is a task, not a risk assessment.
        </div>
      </div>
    </aside>
  );
};
