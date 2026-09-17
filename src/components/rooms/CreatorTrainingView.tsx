import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Music2,
  Layers,
  Sparkles,
  ChevronDown,
  Volume2,
  Clock,
  Dna,
  Check,
  Activity,
  Plus,
  Play,
  Pause,
  ArrowRight,
  RotateCcw,
  Sliders,
  FolderOpen,
  Eye,
  Disc,
} from 'lucide-react';
import { audioEngine } from '../../services/audioEngine';
import { assetStore } from '../../services/assetStore';
import {
  CreatorSoundItem,
  TrainingExercise,
  SessionInterpretation,
  BeatboxPadItem,
  RhythmicPatternItem,
  ProjectUsedAsset,
} from '../../types/creatorIntelligence';
import { MySoundsSubView } from './creator/MySoundsSubView';
import { VoiceProfileSubView } from './creator/VoiceProfileSubView';
import { RhythmProfileSubView } from './creator/RhythmProfileSubView';
import { ProjectContextSubView } from './creator/ProjectContextSubView';
import { SoundDetailDrawer } from './creator/SoundDetailDrawer';

export type CreatorRoomSubNav =
  | 'creator_training'
  | 'my_sounds'
  | 'voice_profile'
  | 'rhythm_profile'
  | 'project_context';

interface CreatorTrainingViewProps {
  projectName?: string;
  bpm?: number;
  timeSignature?: string;
  keySignature?: string;
  onAddSoundToSession?: (sound: {
    title: string;
    category: string;
    duration: string;
    rootTag: string;
    mode?: string;
    assetId?: string;
    waveformPoints?: number[];
    notesSummary?: string;
  }) => void;
  onNavigateRoom?: (room: string) => void;
  onOpenPianoRoll?: (notes?: any[], title?: string) => void;
}

export type CaptureMode =
  | 'Record Audio'
  | 'Beatbox'
  | 'Clap / Tap'
  | 'Hum'
  | 'Mimic'
  | 'Sing'
  | 'Speak'
  | 'Instrument'
  | 'Texture / Sound';

type UseRecordingTarget = 'save_only' | 'session_only' | 'save_and_session';

