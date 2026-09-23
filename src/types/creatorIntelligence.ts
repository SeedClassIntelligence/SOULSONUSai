export type CreatorRoomSubNav =
  | 'creator_training'
  | 'my_sounds'
  | 'voice_profile'
  | 'rhythm_profile'
  | 'project_context';

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

export type UseRecordingTarget = 'save_only' | 'session_only' | 'save_and_session';

export type SessionInterpretation =
  | 'Original Audio'
  | 'Loop'
  | 'Extract Rhythm'
  | 'MIDI / Pattern'
  | 'Layer With Sounds'
  | 'Vocal Reference'
  | 'One-Shot'
  | 'Instrument Reference';

export interface CreatorSoundItem {
  id: string;
  assetId?: string;
  name: string;
  category:
    | 'Voice'
    | 'Vocals'
    | 'Beatbox'
    | 'Drums'
    | 'Hum'
    | 'Melodies'
    | 'Spoken Ideas'
    | 'Instrument'
    | 'Textures'
    | 'Ad-libs'
    | 'Loops'
    | 'One-Shots'
    | 'Clap / Tap'
    | string;
  duration: string;
  dateCaptured?: string;
  captureDate?: string;
  bpm?: number;
  key?: string;
  musicalRole: string;
  source: any;
  tags: string[];
  isFavorite: boolean;
  audioFreqOrType?: 'kick' | 'snare' | 'hihat' | 'clap' | 'hum' | 'voice' | 'texture' | string;
  rootTag?: string;
  analysis?: any;
  derivedAssets?: any;
}

export interface TrainingExercise {
  id: string;
  title: string;
  category: 'voice' | 'rhythm';
  mode: CaptureMode;
  instruction: string;
  targetMetric: string;
}

export interface BeatboxPadItem {
  id: string;
  padName: 'KICK' | 'SNARE' | 'CLOSED HAT' | 'OPEN HAT' | 'CLAP' | 'PERC 1' | 'PERC 2' | 'FX';
  assignedSoundName: string;
  soundType: 'kick' | 'snare' | 'hihat' | 'clap' | 'perc' | 'fx';
  duration: string;
  capturedDate: string;
  pitchOffset?: number;
}

export interface RhythmicPatternItem {
  id: string;
  name: string;
  bpm: number;
  bars: number;
  swing: number; // e.g. 62%
  sourceRecording: string;
  timeSignature: string;
  steps: boolean[]; // 16-step representation
}

export interface ProjectUsedAsset {
  id: string;
  soundId: string;
  name: string;
  usedOnTrack: string;
  trackColor: string;
  usageType: 'Audio Clip' | 'One-Shot Drum' | 'MIDI Phrasing' | 'Vocal Ad-lib';
  barLocation: string;
  sourceCapture: string;
}
