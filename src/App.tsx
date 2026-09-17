import React, { useState, useCallback, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { StudioTopBar } from './components/layout/StudioTopBar';
import { StudioSubTabs } from './components/layout/StudioSubTabs';
import { StudioSidebar } from './components/layout/StudioSidebar';
import { StudioFooter } from './components/layout/StudioFooter';
import { StudioIntelligencePanel } from './components/intelligence/StudioIntelligencePanel';
import { ChangeSetModal } from './components/intelligence/ChangeSetModal';

// Rooms & Workstations
import { TheBoothView } from './components/rooms/TheBoothView';
import { CreatorTrainingView } from './components/rooms/CreatorTrainingView';
import { BandSessionRow } from './components/daw/BandSessionRow';
import { SongSectionsBar } from './components/daw/SongSectionsBar';
import { UnifiedDAW } from './components/daw/UnifiedDAW';
import { TheBandView } from './components/rooms/TheBandView';
import { BGVStudioView } from './components/rooms/BGVStudioView';
import { BeatMachineView } from './components/rooms/BeatMachineView';
import { PianoKeysView } from './components/rooms/PianoKeysView';
import { InstrumentWorkstationView } from './components/rooms/InstrumentWorkstationView';
import { SongwritingView } from './components/rooms/SongwritingView';
import { VocalToLyricView } from './components/rooms/VocalToLyricView';
import { MixRoomView } from './components/rooms/MixRoomView';
import { MasterRoomView } from './components/rooms/MasterRoomView';
import { ReleaseRoomView } from './components/rooms/ReleaseRoomView';
import { CollaborationRoomView } from './components/rooms/CollaborationRoomView';

// System & Diagnostics
import { SmirInspectorView } from './components/systems/SmirInspectorView';
import { PipelineOrchestratorView } from './components/systems/PipelineOrchestratorView';
import { CapabilityRegistryView } from './components/systems/CapabilityRegistryView';
import { ProvenanceRightsView } from './components/systems/ProvenanceRightsView';
import { RevisionTreeTakesView } from './components/systems/RevisionTreeTakesView';
import { CalibrationView } from './components/systems/CalibrationView';
import { StudioLobbyModal } from './components/systems/StudioLobbyModal';
import { RecruitPlayerModal } from './components/rooms/RecruitPlayerModal';
import { StemExportModal } from './components/studio/StemExportModal';
import { MidiPianoRollModal } from './components/studio/MidiPianoRollModal';

// Data & Audio & Persistence
import {
  INITIAL_METADATA,
  INITIAL_TRACKS,
  INITIAL_SESSION_PLAYERS,
  INITIAL_SONG_SECTIONS,
  INITIAL_PIPELINE_STAGES,
  INITIAL_CAPABILITIES,
  INITIAL_REVISIONS,
  INITIAL_SMIR_INTENT,
  INITIAL_CHANGESETS,
} from './services/initialData';
import { audioEngine } from './services/audioEngine';
import { assetStore } from './services/assetStore';
import {
  StudioTab,
  StudioRoom,
  Track,
  AudioClip,
  SessionPlayerPersona,
  ChangeSet,
  InputMode,
} from './types/soulsonus';

export default function App() {
  // Global persistent project state
  const [metadata, setMetadata] = useState(INITIAL_METADATA);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayerPersona[]>(INITIAL_SESSION_PLAYERS);
  const [songSections, setSongSections] = useState(INITIAL_SONG_SECTIONS);
  const [pipelineStages, setPipelineStages] = useState(INITIAL_PIPELINE_STAGES);
  const [capabilityItems, setCapabilityItems] = useState(INITIAL_CAPABILITIES);
  const [revisions, setRevisions] = useState(INITIAL_REVISIONS);
  const [smirIntent, setSmirIntent] = useState(INITIAL_SMIR_INTENT);

  // Navigation state - default to SOUNDS & Creator Training
  const [activeTab, setActiveTab] = useState<StudioTab>('SOUNDS');
  const [currentRoom, setCurrentRoom] = useState<StudioRoom>('creator_training');

  // DAW selection
  const [selectedTrackId, setSelectedTrackId] = useState<string>('t3');
  const [selectedClipId, setSelectedClipId] = useState<string | null>('c3');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec_v1');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>('player_marcus');

  // Transport & Audio State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  // What the studio has to tell the creator about the microphone. Null when
  // there is nothing to say -- never a cheerful default.
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const [isMetroOn, setIsMetroOn] = useState<boolean>(false);
  const [playheadTime, setPlayheadTime] = useState<string>('01:02:14');
  const [currentBar, setCurrentBar] = useState<number>(1);
  const [currentBeat, setCurrentBeat] = useState<number>(1);
  const [playheadSeconds, setPlayheadSeconds] = useState<number>(0);

  // Modals & Panels
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState<boolean>(true);
  const [isChangeSetModalOpen, setIsChangeSetModalOpen] = useState<boolean>(false);
  const [activeChangeSet, setActiveChangeSet] = useState<ChangeSet | null>(INITIAL_CHANGESETS[0]);
  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState<boolean>(false);
  const [isRecruitPlayerModalOpen, setIsRecruitPlayerModalOpen] = useState<boolean>(false);
  const [isStemExportOpen, setIsStemExportOpen] = useState<boolean>(false);
  const [isPianoRollOpen, setIsPianoRollOpen] = useState<boolean>(false);
  const [pianoRollNotes, setPianoRollNotes] = useState<any[] | undefined>(undefined);
  const [pianoRollTitle, setPianoRollTitle] = useState<string>('Vocal-to-MIDI Melody Roll');

  // Transport playback callback
  const handleTick = useCallback(
    (seconds: number, bar: number, beat: number) => {
      setCurrentBar(bar);
      setCurrentBeat(beat);
      setPlayheadSeconds(seconds);
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      const ms = Math.floor((seconds % 1) * 100);
      const timeStr = `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}:${ms < 10 ? '0' : ''}${ms}`;
      setPlayheadTime(timeStr);
    },
    []
  );

  // Load project state on mount from local storage
  useEffect(() => {
    assetStore.loadProjectState().then((saved) => {
      if (saved) {
        if (saved.metadata) setMetadata(saved.metadata);
        if (saved.tracks) setTracks(saved.tracks);
        if (saved.sessionPlayers) setSessionPlayers(saved.sessionPlayers);
        if (saved.revisions) setRevisions(saved.revisions);
        if (saved.capabilityItems) setCapabilityItems(saved.capabilityItems);
        if (saved.smirIntent) setSmirIntent(saved.smirIntent);
      }
    });
  }, []);

  // Auto-save project state when critical state changes
  useEffect(() => {
    assetStore.saveProjectState({
      metadata,
      tracks,
      sessionPlayers,
      revisions,
      capabilityItems,
      smirIntent,
    });
  }, [metadata, tracks, sessionPlayers, revisions, capabilityItems, smirIntent]);

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.stopTransport();
      setIsPlaying(false);
    } else {
      audioEngine.setBpm(metadata.bpm);
      const hasSolo = tracks.some((t) => t.soloed);
      audioEngine.startTransport(tracks, hasSolo, handleTick, isMetroOn);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    audioEngine.stopTransport();
    setIsPlaying(false);
    setIsRecording(false);
    setCurrentBar(1);
    setCurrentBeat(1);
    setPlayheadTime('01:00:00');
    setPlayheadSeconds(0);
  };

  /**
   * Record, and keep only what was actually captured.
   *
   * Both halves used to swallow their failure. Starting caught the error and
   * left the transport lit as though it were recording; stopping caught it
   * and filed a take anyway, with a manufactured blob behind it. Now each one
   * says what happened and the session is left alone when nothing was heard.
   */
  const toggleRecord = async () => {
    if (isRecording) {
      setIsRecording(false);
      const res = await audioEngine.stopRealRecording('SING');

      if (!res.ok) {
        setCaptureNotice(`${res.reason} Nothing was added to the session.`);
        return;
      }

      const asset = await assetStore.registerAudioAsset(
        'Lead Vocal · Booth Capture',
        res.blob,
        'booth_recording',
        Math.max(0.1, res.durationSeconds),
        {
          mode: 'SING',
          pitchContour: res.pitchContour,
          detectedNotes: res.detectedNotes,
          waveformPoints: res.waveformPoints,
        }
      );

      handleNewRecordingTake(
        'Lead Vocal · Booth Capture',
        'RECORD AUDIO',
        asset.id,
        res.waveformPoints,
        res.detectedNotes.map((n) => n.note).join(' → ')
      );
      setCaptureNotice(null);
      return;
    }

    const armed = await audioEngine.startRealRecording();
    if (!armed.ok) {
      setCaptureNotice(armed.reason);
      return;
    }

    setCaptureNotice(null);
    setIsRecording(true);
    if (!isPlaying) togglePlay();
  };

  const toggleMetro = () => {
    const nextMetro = !isMetroOn;
    setIsMetroOn(nextMetro);
  };

  // Track manipulation
  const handleToggleMute = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t))
    );
  };

  const handleToggleSolo = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, soloed: !t.soloed } : t))
    );
  };

  const handleToggleArm = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => ({ ...t, armed: t.id === trackId ? !t.armed : false }))
    );
    setSelectedTrackId(trackId);
  };

  const handleChangeVolume = (trackId: string, volume: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, volume } : t))
    );
  };

  const handleSelectClip = (clip: AudioClip, trackId: string) => {
    setSelectedClipId(clip.id);
    setSelectedTrackId(trackId);
    setSmirIntent((prev) => ({
      ...prev,
      title: clip.name,
    }));
  };

  // Add new take to Track t3 from Booth with full asset tracking
  const handleNewRecordingTake = (
    takeTitle: string,
    mode: InputMode,
    assetId?: string,
    waveformPoints?: number[],
    notesSummary?: string
  ) => {
    const newClip: AudioClip = {
      id: `c_take_${Date.now()}`,
      assetId: assetId,
      name: takeTitle,
      startBar: 2,
      lengthBars: 6,
      takeNumber: 2,
      color: '#ec4899',
      isCreatorOrigin: true,
      waveformPoints:
        waveformPoints && waveformPoints.length > 0
          ? waveformPoints
          : [0.3, 0.7, 0.9, 0.5, 0.8, 0.4, 0.9, 0.6, 0.7, 0.3, 0.8, 0.5],
      notesSummary: notesSummary || `${mode} Performance`,
    };

    setTracks((prev) =>
      prev.map((t) =>
        t.id === 't3' ? { ...t, clips: [...t.clips, newClip] } : t
      )
    );

    // Update revision
    const nextRev = metadata.revision + 1;
    setMetadata((m) => ({ ...m, revision: nextRev }));
    setRevisions((revs) => [
      {
        id: `rev_${nextRev}`,
        revision: nextRev,
        timestamp: 'Just now',
        label: `Booth Recording: ${takeTitle}`,
        author: 'Devon Cole (Creator)',
        notes: `New vocal performance tracked directly in The Booth via ${mode}.${assetId ? ` Registered Asset: ${assetId}` : ''}`,
        isCurrent: true,
      },
      ...revs.map((r) => ({ ...r, isCurrent: false })),
    ]);
  };

  // ChangeSet actions
  const handleProposeChangeSet = (promptText: string) => {
    setActiveChangeSet({
      id: `cs_${Date.now()}`,
      timestamp: 'Just now',
      naturalPrompt: promptText,
      targetScope: 'Track 04 (Marcus Bass) & Track 05 (BGV Choir)',
      status: 'PROPOSED',
      affectedTracks: ['t4', 't5'],
      createdRevision: metadata.revision + 1,
      impactSummary: 'Harmonic density lifts by +3dB in the final chorus without touching lead vocal frequencies or drum pocket.',
      preservedElements: [
        'Lead Vocal Melody & Continuous Pitch Contour (SMIR Vector)',
        'Kick Drum Transients & Pocket Alignment (Jay Drums)',
        'Track 02 Rhodes Chord Voicings',
      ],
      permittedChanges: [
        'Marcus bass octave energy lift during Chorus',
        'Add 3-part Gospel Triad BGV harmonies to Track 05',
        'Dynamic ducking between Bass and Kick at 92Hz',
      ],
      prohibitedChanges: [
        'No modifications to Lead Vocal audio buffer',
        'No chord progression substitutions',
        'No timing drift greater than 2ms',
      ],
    });
    setIsChangeSetModalOpen(true);
  };

  const handleApplyChangeSet = (cs: ChangeSet) => {
    setIsChangeSetModalOpen(false);
    const nextRev = cs.createdRevision;
    setMetadata((m) => ({ ...m, revision: nextRev }));

    // Update Track 04 and Track 05 clips to reflect ChangeSet realization
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === 't4') {
          return {
            ...t,
            clips: [
              {
                id: 'c4_revised',
                name: 'Marcus · Bass · Take 4 (Harmonic Lift)',
                startBar: 2.5,
                lengthBars: 5.5,
                takeNumber: 4,
                color: '#06b6d4',
                isCreatorOrigin: false,
                waveformPoints: [0.6, 0.9, 0.7, 0.9, 0.8, 0.9, 0.8, 0.9],
              },
            ],
          };
        }
        if (t.id === 't5') {
          return {
            ...t,
            clips: [
              {
                id: 'c5_harmony',
                name: 'Final Chorus · 3-Part Triad (Applied)',
                startBar: 5,
                lengthBars: 4,
                takeNumber: 2,
                color: '#a855f7',
                isCreatorOrigin: false,
                waveformPoints: [0.5, 0.8, 0.9, 0.7, 0.9, 0.8, 0.7, 0.9],
              },
            ],
          };
        }
        return t;
      })
    );

    // Add revision record
    setRevisions((prev) => [
      {
        id: `rev_${nextRev}`,
        revision: nextRev,
        timestamp: 'Just now',
        label: `ChangeSet: "${cs.naturalPrompt.slice(0, 36)}..."`,
        author: 'Studio Intelligence',
        notes: cs.impactSummary,
        isCurrent: true,
      },
      ...prev.map((r) => ({ ...r, isCurrent: false })),
    ]);
  };

  const handleAlternativeChangeSet = (cs: ChangeSet) => {
    setActiveChangeSet({
      ...cs,
      naturalPrompt: `${cs.naturalPrompt} (Acoustic Upright Alternative)`,
      permittedChanges: [
        'Marcus swaps to 1968 Acoustic Double Bass',
        'Subtle finger-slide accents on Bar 7',
        'Soprano airy vocal pad behind Chorus',
      ],
      impactSummary: 'Warmer, more organic acoustic timbre with deeper low-mid resonance.',
    });
  };

  const handleRejectChangeSet = () => {
    setIsChangeSetModalOpen(false);
  };

  // Player directing
  const handleInstructPlayer = (playerId: string, instruction: string) => {
    handleProposeChangeSet(`${playerId === 'player_marcus' ? 'Marcus' : 'Session Player'}: ${instruction}`);
  };

  const handleUpdatePlayerTake = (playerId: string, takeId: number) => {
    setSessionPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, activeTake: takeId } : p))
    );
  };

  const handleAddSessionPlayer = (newPlayer: SessionPlayerPersona, createTrack: boolean = true) => {
    setSessionPlayers((prev) => [...prev, newPlayer]);
    setSelectedPlayerId(newPlayer.id);

    if (createTrack) {
      const isVocal = newPlayer.role.toLowerCase().includes('vocal');
      const newTrack: Track = {
        id: `t_${newPlayer.id}`,
        number: String(tracks.length + 1).padStart(2, '0'),
        name: `${newPlayer.name.toUpperCase()} ${newPlayer.role.toUpperCase()}`,
        type: 'Session Player',
        subtitle: `${newPlayer.role} · ${newPlayer.instrument}`,
        armed: false,
        muted: false,
        soloed: false,
        volume: 0.8,
        pan: 0,
        color: isVocal ? '#c084fc' : '#38bdf8',
        bus: isVocal ? 'Vocal Bus' : 'Music Bus',
        plugins: [`${newPlayer.name} Preamp Channel`],
        activeTake: 1,
        availableTakes: [1],
        clips: newPlayer.takes.map((take, idx) => ({
          id: `clip_${newPlayer.id}_${idx + 1}`,
          name: `${newPlayer.name} · ${take.title}`,
          startBar: 2,
          lengthBars: 4,
          takeNumber: 1,
          color: isVocal ? '#7e22ce' : '#0369a1',
          notesSummary: take.description,
        })),
      };
      setTracks((prev) => [...prev, newTrack]);
    }
  };

  const handleDeleteSessionPlayer = (playerId: string) => {
    setSessionPlayers((prev) => {
      const next = prev.filter((p) => p.id !== playerId);
      if (selectedPlayerId === playerId) {
        setSelectedPlayerId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
    setTracks((prev) => prev.filter((t) => t.id !== `t_${playerId}`));
  };

  // Provider switching
  const handleSwitchProvider = (capabilityId: string, newProvider: string) => {
    setCapabilityItems((prev) =>
      prev.map((item) =>
        item.id === capabilityId ? { ...item, currentProvider: newProvider } : item
      )
    );
  };

  // Rollback revision
  const handleRestoreRevision = (revNumber: number) => {
    setMetadata((m) => ({ ...m, revision: revNumber }));
    setRevisions((prev) =>
      prev.map((r) => ({ ...r, isCurrent: r.revision === revNumber }))
    );
  };

  // Send Beat Machine pattern to Track 01
  const handleSendPatternToTrack = (patternName: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === 't1') {
          return {
            ...t,
            clips: [
              ...t.clips,
              {
                id: `c_drum_${Date.now()}`,
                name: patternName,
                startBar: 5,
                lengthBars: 4,
                takeNumber: 2,
                color: '#06b6d4',
                isCreatorOrigin: true,
                waveformPoints: [0.8, 0.4, 0.9, 0.5, 0.8, 0.4, 0.9, 0.5],
              },
            ],
          };
        }
        return t;
      })
    );
    setActiveTab('CREATE');
    setCurrentRoom('booth');
  };

  // Record Keys to Track 02
  const handleRecordKeysToTrack = (clipTitle: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === 't2') {
          return {
            ...t,
            clips: [
              ...t.clips,
              {
                id: `c_keys_${Date.now()}`,
                name: clipTitle,
                startBar: 4,
                lengthBars: 4,
                takeNumber: 3,
                color: '#10b981',
                isCreatorOrigin: true,
                waveformPoints: [0.4, 0.6, 0.8, 0.5, 0.7, 0.9, 0.6, 0.7],
              },
            ],
          };
        }
        return t;
      })
    );
    setActiveTab('CREATE');
    setCurrentRoom('booth');
  };

  // Add Creator Training sound to session with authoritative routing & provenance tracking
  const handleAddCreatorSoundToSession = (sound: {
    title: string;
    category: string;
    duration: string;
    rootTag: string;
    mode?: string;
    assetId?: string;
    waveformPoints?: number[];
    notesSummary?: string;
  }) => {
    // Correct routing:
    // Beatbox, Rhythm, Drums, Clap -> t1 (Jay Drums)
    // Voice, Hum, Sing, Speak, Vocal -> t3 (Lead Vocal / Creator Voice)
    // Keys, Rhodes, Piano, or converted MIDI phrase -> t2 (Elena Keys)
    // Bass -> t4 (Marcus Bass)
    let targetTrackId = 't3';
    let clipColor = '#38bdf8';

    if (
      sound.category === 'Rhythm' ||
      sound.category === 'Beatbox' ||
      sound.category === 'Drums' ||
      sound.category === 'Clap / Tap'
    ) {
      targetTrackId = 't1';
      clipColor = '#06b6d4';
    } else if (
      sound.category === 'Voice' ||
      sound.category === 'Hum' ||
      sound.category === 'Sing' ||
      sound.category === 'Speak' ||
      sound.category === 'Vocals' ||
      sound.category === 'Melodies'
    ) {
      if (sound.mode === 'MIDI / Pattern') {
        // Melodic MIDI phrasing translated from Hum or Singing -> route to Rhodes Keys
        targetTrackId = 't2';
        clipColor = '#10b981';
      } else {
        // Raw vocal performance / reference / loop -> route to Lead Vocal
        targetTrackId = 't3';
        clipColor = '#ec4899';
      }
    } else if (sound.category === 'Instrument') {
      targetTrackId = 't2';
      clipColor = '#10b981';
    } else if (sound.category === 'Bass') {
      targetTrackId = 't4';
      clipColor = '#8b5cf6';
    }

    const newClip: AudioClip = {
      id: `c_creator_${Date.now()}`,
      assetId: sound.assetId,
      name: sound.title,
      startBar: 2,
      lengthBars: sound.mode === 'One-Shot' ? 1 : 4,
      takeNumber: 1,
      color: clipColor,
      isCreatorOrigin: true,
      waveformPoints:
        sound.waveformPoints && sound.waveformPoints.length > 0
          ? sound.waveformPoints
          : [0.3, 0.7, 0.9, 0.6, 0.8, 0.5, 0.4, 0.2],
      notesSummary: sound.notesSummary || `${sound.category} · ${sound.mode || 'Audio'}`,
    };

    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === targetTrackId) {
          return {
            ...t,
            clips: [...t.clips, newClip],
          };
        }
        return t;
      })
    );

    const nextRev = metadata.revision + 1;
    setMetadata((m) => ({ ...m, revision: nextRev }));
    setRevisions((revs) => [
      {
        id: `rev_${nextRev}`,
        revision: nextRev,
        timestamp: 'Just now',
        label: `Placed ${sound.title} on Track ${targetTrackId.toUpperCase()}`,
        author: 'Devon Cole (Creator)',
        notes: `Creator asset placed as ${sound.mode || 'Audio'}.${sound.assetId ? ` Verified SeedSignature: ${sound.assetId}` : ''}`,
        isCurrent: true,
      },
      ...revs.map((r) => ({ ...r, isCurrent: false })),
    ]);
  };

  // Background harmony placement
  const handleApplyHarmonyToTrack = (harmonyType: string, targetSection: string) => {
    handleProposeChangeSet(`Apply ${harmonyType} BGV section on ${targetSection}`);
  };

  const handleOpenPianoRoll = (notes?: any[], title?: string) => {
    if (notes) setPianoRollNotes(notes);
    if (title) setPianoRollTitle(title);
    setIsPianoRollOpen(true);
  };

  const handleCommitPianoRollNotes = (notes: any[]) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === selectedTrackId) {
          const updatedClips = t.clips.map((c, idx) => {
            if (idx === 0 || c.id === selectedClipId) {
              return {
                ...c,
                notesSummary: `${notes.length} MIDI Events (Quantized)`,
              };
            }
            return c;
          });
          return {
            ...t,
            clips: updatedClips,
          };
        }
        return t;
      })
    );

    const nextRev = metadata.revision + 1;
    setMetadata((m) => ({ ...m, revision: nextRev }));
    setRevisions((revs) => [
      {
        id: `rev_${nextRev}`,
        revision: nextRev,
        timestamp: 'Just now',
        label: `Committed ${notes.length} MIDI Notes to ${tracks.find((t) => t.id === selectedTrackId)?.name || 'Track'}`,
        author: 'Devon Cole (Creator)',
        notes: `Committed interactive piano roll sequence. SeedSignature updated with melodic note provenance.`,
        isCurrent: true,
      },
      ...revs.map((r) => ({ ...r, isCurrent: false })),
    ]);
  };

  // Navigation handlers
  const handleSelectTab = (tab: StudioTab) => {
    setActiveTab(tab);
    if (tab === 'CREATE') setCurrentRoom('booth');
    if (tab === 'SOUNDS') setCurrentRoom('creator_training');
    if (tab === 'WRITE & RECORD') setCurrentRoom('songwriting');
    if (tab === 'MIX') setCurrentRoom('mix');
    if (tab === 'MASTER') setCurrentRoom('master');
    if (tab === 'RELEASE') setCurrentRoom('release');
  };

  const handleSelectRoom = (room: StudioRoom) => {
    setCurrentRoom(room);
    if (room === 'booth') setActiveTab('CREATE');
    if (room === 'creator_training' || room === 'piano_keys' || room === 'instrument' || room === 'beat_machine') setActiveTab('SOUNDS');
    if (room === 'songwriting' || room === 'vocal_to_lyric') setActiveTab('WRITE & RECORD');
    if (room === 'mix') setActiveTab('MIX');
    if (room === 'master') setActiveTab('MASTER');
    if (room === 'release') setActiveTab('RELEASE');
  };

  const armedTrack = tracks.find((t) => t.armed);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans antialiased select-none">
      {/* What the microphone actually did. It says nothing when there is
          nothing to say, and it is never reassuring on principle: if a take
          was not captured, this is where the creator finds out, rather than
          discovering later that the waveform in their library is not theirs. */}
      {captureNotice && (
        <div
          role="status"
          data-testid="capture-notice"
          className="shrink-0 bg-rose-950/90 border-b border-rose-500/50 px-4 py-2 flex items-center justify-between gap-4 font-mono text-[11px]"
        >
          <span className="text-rose-200">
            <span className="font-black tracking-wider text-rose-400">MICROPHONE · </span>
            {captureNotice}
          </span>
          <button
            type="button"
            onClick={() => setCaptureNotice(null)}
            className="shrink-0 px-2 py-0.5 rounded border border-rose-500/40 text-rose-300 hover:bg-rose-900/60 transition cursor-pointer font-bold"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 1. Header / Top bar with branding & transport */}
      <StudioTopBar
        metadata={metadata}
        isPlaying={isPlaying}
        isRecording={isRecording}
        playheadTime={playheadTime}
        isMetroOn={isMetroOn}
        onTogglePlay={togglePlay}
        onStop={handleStop}
        onToggleRecord={toggleRecord}
        onToggleMetro={toggleMetro}
        onOpenLobby={() => setIsLobbyModalOpen(true)}
        onOpenHistory={() => handleSelectRoom('takes_revisions')}
        onOpenRegistry={() => handleSelectRoom('capability_registry')}
        onOpenIntelligence={() => setIsIntelligenceOpen((prev) => !prev)}
        onOpenRelease={() => handleSelectRoom('release')}
        onOpenPianoRoll={() => handleOpenPianoRoll()}
        onOpenStemExport={() => setIsStemExportOpen(true)}
        onUpdateProjectName={(name) => setMetadata((m) => ({ ...m, name }))}
        onUpdateBpm={(bpm) => {
          setMetadata((m) => ({ ...m, bpm }));
          audioEngine.setBpm(bpm);
        }}
      />

      {/* 2. Subtabs bar (CREATE, SOUNDS, WRITE & RECORD, MIX, MASTER, RELEASE) */}
      <StudioSubTabs
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isIntelligenceOpen={isIntelligenceOpen}
        onOpenIntelligence={() => setIsIntelligenceOpen((prev) => !prev)}
      />

      {/* 3. Main Workspace: Left Sidebar + Center Content + Right Intelligence rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <StudioSidebar
          currentRoom={currentRoom}
          onSelectRoom={handleSelectRoom}
        />

        {/* Center Workspace Stage */}
        <main className="flex-1 bg-slate-950 overflow-y-auto p-4 space-y-4">
          {/* Creator Training & My Sounds Room */}
          {currentRoom === 'creator_training' && (
            <div className="max-w-7xl mx-auto">
              <CreatorTrainingView
                projectName={metadata.name}
                bpm={metadata.bpm}
                timeSignature={metadata.timeSignature}
                keySignature={metadata.key}
                onAddSoundToSession={handleAddCreatorSoundToSession}
                onNavigateRoom={(room) => handleSelectRoom(room as StudioRoom)}
                onOpenPianoRoll={(notes, title) => handleOpenPianoRoll(notes, title)}
              />
            </div>
          )}

          {/* Main CREATE View (Integrated Booth + Band + Sections + Unified DAW) */}
          {activeTab === 'CREATE' && currentRoom === 'booth' && (
            <div className="space-y-4 max-w-7xl mx-auto">
              {/* Centerpiece 1: The Booth Card */}
              <TheBoothView
                armedTrack={armedTrack}
                isRecording={isRecording}
                onToggleRecord={toggleRecord}
                onNewRecordingTake={(takeName, mode) =>
                  handleNewRecordingTake(takeName, mode)
                }
              />

              {/* Centerpiece 2: The Band Session Players Row */}
              <BandSessionRow
                players={sessionPlayers}
                selectedPlayerId={selectedPlayerId}
                onSelectPlayer={(p) => {
                  setSelectedPlayerId(p.id);
                  handleSelectRoom('band');
                }}
                onAddPlayerClick={() => setIsRecruitPlayerModalOpen(true)}
              />

              {/* Centerpiece 3: Song Sections Bar */}
              <SongSectionsBar
                sections={songSections}
                activeSectionId={selectedSectionId}
                onSelectSection={(secId) => setSelectedSectionId(secId)}
              />

              {/* Centerpiece 4: The Control Room · Unified DAW */}
              <UnifiedDAW
                tracks={tracks}
                currentBar={currentBar}
                currentBeat={currentBeat}
                playheadSeconds={playheadSeconds}
                selectedTrackId={selectedTrackId}
                selectedClipId={selectedClipId}
                onSelectTrack={(tId) => setSelectedTrackId(tId)}
                onSelectClip={handleSelectClip}
                onToggleMute={handleToggleMute}
                onToggleSolo={handleToggleSolo}
                onToggleArm={handleToggleArm}
                onChangeVolume={handleChangeVolume}
              />
            </div>
          )}

          {/* Specialized Room Views */}
          {currentRoom === 'band' && (
            <div className="max-w-7xl mx-auto">
              <TheBandView
                players={sessionPlayers}
                onUpdatePlayerTake={handleUpdatePlayerTake}
                onInstructPlayer={handleInstructPlayer}
                onAddPlayer={handleAddSessionPlayer}
                onDeletePlayer={handleDeleteSessionPlayer}
              />
            </div>
          )}

          {currentRoom === 'bgv' && (
            <div className="max-w-7xl mx-auto">
              <BGVStudioView
                onApplyHarmonyToTrack={handleApplyHarmonyToTrack}
              />
            </div>
          )}

          {currentRoom === 'beat_machine' && (
            <div className="max-w-7xl mx-auto">
              <BeatMachineView
                onSendPatternToTrack={handleSendPatternToTrack}
              />
            </div>
          )}

          {currentRoom === 'piano_keys' && (
            <div className="max-w-7xl mx-auto">
              <PianoKeysView
                onRecordKeysToTrack={handleRecordKeysToTrack}
              />
            </div>
          )}

          {currentRoom === 'instrument' && (
            <div className="max-w-7xl mx-auto">
              <InstrumentWorkstationView
                onRecordInstrumentToTrack={(title) => handleRecordKeysToTrack(title)}
              />
            </div>
          )}

          {currentRoom === 'songwriting' && (
            <div className="max-w-7xl mx-auto">
              <SongwritingView
                onUpdateLyrics={(sec, txt) => {}}
                onClose={() => handleSelectTab('CREATE')}
                focusedTrackName={tracks.find((t) => t.id === selectedTrackId)?.name || 'Kick (Thump)'}
                bpm={metadata.bpm}
              />
            </div>
          )}

          {currentRoom === 'vocal_to_lyric' && (
            <div className="max-w-7xl mx-auto">
              <VocalToLyricView
                onAcceptLyric={(lyric, section) => {
                  handleSelectRoom('songwriting');
                }}
              />
            </div>
          )}

          {(currentRoom === 'mix' || activeTab === 'MIX') && (
            <div className="max-w-7xl mx-auto">
              <MixRoomView
                tracks={tracks}
                onToggleMute={handleToggleMute}
                onToggleSolo={handleToggleSolo}
                onChangeVolume={handleChangeVolume}
                onProposeChangeSet={handleProposeChangeSet}
                onOpenStemExport={() => setIsStemExportOpen(true)}
              />
            </div>
          )}

          {(currentRoom === 'master' || activeTab === 'MASTER') && (
            <div className="max-w-7xl mx-auto">
              <MasterRoomView
                onExportMaster={() => handleSelectRoom('release')}
                playheadTime={playheadTime}
                isPlaying={isPlaying}
              />
            </div>
          )}

          {(currentRoom === 'release' || activeTab === 'RELEASE') && (
            <div className="max-w-7xl mx-auto">
              <ReleaseRoomView />
            </div>
          )}

          {currentRoom === 'collaboration' && (
            <div className="max-w-7xl mx-auto">
              <CollaborationRoomView
                metadata={metadata}
                tracks={tracks}
                onJumpToBar={(bar) => setCurrentBar(bar)}
              />
            </div>
          )}

          {/* System & Architecture Diagnostics */}
          {currentRoom === 'smir_inspector' && (
            <div className="max-w-7xl mx-auto">
              <SmirInspectorView intent={smirIntent} />
            </div>
          )}

          {currentRoom === 'pipeline' && (
            <div className="max-w-7xl mx-auto">
              <PipelineOrchestratorView stages={pipelineStages} />
            </div>
          )}

          {currentRoom === 'capability_registry' && (
            <div className="max-w-7xl mx-auto">
              <CapabilityRegistryView
                items={capabilityItems}
                onSwitchProvider={handleSwitchProvider}
              />
            </div>
          )}

          {currentRoom === 'seedsignature' && (
            <div className="max-w-7xl mx-auto">
              <ProvenanceRightsView metadata={metadata} />
            </div>
          )}

          {currentRoom === 'takes_revisions' && (
            <div className="max-w-7xl mx-auto">
              <RevisionTreeTakesView
                revisions={revisions}
                activeRevisionId={metadata.revision}
                onRestoreRevision={handleRestoreRevision}
              />
            </div>
          )}

          {currentRoom === 'calibration' && (
            <div className="max-w-7xl mx-auto">
              <CalibrationView />
            </div>
          )}
        </main>

        {/* Right Sidebar: Studio Intelligence Rail (Collapsible) */}
        {isIntelligenceOpen ? (
          <StudioIntelligencePanel
            isOpen={isIntelligenceOpen}
            onClose={() => setIsIntelligenceOpen(false)}
            focusedTrackName={tracks.find((t) => t.id === selectedTrackId)?.name || 'Kick (Thump)'}
            currentRoomName={activeTab || 'CREATE'}
            onProposeChangeSet={handleProposeChangeSet}
            onOpenPipeline={() => handleSelectRoom('pipeline')}
            onOpenSmir={() => handleSelectRoom('smir_inspector')}
            onOpenSeedSignature={() => handleSelectRoom('seedsignature')}
          />
        ) : (
          <button
            onClick={() => setIsIntelligenceOpen(true)}
            title="Expand Studio Intelligence"
            className="w-9 bg-[#070b16] border-l border-slate-800/90 hover:bg-[#0b1222] text-amber-400 flex flex-col items-center justify-start py-3 cursor-pointer transition-all z-20 group shrink-0 select-none"
          >
            <div className="w-6 h-6 rounded bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180 text-slate-400 group-hover:text-amber-300">
              STUDIO INTELLIGENCE
            </span>
            <div className="mt-3 text-[10px] text-cyan-400 font-bold">⬡</div>
          </button>
        )}
      </div>

      {/* 4. Footer bar */}
      <StudioFooter
        onOpenSeedSignature={() => handleSelectRoom('seedsignature')}
        onOpenRegistry={() => handleSelectRoom('capability_registry')}
      />

      {/* Modals */}
      <ChangeSetModal
        isOpen={isChangeSetModalOpen}
        changeSet={activeChangeSet}
        onClose={() => setIsChangeSetModalOpen(false)}
        onApply={handleApplyChangeSet}
        onAlternative={handleAlternativeChangeSet}
        onReject={handleRejectChangeSet}
      />

      <StudioLobbyModal
        isOpen={isLobbyModalOpen}
        metadata={metadata}
        onClose={() => setIsLobbyModalOpen(false)}
        onSwitchProject={(name) => setMetadata((m) => ({ ...m, name }))}
        onCreateNewProject={(name) => {
          setMetadata((m) => ({ ...m, name, revision: 1 }));
          setTracks(INITIAL_TRACKS);
        }}
      />

      <RecruitPlayerModal
        isOpen={isRecruitPlayerModalOpen}
        onClose={() => setIsRecruitPlayerModalOpen(false)}
        onRecruitPlayer={handleAddSessionPlayer}
        existingPlayerIds={sessionPlayers.map((p) => p.id)}
      />

      {/* Interactive MIDI Piano Roll Modal */}
      <MidiPianoRollModal
        isOpen={isPianoRollOpen}
        onClose={() => setIsPianoRollOpen(false)}
        initialNotes={pianoRollNotes}
        clipTitle={pianoRollTitle}
        onCommitNotes={handleCommitPianoRollNotes}
      />

      {/* Multi-Stem 24-bit WAV & MIDI ZIP Export Modal */}
      <StemExportModal
        isOpen={isStemExportOpen}
        onClose={() => setIsStemExportOpen(false)}
        tracks={tracks}
        metadata={metadata}
      />
    </div>
  );
}