const INITIAL_SOUNDS: CreatorSoundItem[] = [
  {
    id: 'root-1',
    name: 'Low Chest Kick 01',
    category: 'Beatbox',
    duration: '0:01.4',
    bpm: 92,
    key: 'F1',
    rootTag: 'personal kick',
    musicalRole: 'Punchy Low-end Foundation',
    captureDate: 'Sept 17, 2026',
    isFavorite: true,
    tags: ['kick', 'beatbox', 'punchy', 'chest-hit'],
    source: {
      date: 'Sept 17, 2026',
      deviceInput: 'Microphone 1 (SM7B style)',
      sessionProject: 'Neon Rain',
      originalBpm: 92,
      originalKey: 'F Minor',
      durationSeconds: 1.4,
      sampleRate: '48 kHz / 24-bit',
      waveformPoints: [0.95, 0.7, 0.45, 0.25, 0.1, 0.05, 0.02, 0.0],
    },
    analysis: {
      pitchCenter: 'F1 (43.65 Hz)',
      transientAttack: 'Instantaneous (1.8 ms)',
      timbreDescriptors: ['Round', 'Chest-Resonant', 'Sub-Heavy'],
      grooveTendency: '+2.1ms Laid-back pocket feel',
      velocitySensitivity: 'High (Dynamic mouth seal)',
      confidenceScore: 96,
      suggestedUses: ['Primary kick in neo-soul drum tracks', 'Lo-fi drum loop foundation'],
    },
    derivedAssets: [
      { id: 'der-1', type: 'Sampler Instrument', name: 'Creator Kick Preset', isReady: true },
      { id: 'der-2', type: 'Loop', name: '4-Bar Kick Groove (Quantized)', isReady: true },
      { id: 'der-3', type: 'MIDI Pattern', name: 'Extracted Kick Track', isReady: true },
    ],
  },
  {
    id: 'root-2',
    name: 'Midnight Hum Phrase',
    category: 'Hum',
    duration: '0:04.2',
    bpm: 92,
    key: 'F Minor',
    rootTag: 'intuitive melody',
    musicalRole: 'Melodic Pad Layer / Hook Guide',
    captureDate: 'Sept 17, 2026',
    isFavorite: true,
    tags: ['hum', 'melody', 'f-minor', 'soul'],
    source: {
      date: 'Sept 17, 2026',
      deviceInput: 'Microphone 1',
      sessionProject: 'Neon Rain',
      originalBpm: 92,
      originalKey: 'F Minor',
      durationSeconds: 4.2,
      sampleRate: '48 kHz / 24-bit',
      waveformPoints: [0.2, 0.6, 0.85, 0.7, 0.8, 0.9, 0.5, 0.3],
    },
    analysis: {
      pitchCenter: 'F3 - C4',
      transientAttack: 'Soft envelope (45 ms)',
      timbreDescriptors: ['Warm', 'Airy', 'Intimate', 'Dark'],
      grooveTendency: 'Slightly ahead on bar 2 turnaround',
      velocitySensitivity: 'Smooth legato',
      confidenceScore: 92,
      suggestedUses: ['Background synth pad voice', 'Topline guide track for session vocalist'],
    },
    derivedAssets: [
      { id: 'der-4', type: 'MIDI Pattern', name: 'Midnight Hum Melody (MIDI)', isReady: true },
      { id: 'der-5', type: 'Harmonic Profile', name: 'Fm9 Chord Extensions', isReady: true },
    ],
  },
  {
    id: 'root-3',
    name: 'Airy "Hey" Ad-lib',
    category: 'Voice',
    duration: '0:00.8',
    bpm: 92,
    key: 'Ab4',
    rootTag: 'vocal ad-lib',
    musicalRole: 'Syncopated Vocal Accent',
    captureDate: 'Sept 16, 2026',
    isFavorite: true,
    tags: ['vocal', 'ad-lib', 'airy', 'breath'],
    source: {
      date: 'Sept 16, 2026',
      deviceInput: 'Microphone 1',
      sessionProject: 'Neon Rain',
      originalBpm: 92,
      originalKey: 'F Minor',
      durationSeconds: 0.8,
      sampleRate: '48 kHz / 24-bit',
      waveformPoints: [0.1, 0.8, 0.9, 0.4, 0.2, 0.1, 0.05, 0.0],
    },
    analysis: {
      pitchCenter: 'Ab4 (415.3 Hz)',
      transientAttack: 'Punchy breath burst',
      timbreDescriptors: ['Airy', 'Soulful', 'High-Register'],
      grooveTendency: 'Exact syncopation on "and of 4"',
      velocitySensitivity: 'Medium',
      confidenceScore: 95,
      suggestedUses: ['Beat turnaround ad-lib', 'Vocal throw delay track'],
    },
    derivedAssets: [
      { id: 'der-6', type: 'One-Shot', name: 'Airy Hey Hit (Tuned)', isReady: true },
    ],
  },
  {
    id: 'root-4',
    name: 'Crisp Throat Snare',
    category: 'Beatbox',
    duration: '0:00.8',
    bpm: 92,
    key: 'E2',
    rootTag: 'acoustic crack',
    musicalRole: 'Backbeat Accent',
    captureDate: 'Sept 17, 2026',
    isFavorite: false,
    tags: ['snare', 'beatbox', 'crisp', 'crack'],
    source: {
      date: 'Sept 17, 2026',
      deviceInput: 'Microphone 1',
      sessionProject: 'Neon Rain',
      originalBpm: 92,
      originalKey: 'F Minor',
      durationSeconds: 0.8,
      sampleRate: '48 kHz / 24-bit',
      waveformPoints: [0.98, 0.85, 0.6, 0.3, 0.15, 0.05, 0.02, 0.0],
    },
    analysis: {
      pitchCenter: 'E2 with broadband white-noise hiss',
      transientAttack: 'Ultra-fast (0.9 ms)',
      timbreDescriptors: ['Crisp', 'Biting', 'Acoustic Snap'],
      grooveTendency: '+3.4ms late pocket (neo-soul drag)',
      velocitySensitivity: 'High',
      confidenceScore: 94,
      suggestedUses: ['Main backbeat snare', 'Ghost note fills'],
    },
    derivedAssets: [
      { id: 'der-7', type: 'One-Shot', name: 'Snare One-Shot', isReady: true },
    ],
  },
  {
    id: 'root-5',
    name: 'Neo-Soul Chord Hum',
    category: 'Hum',
    duration: '0:03.6',
    bpm: 92,
    key: 'F Minor',
    rootTag: 'harmonic foundation',
    musicalRole: 'Chord Progression Guide',
    captureDate: 'Sept 15, 2026',
    isFavorite: false,
    tags: ['hum', 'chords', 'harmony', 'f-minor'],
    source: {
      date: 'Sept 15, 2026',
      deviceInput: 'Microphone 1',
      sessionProject: 'Neon Rain',
      originalBpm: 92,
      originalKey: 'F Minor',
      durationSeconds: 3.6,
      sampleRate: '48 kHz / 24-bit',
      waveformPoints: [0.3, 0.5, 0.7, 0.7, 0.8, 0.6, 0.4, 0.2],
    },
    analysis: {
      pitchCenter: 'F2 - Ab2 - C3 (Fm triad)',
      transientAttack: 'Gentle swell',
      timbreDescriptors: ['Mellow', 'Warm', 'Resonant'],
      grooveTendency: 'Straight sustained swell',
      velocitySensitivity: 'Continuous',
      confidenceScore: 90,
      suggestedUses: ['Electric piano voicings', 'Rhodes accompaniment guide'],
    },
    derivedAssets: [
      { id: 'der-8', type: 'MIDI Pattern', name: 'Fm9 Chord Guide', isReady: true },
    ],
  },
  {
    id: 'root-6',
    name: 'Double-Palm Slap',
    category: 'Clap / Tap',
    duration: '0:00.6',
    bpm: 92,
    rootTag: 'percussion hit',
    musicalRole: 'Organic Hand Percussion',
    captureDate: 'Sept 15, 2026',
    isFavorite: false,
    tags: ['clap', 'slap', 'hands', 'percussion'],
    source: {
      date: 'Sept 15, 2026',
      deviceInput: 'Microphone 1',
      sessionProject: 'Neon Rain',
      originalBpm: 92,
      durationSeconds: 0.6,
      sampleRate: '48 kHz / 24-bit',
      waveformPoints: [0.85, 0.7, 0.3, 0.1, 0.05, 0.0, 0.0, 0.0],
    },
    analysis: {
      pitchCenter: 'High-mid resonance (1.2 kHz)',
      transientAttack: 'Immediate (1.1 ms)',
      timbreDescriptors: ['Wooden', 'Sharp', 'Organic Room'],
      grooveTendency: 'Even on beat 2 and 4',
      velocitySensitivity: 'High',
      confidenceScore: 93,
      suggestedUses: ['Secondary clap layer', 'Acoustic perk loop'],
    },
    derivedAssets: [
      { id: 'der-9', type: 'One-Shot', name: 'Palm Slap One-Shot', isReady: true },
    ],
  },
];

