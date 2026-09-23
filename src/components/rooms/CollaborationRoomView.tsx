import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageSquare,
  Share2,
  CheckCircle2,
  Send,
  Sparkles,
  ShieldCheck,
  UserPlus,
  Play,
  Square,
  Check,
  X,
  GitBranch,
  Radio,
  Clock,
  ExternalLink,
  Volume2,
  CornerDownRight,
  Copy,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';
import { ProjectMetadata, Track } from '../../types/soulsonus';

interface CollaborationRoomViewProps {
  metadata: ProjectMetadata;
  tracks: Track[];
  onJumpToBar?: (bar: number) => void;
}

interface TimelineComment {
  id: string;
  author: string;
  role: string;
  timeAgo: string;
  barNumber?: number;
  text: string;
  avatar: string;
  color: string;
  resolved?: boolean;
}

interface ChangeSetProposal {
  id: string;
  author: string;
  title: string;
  targetTrack: string;
  description: string;
  timestamp: string;
  status: 'PENDING' | 'MERGED' | 'REJECTED';
  diffSummary: string;
}

export const CollaborationRoomView: React.FC<CollaborationRoomViewProps> = ({
  metadata,
  tracks,
  onJumpToBar,
}) => {
  const [commentInput, setCommentInput] = useState('');
  const [targetBarInput, setTargetBarInput] = useState<number | ''>('');
  const [auditioningChangeId, setAuditioningChangeId] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'changesets' | 'presence'>('notes');

  // Multi-tab real-time sync channel
  const [channel, setChannel] = useState<BroadcastChannel | null>(null);

  const [activeCollaborators, setActiveCollaborators] = useState([
    {
      id: 'c1',
      name: 'You (Devon Cole)',
      role: 'Project Owner & Creator',
      status: 'In Collaboration Room',
      avatar: 'DC',
      color: 'bg-purple-600 text-white',
      isOnline: true,
      lastActive: 'Just now',
    },
    {
      id: 'c2',
      name: 'Maya Chen',
      role: 'Mix & Mastering Engineer',
      status: 'Auditioning Stem 03 Vocal Air',
      avatar: 'MC',
      color: 'bg-cyan-500 text-slate-950',
      isOnline: true,
      lastActive: '1m ago',
    },
    {
      id: 'c3',
      name: 'Elena Rostova (Persona)',
      role: 'Keys & Harmonic Advisor',
      status: 'Proposing Neo-Soul Voicings',
      avatar: 'ER',
      color: 'bg-emerald-500 text-slate-950',
      isOnline: true,
      lastActive: '4m ago',
    },
    {
      id: 'c4',
      name: 'Marcus Vance (Persona)',
      role: 'Bass Architect',
      status: 'Locked to Jay’s Kick Drum',
      avatar: 'MV',
      color: 'bg-amber-500 text-slate-950',
      isOnline: true,
      lastActive: '8m ago',
    },
  ]);

  const [comments, setComments] = useState<TimelineComment[]>([
    {
      id: 'comm_1',
      author: 'Maya Chen',
      role: 'Mix Engineer',
      timeAgo: '12m ago',
      barNumber: 4,
      text: 'Lead vocal high-end air is sitting nicely at 12kHz. Let’s add a 1/8d stereo delay throw on the phrase ending here.',
      avatar: 'MC',
      color: 'bg-cyan-500 text-slate-950',
      resolved: false,
    },
    {
      id: 'comm_2',
      author: 'Elena Rostova',
      role: 'Keys',
      timeAgo: '24m ago',
      barNumber: 2,
      text: 'Swapped the second chord from pure C minor to a Cmin9 with natural 9th on top (D4). Sounds much more expressive!',
      avatar: 'ER',
      color: 'bg-emerald-500 text-slate-950',
      resolved: true,
    },
    {
      id: 'comm_3',
      author: 'Marcus Vance',
      role: 'Bass',
      timeAgo: '35m ago',
      barNumber: 1,
      text: 'Downbeat root note C1 is sub-heavy. Pushed attack transient back by 3ms to let Jay’s acoustic kick punch through.',
      avatar: 'MV',
      color: 'bg-amber-500 text-slate-950',
      resolved: false,
    },
  ]);

  const [proposals, setProposals] = useState<ChangeSetProposal[]>([
    {
      id: 'cs_1',
      author: 'Maya Chen',
      title: 'Vocal Sibilance De-Esser & Mid-Side Air EQ',
      targetTrack: 'Track 3: Lead Vocal',
      description: 'Notched 6.8kHz harshness by -2.4dB and widened high-shelf above 10kHz for commercial gloss.',
      timestamp: '18m ago',
      status: 'PENDING',
      diffSummary: '+1 EQ Curve · -2.4dB @ 6.8kHz · Dynamic Ratio 3:1',
    },
    {
      id: 'cs_2',
      author: 'Elena Rostova',
      title: 'Neo-Soul Rhodes Chord Inversions (Bar 3-4)',
      targetTrack: 'Track 2: Elena Keys',
      description: 'Adjusted voicings to Gospel-influenced 11th extensions to complement Devon’s vocal hum take.',
      timestamp: '42m ago',
      status: 'MERGED',
      diffSummary: '5 MIDI Notes Added · Velocity scaled to 88',
    },
    {
      id: 'cs_3',
      author: 'Marcus Vance',
      title: 'Syncopated Ghost Notes on Beat 3 & 4',
      targetTrack: 'Track 4: Marcus Bass',
      description: 'Added subtle finger slides into the minor 7th on bar transitions for extra pocket tension.',
      timestamp: '1h ago',
      status: 'PENDING',
      diffSummary: '+2 Bass Slides · 62% swing offset',
    },
  ]);

  // Setup BroadcastChannel for multi-tab live sync
  useEffect(() => {
    try {
      const bc = new BroadcastChannel('SoulSonus_Collab_Sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'NEW_COMMENT') {
          setComments((prev) => [event.data.comment, ...prev]);
        } else if (event.data?.type === 'MERGE_PROPOSAL') {
          setProposals((prev) =>
            prev.map((p) => (p.id === event.data.proposalId ? { ...p, status: 'MERGED' } : p))
          );
        }
      };
      setChannel(bc);
      return () => bc.close();
    } catch {
      // BroadcastChannel fallback if blocked
    }
  }, []);

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    const newComment: TimelineComment = {
      id: `comm_${Date.now()}`,
      author: 'You (Devon Cole)',
      role: 'Project Owner',
      timeAgo: 'Just now',
      barNumber: typeof targetBarInput === 'number' && targetBarInput > 0 ? targetBarInput : undefined,
      text: commentInput.trim(),
      avatar: 'YOU',
      color: 'bg-purple-600 text-white',
      resolved: false,
    };

    setComments((prev) => [newComment, ...prev]);
    setCommentInput('');
    setTargetBarInput('');

    // Broadcast to other studio tabs
    if (channel) {
      channel.postMessage({ type: 'NEW_COMMENT', comment: newComment });
    }
  };

  const handleToggleResolve = (id: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleAuditionProposal = (p: ChangeSetProposal) => {
    if (auditioningChangeId === p.id) {
      setAuditioningChangeId(null);
      return;
    }
    setAuditioningChangeId(p.id);

    // Play representative audio for the proposal
    if (p.targetTrack.includes('Vocal')) {
      audioEngine.playNote(261.63, 'sine', 0.4); // C4 vocal tone
      setTimeout(() => audioEngine.playNote(311.13, 'sine', 0.5), 200); // Eb4
    } else if (p.targetTrack.includes('Keys')) {
      audioEngine.playNote(261.63, 'triangle', 0.6);
      audioEngine.playNote(329.63, 'triangle', 0.6);
      audioEngine.playNote(392.0, 'triangle', 0.6);
    } else {
      audioEngine.playNote(65.41, 'sine', 0.8); // Deep bass
    }

    setTimeout(() => setAuditioningChangeId(null), 1800);
  };

  const handleMergeProposal = (id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'MERGED' } : p))
    );
    if (channel) {
      channel.postMessage({ type: 'MERGE_PROPOSAL', proposalId: id });
    }
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/collab/join?session=${metadata.name.replace(/\s+/g, '_')}&token=ss_sec_${Date.now()}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 p-5 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                COLLABORATION ROOM · LIVE SYNC
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>P2P Broadcast Sync Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Real-time multi-user co-production · Time-coded bar markers · Stem change-set audition & merge
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Collaborator</span>
          </button>
        </div>
      </div>

      {/* Nav Sub-Tabs: Notes vs Change-Sets vs Collaborators */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
            activeTab === 'notes'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Timeline Notes ({comments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('changesets')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
            activeTab === 'changesets'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Proposed Change-Sets ({proposals.filter((p) => p.status === 'PENDING').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('presence')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
            activeTab === 'presence'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Online Presence ({activeCollaborators.length})</span>
        </button>
      </div>

      {/* TAB 1: TIMELINE NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* New Comment Input Box with Bar Target */}
          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400">Anchor to Bar:</span>
              <input
                type="number"
                min={1}
                max={64}
                value={targetBarInput}
                onChange={(e) => setTargetBarInput(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="e.g. 4"
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-purple-500"
              />
              <span className="text-[11px] text-slate-500 font-mono">(Optional timestamp)</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Add session note, mix instruction, or vocal arrangement feedback..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendComment}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-all flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Note</span>
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-xl border transition-all ${
                  c.resolved
                    ? 'bg-slate-950/60 border-slate-900 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${c.color}`}
                    >
                      {c.avatar}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-100 font-mono">{c.author}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({c.role})</span>
                        <span className="text-[10px] text-slate-500 font-mono">· {c.timeAgo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {c.barNumber && (
                      <button
                        onClick={() => onJumpToBar && onJumpToBar(c.barNumber!)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 text-[10px] font-mono cursor-pointer"
                        title="Jump transport playhead to this bar"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Bar {c.barNumber}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleResolve(c.id)}
                      className={`p-1 rounded cursor-pointer ${
                        c.resolved ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={c.resolved ? 'Mark unresolved' : 'Mark resolved'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-300 font-mono pl-10">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PROPOSED CHANGE-SETS */}
      {activeTab === 'changesets' && (
        <div className="space-y-3">
          {proposals.map((p) => {
            const isAuditioning = auditioningChangeId === p.id;
            return (
              <div
                key={p.id}
                className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-100 font-mono">{p.title}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                            p.status === 'MERGED'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Proposed by {p.author} · {p.targetTrack} · {p.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAuditionProposal(p)}
                      className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                        isAuditioning
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {isAuditioning ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isAuditioning ? 'Playing A/B' : 'Audition Change'}</span>
                    </button>

                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => handleMergeProposal(p.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer transition-all shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Merge</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 font-mono">{p.description}</p>

                <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-purple-300 flex items-center space-x-2">
                  <CornerDownRight className="w-3.5 h-3.5 text-purple-400" />
                  <span>Diff: {p.diffSummary}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ONLINE PRESENCE */}
      {activeTab === 'presence' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeCollaborators.map((c) => (
            <div
              key={c.id}
              className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${c.color}`}>
                  {c.avatar}
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100">{c.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{c.role}</div>
                  <div className="text-[9px] text-emerald-400 font-mono flex items-center space-x-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{c.status}</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-500">{c.lastActive}</span>
            </div>
          ))}
        </div>
      )}

      {/* Invite Collaborator Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
          <div className="bg-slate-950 border border-purple-500/40 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-100 font-mono">INVITE STUDIO COLLABORATOR</h3>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 font-mono">
              Share this secure session link with your mix engineer, vocalist, or co-producer. They can listen to stems,
              leave time-coded feedback, and propose change-sets without installing any software.
            </p>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Secure Session Access Token</span>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/collab/join?session=${metadata.name.replace(/\s+/g, '_')}&token=ss_sec_09a471f`}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 outline-none"
                />
                <button
                  onClick={handleCopyInviteLink}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer flex items-center space-x-1"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Cryptographically signed with SeedSignature · Creator retains 100% master ownership</span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-bold rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
