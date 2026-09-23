export type StudioRoom =
  | 'creator_training'
  | 'booth'
  | 'band'
  | 'bgv'
  | 'daw'
  | 'beat_machine'
  | 'piano_keys'
  | 'instrument'
  | 'songwriting'
  | 'vocal_to_lyric'
  | 'takes_revisions'
  | 'mix'
  | 'master'
  | 'collaboration'
  | 'smir_inspector'
  | 'calibration'
  | 'pipeline'
  | 'native_brain'
  | 'capability_registry'
  | 'seedsignature'
  | 'release'
  | 'lobby';

export type StudioTab =
  | 'CREATE'
  | 'SOUNDS'
  | 'WRITE & RECORD'
  | 'MIX'
  | 'MASTER'
  | 'RELEASE';

export type InputMode =
  | 'RECORD AUDIO'
  | 'BEATBOX'
  | 'CLAP / TAP'
  | 'HUM'
  | 'MIMIC'
  | 'SING'
  | 'SPEAK'
  | 'MIDI'
  | 'IMPORT'
  | 'MELODY';

export interface ProjectMetadata {
  id: string;
  name: string;
  revision: number;
  bpm: number;
  key: string;
  timeSignature: string;
  timecode: string;
  storageUsed: string;
  storageTotal: string;
  sampleRate: string;
  bitDepth: string;
  seedSignature: string;
  rightsStatus: string;
  creatorOriginPct: number;
  collaborators: string[];
}

export interface AudioClip {
  id: string;
  name: string;
  startBar: number;
  lengthBars: number;
  takeNumber: number;
  waveformPoints?: number[];
  color: string;
  isCreatorOrigin?: boolean;
  smirId?: string;
  assetId?: string;
  notesSummary?: string;
}

export interface Track {
  id: string;
  number: string;
  name: string;
  type: 'Audio' | 'MIDI' | 'Session Player' | 'Group Bus';
  subtitle: string;
  armed: boolean;
  muted: boolean;
  soloed: boolean;
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  color: string;
  bus: string;
  plugins: string[];
  clips: AudioClip[];
  activeTake: number;
  availableTakes: number[];
}

export interface SessionPlayerPersona {
  id: string;
  name: string;
  role: string;
  tags: string[];
  status: 'LISTENING READY' | 'SESSION READY' | 'HARMONY READY' | 'RECORDING';
  bio: string;
  instrument: string;
  allowedVariations: string;
  rules: string[];
  takes: {
    id: number;
    title: string;
    description: string;
    grooveVibe: string;
    harmonicFlavor: string;
    clipId: string;
  }[];
  activeTake: number;
}

export interface SMIRIntent {
  id: string;
  trackId: string;
  title: string;
  phrase: string;
  source: string;
  intendedRole: string;
  contourData: number[]; // normalized 0-1 points for SVG drawing
  grooveDelta: string;
  emotionalDirection: string;
  preservationRequirements: string[];
  currentRealization: string;
  providerUsed: string;
}

export interface ChangeSet {
  id: string;
  timestamp: string;
  naturalPrompt: string;
  targetScope: string;
  status: 'PROPOSED' | 'APPLIED' | 'REJECTED' | 'PREVIEWING';
  preservedElements: string[];
  permittedChanges: string[];
  prohibitedChanges: string[];
  impactSummary: string;
  affectedTracks: string[];
  createdRevision: number;
}

export interface RevisionNode {
  id: string;
  revision: number;
  label: string;
  timestamp: string;
  author: string;
  notes: string;
  parentRevision?: number;
  isCurrent?: boolean;
}

export interface CapabilityEntry {
  id: string;
  capability: string;
  category: string;
  description: string;
  currentProvider: string;
  availableProviders: string[];
  isCompositeRecipe?: boolean;
  compositeRecipeItems?: string[];
  latencyMs: number;
  status: 'ACTIVE' | 'READY' | 'WARMING';
  codeLicense?: string;
  checkpointLicense?: string;
  commercialStatus?: 'PERMISSIVE' | 'COMMERCIAL_OK' | 'NON_COMMERCIAL' | 'RIGHTS_CONTROLLED';
  modelHash?: string;
  soulsonusLogic?: string;
  ossEngine?: string;
  adapterContract?: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  status: 'completed' | 'active' | 'waiting';
  detail: string;
  samplePayload?: Record<string, any>;
}

export interface SongSection {
  id: string;
  name: string;
  startBar: number;
  endBar: number;
  color: string;
  lyrics?: string[];
}