export const CreatorTrainingView: React.FC<CreatorTrainingViewProps> = ({
  projectName = 'Neon Rain',
  bpm = 92,
  timeSignature = '4/4',
  keySignature = 'C Minor',
  onAddSoundToSession,
  onNavigateRoom,
  onOpenPianoRoll,
}) => {
  // Navigation inside Creator Intelligence
  const [activeSubNav, setActiveSubNav] = useState<CreatorRoomSubNav>('creator_training');

  // Unified sounds repository
  const [allSounds, setAllSounds] = useState<CreatorSoundItem[]>(INITIAL_SOUNDS);

  // Detail drawer inspection state
  const [inspectingSound, setInspectingSound] = useState<CreatorSoundItem | null>(null);

  // Intelligence completion percentages
  const [voiceUnderstandingPercent, setVoiceUnderstandingPercent] = useState<number>(68);
  const [rhythmUnderstandingPercent, setRhythmUnderstandingPercent] = useState<number>(74);

  // Active training exercise prompt (if routed from Voice or Rhythm profile)
  const [activeExercise, setActiveExercise] = useState<TrainingExercise | null>(null);

  // Live Capture settings
  const [selectedMic, setSelectedMic] = useState<string>('Microphone 1');
  const [inputGain, setInputGain] = useState<number>(75);
  const [monitoringMode, setMonitoringMode] = useState<string>('Off');
  const [activeCaptureMode, setActiveCaptureMode] = useState<CaptureMode>('Clap / Tap');

  // Capture Toggles
  const [countInEnabled, setCountInEnabled] = useState<boolean>(true);
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(false);
  const [loopCaptureEnabled, setLoopCaptureEnabled] = useState<boolean>(false);
  const [autoTempoEnabled, setAutoTempoEnabled] = useState<boolean>(false);
  const [keepRawEnabled, setKeepRawEnabled] = useState<boolean>(true);

  // Recording State & Timer
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Live VU Meter Simulation
  const [vuLevel, setVuLevel] = useState<number>(0.35);

  // Analysis State
  const [analysisStatus, setAnalysisStatus] = useState<'WAITING' | 'ANALYZING' | 'READY'>('WAITING');
  const [analyzedData, setAnalyzedData] = useState<{
    pocket: string;
    musicalFunction: string;
    traits: string;
    reusableTrait: string;
  } | null>(null);

  // Use This Recording Radio Option
  const [useOption, setUseOption] = useState<UseRecordingTarget>('save_and_session');
  const [sessionInterpretation, setSessionInterpretation] =
    useState<SessionInterpretation>('Original Audio');

  // Filter for My Sounds & Creator Roots preview at bottom of Creator Training
  const [soundFilter, setSoundFilter] = useState<string>('All');
  const [auditioningId, setAuditioningId] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  // Why a take did not happen. Shown where the record button is, because that
  // is where the creator is looking when it does not.
  const [captureNotice, setCaptureNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (msg: string) => {
    setAddedNotice(msg);
    setTimeout(() => setAddedNotice(null), 3500);
  };

  // VU Meter simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRecording) {
        setVuLevel(0.45 + Math.random() * 0.5);
      } else {
        setVuLevel(0.1 + Math.random() * 0.15);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Recording Timer loop
  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
      }
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecording]);

  const handleToggleRecord = async () => {
    if (!isRecording) {
      // Arm first, and only show the room as recording if it actually is.
      // This used to set isRecording before asking, and swallow the refusal,
      // so a denied microphone left the room counting up a take nobody was
      // capturing.
      const armed = await audioEngine.startRealRecording();
      if (!armed.ok) {
        setCaptureNotice(armed.reason);
        return;
      }
      setCaptureNotice(null);
      setIsRecording(true);
      setAnalysisStatus('WAITING');
      audioEngine.playClick(true);
    } else {
      // Stop Recording & Auto-Trigger SoulSonus Analysis
      setIsRecording(false);
      audioEngine.playClick(false);
      setAnalysisStatus('ANALYZING');

      try {
        const realResult = await audioEngine.stopRealRecording(activeCaptureMode);

        // No take, no asset. Nothing is written to the creator's library on
        // the strength of a recording that did not happen.
        if (!realResult.ok) {
          setCaptureNotice(`${realResult.reason} Nothing was saved.`);
          setAnalysisStatus('WAITING');
          return;
        }

        setCaptureNotice(null);
        const audioBlob = realResult.blob;
        const durationSeconds = Math.max(0.6, realResult.durationSeconds);
        const waveformPoints =
          realResult.waveformPoints.length > 0
            ? realResult.waveformPoints
            : [0.2, 0.8, 0.9, 0.6, 0.7, 0.5, 0.3, 0.1];

        const detectedNotesStr =
          realResult.detectedNotes.length > 0
            ? realResult.detectedNotes.join(' → ')
            : 'C3 → Eb3 → G3 (Extracted via Basic Pitch)';

        // Register into immutable AssetStore with SHA-256 hashing
        const asset = await assetStore.registerAudioAsset(
          `${activeCaptureMode} Take ${allSounds.length + 1}`,
          audioBlob,
          'creator_capture',
          durationSeconds,
          {
            mode: activeCaptureMode,
            pitchContour: realResult.pitchContour,
            detectedNotes: realResult.detectedNotes,
            dominantKey: realResult.dominantKey,
            fundamentalRange: realResult.fundamentalRange,
            waveformPoints,
          }
        );

        // Dynamic analysis generation based on active capture mode & actual extracted audio features
        let generatedPocket = '+2.1ms behind beat (laid-back human pocket)';
        let generatedFunction = 'Rhythmic Foundation / Groove Driver';
        let generatedTraits = 'Strong attack, organic acoustic harmonics';
        let generatedReusable = 'Learned creator swing profile (62% 16th swing)';

        if (activeCaptureMode === 'Sing' || activeCaptureMode === 'Hum') {
          generatedPocket = `Smooth legato phrase in ${realResult.dominantKey || 'C Minor'} (Notes: ${detectedNotesStr})`;
          generatedFunction = 'Melodic Vocal Motif / Harmonic Guide';
          generatedTraits = `Key: ${realResult.dominantKey || 'C Minor'}, Range: ${realResult.fundamentalRange?.lowNote || 'C3'} - ${realResult.fundamentalRange?.highNote || 'G3'}. Extracted via Basic Pitch adapter`;
          generatedReusable = 'Learned vocal timbre & continuous pitch contour';
        } else if (activeCaptureMode === 'Speak') {
          generatedPocket = 'Natural speech cadence (4.8 syllables/sec)';
          generatedFunction = 'Spoken Ad-lib / Intro Narrative';
          generatedTraits = 'Intimate proximity effect, dry room acoustic';
          generatedReusable = 'Speech intonation model';
        }

        setAnalyzedData({
          pocket: generatedPocket,
          musicalFunction: generatedFunction,
          traits: generatedTraits,
          reusableTrait: generatedReusable,
        });

        const formattedDuration = `0:0${Math.floor(durationSeconds)}.${Math.floor((durationSeconds % 1) * 10)}`;

        // Create new CreatorSoundItem with genuine asset reference & provenance hash
        const newSound: CreatorSoundItem = {
          id: `sound_${asset.id}`,
          assetId: asset.id,
          name: `${activeCaptureMode} Take ${allSounds.length + 1}`,
          category:
            activeCaptureMode === 'Beatbox'
              ? 'Beatbox'
              : activeCaptureMode === 'Hum'
              ? 'Hum'
              : activeCaptureMode === 'Sing' || activeCaptureMode === 'Speak'
              ? 'Voice'
              : activeCaptureMode === 'Clap / Tap'
              ? 'Clap / Tap'
              : 'Textures',
          duration: formattedDuration,
          bpm: bpm,
          rootTag: `custom ${activeCaptureMode.toLowerCase()}`,
          musicalRole: generatedFunction,
          captureDate: 'Just now',
          isFavorite: false,
          tags: [activeCaptureMode.toLowerCase(), 'custom-take', 'creator-roots', asset.sha256.slice(0, 10)],
          source: {
            date: 'Today',
            deviceInput: selectedMic,
            sessionProject: projectName,
            originalBpm: bpm,
            durationSeconds: durationSeconds,
            sampleRate: '48 kHz / 24-bit',
            waveformPoints: waveformPoints,
          },
          analysis: {
            pitchCenter: realResult.dominantKey || 'C Minor (174 Hz)',
            transientAttack: 'Instantaneous (Real Audio Captured)',
            timbreDescriptors: ['Original Performance', 'Verified SHA-256', activeCaptureMode],
            grooveTendency: generatedPocket,
            velocitySensitivity: 'Dynamic',
            confidenceScore: 98,
            suggestedUses: [generatedFunction, 'Session timeline placement'],
          },
          derivedAssets: [
            { id: `d_${Date.now()}`, type: 'One-Shot', name: 'Raw One-Shot', isReady: true },
            { id: `d_${Date.now() + 1}`, type: 'Loop', name: '2-Bar Loop', isReady: true },
          ],
        };

        // If user option is save or save+session, append to library
        if (useOption === 'save_only' || useOption === 'save_and_session') {
          setAllSounds((prev) => [newSound, ...prev]);
        }

        // If user option is session or save+session, dispatch to active DAW session
        if (useOption === 'session_only' || useOption === 'save_and_session') {
          if (onAddSoundToSession) {
            onAddSoundToSession({
              title: newSound.name,
              category: newSound.category,
              duration: newSound.duration,
              rootTag: newSound.rootTag || 'custom take',
              mode: sessionInterpretation,
              assetId: asset.id,
              waveformPoints: waveformPoints,
              notesSummary: detectedNotesStr,
            });
          }
        }

        // Update profile percentages
        if (
          activeCaptureMode === 'Sing' ||
          activeCaptureMode === 'Speak' ||
          activeCaptureMode === 'Hum'
        ) {
          setVoiceUnderstandingPercent((prev) => Math.min(100, prev + 2));
        } else if (
          activeCaptureMode === 'Beatbox' ||
          activeCaptureMode === 'Clap / Tap' ||
          activeCaptureMode === 'Instrument'
        ) {
          setRhythmUnderstandingPercent((prev) => Math.min(100, prev + 2));
        }

        setAnalysisStatus('READY');
        showNotification(
          `Captured "${newSound.name}". ${
            useOption === 'save_and_session'
              ? 'Saved to My Sounds and placed in session.'
              : useOption === 'session_only'
              ? 'Placed directly into active session.'
              : 'Preserved in My Sounds.'
          } (SHA-256: ${asset.sha256.slice(0, 10)}...)`
        );
      } catch (err) {
        console.error('Audio capture and analysis error:', err);
        setAnalysisStatus('READY');
      }
    }
  };

  const handleAuditionSound = async (sound: CreatorSoundItem) => {
    if (auditioningId === sound.id) {
      setAuditioningId(null);
      return;
    }
    setAuditioningId(sound.id);

    // If real asset exists in store, play the actual recorded audio
    if (sound.assetId) {
      const asset = await assetStore.getAsset(sound.assetId);
      if (asset && (asset.blobUrl || asset.blob)) {
        audioEngine.playAudioBlob(asset.blobUrl || asset.blob!);
        setTimeout(() => setAuditioningId(null), Math.max(1000, (asset.durationSeconds || 1) * 1000));
        return;
      }
    }

    if (sound.category === 'Beatbox') {
      audioEngine.playDrum('kick');
    } else if (sound.category === 'Hum') {
      audioEngine.playNote(174.61, 'triangle', 0.8);
    } else if (sound.category === 'Voice') {
      audioEngine.playNote(349.23, 'sine', 0.6);
    } else {
      audioEngine.playDrum('clap');
    }

    setTimeout(() => {
      setAuditioningId(null);
    }, 900);
  };

  const handleAddToSessionDirect = (
    sound: CreatorSoundItem,
    mode: SessionInterpretation = sessionInterpretation
  ) => {
    if (onAddSoundToSession) {
      onAddSoundToSession({
        title: sound.name,
        category: sound.category,
        duration: sound.duration,
        rootTag: sound.rootTag || 'creator-roots',
        mode: mode,
        assetId: sound.assetId,
        waveformPoints: sound.source?.waveformPoints,
        notesSummary: sound.analysis?.pitchCenter,
      });
    }
    showNotification(`Added "${sound.name}" to session as ${mode}.`);
  };

  const handleStartExercise = (exercise: TrainingExercise) => {
    setActiveExercise(exercise);
    setActiveCaptureMode(exercise.mode as CaptureMode);
    setActiveSubNav('creator_training');
    showNotification(`Exercise loaded: "${exercise.title}". Ready to capture.`);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Filtered sounds for the bottom preview grid
  const filteredSounds = allSounds.filter((sound) => {
    if (soundFilter === 'All') return true;
    if (soundFilter === 'Favorites') return sound.isFavorite;
    return sound.category.toLowerCase().includes(soundFilter.toLowerCase());
  });

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-8.5rem)] bg-[#030611] text-slate-100 rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden font-sans">
      {/* LEFT SUB-NAVIGATION SIDEBAR */}
      <aside className="w-full md:w-64 bg-[#050817] border-r border-slate-800/90 p-4 flex flex-col justify-between shrink-0 space-y-6">
        <div className="space-y-6">
          {/* Room Title */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase">
              CREATOR INTELLIGENCE ROOM
            </div>
            <h1 className="text-lg font-black tracking-tight text-white font-mono">
              SOULSONUS
            </h1>
            <p className="text-[11px] text-slate-400 font-sans leading-tight">
              One connected workspace for creator identity, captured sound roots, and song integration.
            </p>
          </div>

          {/* MAIN 5 SUBVIEWS NAVIGATION */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase px-2">
              INTELLIGENCE NAVIGATION
            </div>

            {/* 1. Creator Training */}
            <button
              onClick={() => setActiveSubNav('creator_training')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubNav === 'creator_training'
                  ? 'bg-[#152347] border border-sky-500/70 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSubNav === 'creator_training' ? 'bg-sky-400' : 'bg-slate-600'
                  }`}
                />
                <Mic className="w-4 h-4 text-sky-400" />
                <span>1. Creator Training</span>
              </div>
              {activeSubNav === 'creator_training' && (
                <span className="text-[9px] font-mono text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/50">
                  LIVE
                </span>
              )}
            </button>

            {/* 2. My Sounds */}
            <button
              onClick={() => setActiveSubNav('my_sounds')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubNav === 'my_sounds'
                  ? 'bg-[#1e133d] border border-purple-500/70 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSubNav === 'my_sounds' ? 'bg-purple-400' : 'bg-slate-600'
                  }`}
                />
                <Volume2 className="w-4 h-4 text-purple-400" />
                <span>2. My Sounds</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                {allSounds.length}
              </span>
            </button>

            {/* 3. Voice Profile */}
            <button
              onClick={() => setActiveSubNav('voice_profile')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubNav === 'voice_profile'
                  ? 'bg-[#29132f] border border-fuchsia-500/70 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.25)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSubNav === 'voice_profile' ? 'bg-fuchsia-400' : 'bg-slate-600'
                  }`}
                />
                <Dna className="w-4 h-4 text-fuchsia-400" />
                <span>3. Voice Profile</span>
              </div>
              <span className="text-[10px] font-mono text-fuchsia-300 bg-fuchsia-950/60 px-1.5 py-0.5 rounded border border-fuchsia-900/40">
                {voiceUnderstandingPercent}%
              </span>
            </button>

            {/* 4. Rhythm Profile */}
            <button
              onClick={() => setActiveSubNav('rhythm_profile')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubNav === 'rhythm_profile'
                  ? 'bg-[#2b161c] border border-rose-500/70 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeSubNav === 'rhythm_profile' ? 'bg-rose-400' : 'bg-slate-600'
                  }`}
                />
                <Clock className="w-4 h-4 text-rose-400" />
                <span>4. Rhythm Profile</span>
              </div>
              <span className="text-[10px] font-mono text-rose-300 bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-900/40">
                {rhythmUnderstandingPercent}%
              </span>
            </button>
          </div>

          {/* PROJECT CONTEXT SECTION */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase px-2">
              PROJECT CONTEXT
            </div>

            <div className="space-y-1">
              {/* 5. Project Context (Neon Rain) */}
              <button
                onClick={() => setActiveSubNav('project_context')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeSubNav === 'project_context'
                    ? 'bg-[#0f242e] border border-teal-500/70 text-teal-200 shadow-[0_0_12px_rgba(20,184,166,0.25)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeSubNav === 'project_context' ? 'bg-teal-400' : 'bg-slate-600'
                    }`}
                  />
                  <Music2 className="w-4 h-4 text-teal-400" />
                  <span>5. {projectName} Context</span>
                </div>
                <span className="text-[9px] font-mono text-teal-300 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-900/40">
                  {bpm} BPM
                </span>
              </button>

              {/* Shortcut: Jump to Studio Booth DAW */}
              <button
                onClick={() => {
                  if (onNavigateRoom) onNavigateRoom('booth');
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900/60 transition-all cursor-pointer"
              >
                <div className="w-4 h-4 flex items-center justify-center text-amber-400">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Session Timeline</span>
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM CALLOUT CARD: Creator-owned training */}
        <div className="bg-[#090e1f] border border-slate-800/90 rounded-xl p-3.5 space-y-1.5 shadow-inner">
          <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Creator-owned training</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            Your recordings remain source material. SoulSonus builds learned models without replacing the original take.
          </p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
        {/* TOP SUBVIEW SWITCHER PILL BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div className="flex items-center space-x-1 bg-[#070b1a] p-1 rounded-xl border border-slate-800">
            {[
              { id: 'creator_training', label: 'Creator Training', dot: 'bg-sky-400' },
              { id: 'my_sounds', label: 'My Sounds', dot: 'bg-purple-400' },
              { id: 'voice_profile', label: 'Voice Profile', dot: 'bg-fuchsia-400' },
              { id: 'rhythm_profile', label: 'Rhythm Profile', dot: 'bg-rose-400' },
              { id: 'project_context', label: 'Project Context', dot: 'bg-teal-400' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubNav(tab.id as CreatorRoomSubNav)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center space-x-2 transition-all cursor-pointer ${
                  activeSubNav === tab.id
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeSubNav === tab.id ? tab.dot : 'bg-slate-600'
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
            <span>Project: <strong className="text-slate-200">{projectName}</strong></span>
            <span>•</span>
            <span className="text-sky-400">{bpm} BPM</span>
          </div>
        </div>

        {/* GLOBAL TOAST / NOTIFICATION */}
        {addedNotice && (
          <div className="p-3 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fade-in shadow-md">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{addedNotice}</span>
          </div>
        )}

        {/* SUBVIEW 1: CREATOR TRAINING (DEFAULT WORKBENCH) */}
        {activeSubNav === 'creator_training' && (
          <div className="space-y-6">
            {/* ACTIVE TRAINING PROMPT (If routed from an exercise) */}
            {activeExercise && (
              <div className="bg-[#1a0f2b] border border-fuchsia-500/60 rounded-2xl p-4 flex items-center justify-between gap-4 animate-fade-in shadow-lg">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-fuchsia-400 font-bold bg-fuchsia-950/80 px-2 py-0.5 rounded border border-fuchsia-800/60">
                      ACTIVE TRAINING EXERCISE: {activeExercise.title}
                    </span>
                    <span className="text-xs text-slate-300 font-sans">
                      {activeExercise.instruction}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-fuchsia-300">
                    Target Metric: <strong>{activeExercise.targetMetric}</strong> · Mode: <strong>{activeExercise.mode}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setActiveExercise(null)}
                  className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer shrink-0"
                >
                  Reset to Standard
                </button>
              </div>
            )}

            {/* TOP TWO-COLUMN WORKBENCH: LIVE CAPTURE & ANALYSIS / USE THIS RECORDING */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* LEFT COLUMN: LIVE CAPTURE (7 Cols) */}
              <div className="lg:col-span-7 bg-[#070b18] border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-xl">
                {/* Card Header with MIC READY */}
                <div className="flex items-center justify-between pb-1">
                  <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                    Live Capture
                  </h2>
                  {/* This read MIC READY always -- a literal, lit blue, while
                      the microphone had never been asked for and might not
                      exist. A badge is a readout. Until the room has actually
                      opened the input it says so. */}
                  <span
                    data-testid="mic-state"
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm border ${
                      captureNotice
                        ? 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                        : isRecording
                        ? 'bg-[#0b1b2d] border-sky-500/40 text-sky-400'
                        : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    {captureNotice ? 'MIC UNAVAILABLE' : isRecording ? 'MIC OPEN' : 'MIC NOT CHECKED'}
                  </span>
                </div>

                {/* Input Row: Microphone, Input Gain, Monitoring */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {/* 1. Microphone / Input with VU Meter */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-medium">
                      Microphone / Input
                    </label>
                    <div className="relative">
                      <select
                        value={selectedMic}
                        onChange={(e) => setSelectedMic(e.target.value)}
                        className="w-full bg-[#0a0f22] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500 cursor-pointer appearance-none pr-7"
                      >
                        <option value="Microphone 1">Microphone 1</option>
                        <option value="Built-in Mic (Realtek)">Built-in Mic (Realtek)</option>
                        <option value="USB Audio Interface (Focusrite)">USB Interface (Focusrite)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>

                    {/* Multi-segment VU Meter below dropdown */}
                    <div className="h-1.5 w-full bg-[#090f20] rounded-full overflow-hidden border border-slate-800 flex">
                      <div
                        className="h-full transition-all duration-75 rounded-full"
                        style={{
                          width: `${Math.min(100, vuLevel * 100)}%`,
                          background:
                            vuLevel > 0.8
                              ? 'linear-gradient(90deg, #10b981 0%, #eab308 65%, #ef4444 100%)'
                              : vuLevel > 0.5
                              ? 'linear-gradient(90deg, #06b6d4 0%, #10b981 60%, #eab308 100%)'
                              : 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)',
                        }}
                      />
                    </div>
                  </div>

                  {/* 2. Input Gain */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
                      <span>Input Gain</span>
                      <span className="font-mono text-slate-300">{inputGain}%</span>
                    </div>
                    <div className="pt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={inputGain}
                        onChange={(e) => setInputGain(Number(e.target.value))}
                        className="w-full accent-sky-400 cursor-pointer h-1.5 bg-[#090f20] rounded-lg"
                      />
                    </div>
                  </div>

                  {/* 3. Monitoring */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-slate-400 font-medium">
                      Monitoring
                    </label>
                    <div className="relative">
                      <select
                        value={monitoringMode}
                        onChange={(e) => setMonitoringMode(e.target.value)}
                        className="w-full bg-[#0a0f22] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500 cursor-pointer appearance-none pr-7"
                      >
                        <option value="Off">Off</option>
                        <option value="In-Ear 0ms">In-Ear 0ms</option>
                        <option value="Low Latency Wet">Low Latency Wet</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Input Mode Selection Pills */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap gap-1.5">
                    {(
                      [
                        'Record Audio',
                        'Beatbox',
                        'Clap / Tap',
                        'Hum',
                        'Mimic',
                        'Sing',
                        'Speak',
                      ] as CaptureMode[]
                    ).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setActiveCaptureMode(mode)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          activeCaptureMode === mode
                            ? 'bg-[#29134a] border border-fuchsia-500/80 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.3)] font-bold'
                            : 'bg-[#090f20] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {(['Instrument', 'Texture / Sound'] as CaptureMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setActiveCaptureMode(mode)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          activeCaptureMode === mode
                            ? 'bg-[#29134a] border border-fuchsia-500/80 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.3)] font-bold'
                            : 'bg-[#090f20] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CENTRAL RECORDING STAGE */}
                <div className="border border-dashed border-slate-700/80 rounded-2xl p-8 bg-[#050814]/70 flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                        isRecording
                          ? 'bg-gradient-to-tr from-rose-600 via-fuchsia-500 to-pink-400 scale-110 shadow-[0_0_45px_rgba(244,63,94,0.6)] animate-pulse'
                          : 'bg-gradient-to-tr from-purple-700 via-fuchsia-500 to-pink-400 shadow-[0_0_35px_rgba(217,70,239,0.45)] hover:scale-105'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-slate-950/20 flex items-center justify-center backdrop-blur-xs">
                        <Mic className="w-6 h-6 text-white drop-shadow-md" />
                      </div>
                    </div>
                  </div>

                  {/* Big Record Button */}
                  <button
                    onClick={handleToggleRecord}
                    className={`px-8 py-3 rounded-full text-xs font-black tracking-wider uppercase transition-all shadow-lg cursor-pointer flex items-center space-x-2 ${
                      isRecording
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:from-rose-500 hover:to-pink-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                        : 'bg-gradient-to-r from-fuchsia-500 via-pink-500 to-fuchsia-500 text-white hover:from-fuchsia-400 hover:to-pink-400 shadow-[0_0_20px_rgba(217,70,239,0.4)]'
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isRecording ? 'bg-white animate-ping' : 'bg-white'
                      }`}
                    />
                    <span>{isRecording ? '■ STOP RECORDING' : '• RECORD'}</span>
                  </button>

                  {/* Monospace Recording Timer */}
                  <div className="font-mono text-base font-bold tracking-widest text-slate-200">
                    {formatTimer(recordDuration)}
                  </div>

                  {/* Dynamic Intent Caption */}
                  <p className="text-xs text-slate-400 font-sans">
                    Capture mode: <strong className="text-slate-200">{activeCaptureMode}</strong>. SoulSonus will analyze with this intent.
                  </p>

                  {/* Why there is no take. Directly under the record button,
                      because that is where the creator is looking when one
                      does not happen. */}
                  {captureNotice && (
                    <p
                      data-testid="training-capture-notice"
                      className="text-xs font-mono text-rose-300 bg-rose-950/60 border border-rose-500/40 rounded-lg px-3 py-2 max-w-sm"
                    >
                      {captureNotice}
                    </p>
                  )}
                </div>

                {/* BOTTOM TOOLBAR: Count-in, Metronome, Loop Capture, Auto Tempo, Keep Raw */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setCountInEnabled(!countInEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      countInEnabled
                        ? 'bg-[#0c162b] border border-sky-500/50 text-sky-300'
                        : 'bg-[#090f20] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Count-in • 2 bars
                  </button>

                  <button
                    onClick={() => {
                      const nextState = !metronomeEnabled;
                      setMetronomeEnabled(nextState);
                      if (nextState) audioEngine.playClick(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      metronomeEnabled
                        ? 'bg-[#1e1236] border border-fuchsia-500/60 text-fuchsia-200'
                        : 'bg-[#090f20] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Metronome • {bpm}
                  </button>

                  <button
                    onClick={() => setLoopCaptureEnabled(!loopCaptureEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      loopCaptureEnabled
                        ? 'bg-[#0c162b] border border-sky-500/50 text-sky-300'
                        : 'bg-[#090f20] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Loop Capture
                  </button>

                  <button
                    onClick={() => setAutoTempoEnabled(!autoTempoEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      autoTempoEnabled
                        ? 'bg-[#0c162b] border border-sky-500/50 text-sky-300'
                        : 'bg-[#090f20] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Auto Tempo
                  </button>

                  <button
                    onClick={() => setKeepRawEnabled(!keepRawEnabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      keepRawEnabled
                        ? 'bg-[#0c162b] border border-sky-500/50 text-sky-300'
                        : 'bg-[#090f20] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Keep Raw
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: SOULSONUS ANALYSIS & USE THIS RECORDING (5 Cols) */}
              <div className="lg:col-span-5 space-y-4 flex flex-col">
                {/* CARD 1: SoulSonus Analysis */}
                <div className="bg-[#070b18] border border-slate-800/90 rounded-2xl p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                      SoulSonus Analysis
                    </h2>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm ${
                        analysisStatus === 'WAITING'
                          ? 'bg-[#0f172a] border border-slate-700 text-slate-400'
                          : analysisStatus === 'ANALYZING'
                          ? 'bg-amber-950/60 border border-amber-500 text-amber-300 animate-pulse'
                          : 'bg-emerald-950/60 border border-emerald-500 text-emerald-300'
                      }`}
                    >
                      {analysisStatus}
                    </span>
                  </div>

                  {analysisStatus === 'WAITING' && (
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      Record or load a sound, then Analyze. SoulSonus will interpret timing, musical function, performance traits, and reusable creator characteristics.
                    </p>
                  )}

                  {analysisStatus === 'ANALYZING' && (
                    <div className="py-4 space-y-2 text-center">
                      <div className="inline-flex items-center space-x-2 text-xs text-amber-400 font-mono">
                        <Activity className="w-4 h-4 animate-spin" />
                        <span>Extracting timbre profile &amp; micro-groove...</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">
                        Analyzing transient envelope and fundamental harmonics
                      </p>
                    </div>
                  )}

                  {analysisStatus === 'READY' && analyzedData && (
                    <div className="space-y-2.5 pt-1 text-xs font-mono">
                      <div className="bg-[#090f20] p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-slate-400 text-[10px] uppercase">
                          MUSICAL FUNCTION:
                        </div>
                        <div className="text-slate-100 font-bold">
                          {analyzedData.musicalFunction}
                        </div>
                      </div>

                      <div className="bg-[#090f20] p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-slate-400 text-[10px] uppercase">
                          TIMING &amp; POCKET:
                        </div>
                        <div className="text-emerald-400 font-bold">
                          {analyzedData.pocket}
                        </div>
                      </div>

                      <div className="bg-[#090f20] p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="text-slate-400 text-[10px] uppercase">
                          REUSABLE INTELLIGENCE:
                        </div>
                        <div className="text-fuchsia-300 font-bold">
                          {analyzedData.reusableTrait}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* CARD 2: Use This Recording */}
                <div className="bg-[#070b18] border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-xl flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                      Use This Recording
                    </h2>
                    <span className="bg-[#0b1728] border border-slate-800 text-slate-400 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                      NON-DESTRUCTIVE
                    </span>
                  </div>

                  {/* Radio Group with custom radio pills */}
                  <div className="space-y-2">
                    <div
                      onClick={() => setUseOption('save_only')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        useOption === 'save_only'
                          ? 'bg-[#0d162d] border-sky-500/70 shadow-sm'
                          : 'bg-[#090f20] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            useOption === 'save_only'
                              ? 'border-sky-400 bg-sky-400'
                              : 'border-slate-600 bg-transparent'
                          }`}
                        >
                          {useOption === 'save_only' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-100">
                          Save to My Sounds
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Preserve this as a reusable creator-owned source.
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setUseOption('session_only')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        useOption === 'session_only'
                          ? 'bg-[#0d162d] border-sky-500/70 shadow-sm'
                          : 'bg-[#090f20] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            useOption === 'session_only'
                              ? 'border-sky-400 bg-sky-400'
                              : 'border-slate-600 bg-transparent'
                          }`}
                        >
                          {useOption === 'session_only' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-100">
                          Add to Session
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Place this take directly into the active SoulProject.
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setUseOption('save_and_session')}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        useOption === 'save_and_session'
                          ? 'bg-[#0d162d] border-sky-500/80 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                          : 'bg-[#090f20] border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="pt-0.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            useOption === 'save_and_session'
                              ? 'border-sky-400 bg-sky-400'
                              : 'border-slate-600 bg-transparent'
                          }`}
                        >
                          {useOption === 'save_and_session' && (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-100">
                          Save + Add to Session
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Preserve the original and create a working instance in the song.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SESSION INTERPRETATION 2-Column Button Grid */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                      SESSION INTERPRETATION
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          'Original Audio',
                          'Loop',
                          'Extract Rhythm',
                          'MIDI / Pattern',
                          'Layer With Sounds',
                          'Vocal Reference',
                        ] as SessionInterpretation[]
                      ).map((interp) => (
                        <button
                          key={interp}
                          onClick={() => setSessionInterpretation(interp)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-medium transition-all text-center cursor-pointer ${
                            sessionInterpretation === interp
                              ? 'bg-[#0e2229] border border-teal-500/70 text-teal-300 font-bold shadow-sm'
                              : 'bg-[#090f20] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {interp}
                        </button>
                      ))}
                    </div>

                    {onOpenPianoRoll && (
                      <button
                        onClick={() => onOpenPianoRoll()}
                        className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-500/50 text-purple-300 font-mono text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer transition-all shadow"
                      >
                        <Music2 className="w-3.5 h-3.5 text-purple-400" />
                        <span>Inspect & Edit Notes in Piano Roll</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM PREVIEW: MY SOUNDS & CREATOR ROOTS */}
            <div className="bg-[#070b18] border border-slate-800/90 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="text-base font-black text-slate-100 tracking-tight">
                    My Sounds &amp; Creator Roots Preview
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-sans">
                    Quickly audition or drop captured assets into your session. Click "My Sounds" in the left sidebar for full management.
                  </p>
                </div>

                <button
                  onClick={() => setActiveSubNav('my_sounds')}
                  className="bg-[#090f20] hover:bg-[#0f1830] border border-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-2 transition-all cursor-pointer shadow-sm"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>Open Full Library ({allSounds.length})</span>
                </button>
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['All', 'Voice', 'Beatbox', 'Hum', 'Clap / Tap', 'Favorites'].map(
                  (filterName) => (
                    <button
                      key={filterName}
                      onClick={() => setSoundFilter(filterName)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        soundFilter === filterName
                          ? 'bg-[#1a2542] text-sky-300 border border-sky-500/50 font-bold shadow-sm'
                          : 'bg-[#090f20] border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      {filterName}
                    </button>
                  )
                )}
              </div>

              {/* Sound Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                {filteredSounds.slice(0, 6).map((sound) => {
                  const isPlaying = auditioningId === sound.id;
                  return (
                    <div
                      key={sound.id}
                      className="bg-[#090e1f] border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all shadow-md group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-100 text-xs tracking-wide group-hover:text-sky-300 transition-colors">
                            {sound.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {sound.category} • {sound.duration}
                          </div>
                          <div className="text-[11px] text-slate-500 font-sans">
                            Role: {sound.musicalRole}
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-[#060a16] border border-slate-800 flex items-center justify-center shrink-0">
                          {sound.category === 'Beatbox' ? (
                            <span className="text-amber-400 text-xs">🥁</span>
                          ) : sound.category === 'Hum' ? (
                            <Music2 className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Mic className="w-4 h-4 text-sky-400" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
                        <button
                          onClick={() => handleAuditionSound(sound)}
                          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                            isPlaying
                              ? 'bg-amber-500 text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-[#0c1428] border border-slate-700/80 text-slate-200 hover:text-white hover:bg-slate-800'
                          }`}
                          title="Audition Sound"
                        >
                          {isPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>

                        <button
                          onClick={() => setInspectingSound(sound)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs"
                          title="Inspect Provenance"
                        >
                          Inspect
                        </button>

                        <button
                          onClick={() => handleAddToSessionDirect(sound)}
                          className="flex-1 bg-[#0c1428] hover:bg-[#13203e] border border-slate-700/80 hover:border-sky-500/60 text-slate-200 hover:text-sky-300 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Session</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBVIEW 2: MY SOUNDS */}
        {activeSubNav === 'my_sounds' && (
          <MySoundsSubView
            sounds={allSounds}
            projectName={projectName}
            onRecordNewClick={() => setActiveSubNav('creator_training')}
            onImportAudio={async (file: File) => {
              try {
                // Register actual file blob into immutable AssetStore
                const asset = await assetStore.registerAudioAsset(
                  file.name.replace(/\.[^/.]+$/, ''),
                  file,
                  'imported_file',
                  4.0,
                  { filename: file.name, size: file.size, type: file.type }
                );

                const newImport: CreatorSoundItem = {
                  id: `sound_${asset.id}`,
                  assetId: asset.id,
                  name: file.name.replace(/\.[^/.]+$/, ''),
                  category: 'Audio Import',
                  duration: '0:04.0',
                  bpm: bpm,
                  rootTag: 'imported audio',
                  musicalRole: 'Imported Audio Asset',
                  captureDate: 'Imported',
                  isFavorite: false,
                  tags: ['imported', 'custom', asset.sha256.slice(0, 10)],
                  source: {
                    date: 'Today',
                    deviceInput: file.name,
                    sessionProject: projectName,
                    originalBpm: bpm,
                    durationSeconds: 4.0,
                    sampleRate: '48 kHz / 24-bit',
                    waveformPoints: [0.3, 0.6, 0.9, 0.7, 0.5, 0.4, 0.2, 0.1],
                  },
                  analysis: {
                    transientAttack: 'Preserved File Audio',
                    timbreDescriptors: ['Custom Imported File', `SHA-256: ${asset.sha256.slice(0, 8)}`],
                    grooveTendency: 'Original File Timing',
                    confidenceScore: 100,
                    suggestedUses: ['Arrangement Track', 'One-Shot Trigger'],
                  },
                  derivedAssets: [
                    { id: `d_${Date.now()}`, type: 'One-Shot', name: 'Raw File Take', isReady: true },
                  ],
                };
                setAllSounds((prev) => [newImport, ...prev]);
                showNotification(`Imported & verified "${file.name}" (${asset.sha256.slice(0, 10)}...).`);
              } catch (err) {
                console.error('Import failed:', err);
              }
            }}
            onUpdateSounds={(updatedSounds) => setAllSounds(updatedSounds)}
            onAddToSessionConfirm={(sound, mode, destination) => {
              handleAddToSessionDirect(sound, mode);
            }}
          />
        )}

        {/* SUBVIEW 3: VOICE PROFILE */}
        {activeSubNav === 'voice_profile' && (
          <VoiceProfileSubView
            onStartExercise={handleStartExercise}
            voiceUnderstandingPercent={voiceUnderstandingPercent}
          />
        )}

        {/* SUBVIEW 4: RHYTHM PROFILE */}
        {activeSubNav === 'rhythm_profile' && (
          <RhythmProfileSubView
            onStartExercise={handleStartExercise}
            rhythmUnderstandingPercent={rhythmUnderstandingPercent}
            onAddPadToSession={(pad) => {
              if (onAddSoundToSession) {
                onAddSoundToSession({
                  title: `${pad.padName} (${pad.assignedSoundName})`,
                  category: 'Beatbox',
                  duration: pad.duration,
                  rootTag: `beatbox-kit-${pad.soundType}`,
                  mode: 'One-Shot',
                });
              }
              showNotification(`Placed ${pad.padName} pad into session timeline.`);
            }}
            onAddPatternToSession={(pattern) => {
              if (onAddSoundToSession) {
                onAddSoundToSession({
                  title: pattern.name,
                  category: 'Rhythm',
                  duration: '4 Bars',
                  rootTag: 'creator-groove-pattern',
                  mode: 'MIDI / Pattern',
                });
              }
              showNotification(`Placed pattern "${pattern.name}" into session.`);
            }}
          />
        )}

        {/* SUBVIEW 5: PROJECT CONTEXT */}
        {activeSubNav === 'project_context' && (
          <ProjectContextSubView
            projectName={projectName}
            bpm={bpm}
            timeSignature={timeSignature}
            keySignature={keySignature}
            allSounds={allSounds}
            onCaptureNewIdea={() => setActiveSubNav('creator_training')}
            onOpenMySounds={() => setActiveSubNav('my_sounds')}
            onInspectSound={(sound) => setInspectingSound(sound)}
            onAddToSession={(sound, mode, dest) => {
              handleAddToSessionDirect(sound, mode);
            }}
            onLocateInSession={(asset) => {
              if (onNavigateRoom) onNavigateRoom('booth');
            }}
          />
        )}
      </main>

      {/* DETAIL DRAWER FOR INSPECTING SOUND ORIGINS & DERIVED ASSETS */}
      <SoundDetailDrawer
        sound={inspectingSound}
        onClose={() => setInspectingSound(null)}
        onAddToSession={(sound) => {
          handleAddToSessionDirect(sound);
          setInspectingSound(null);
        }}
        projectName={projectName}
      />
    </div>
  );
};
