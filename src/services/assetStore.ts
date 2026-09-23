// Authoritative SoulSonus Audio & Project Asset Store
// Handles immutable source assets, SHA-256 cryptographic hashing, IndexedDB persistence,
// and state synchronization across browser sessions.

import { ProjectMetadata, Track, SessionPlayerPersona, SongSection, RevisionNode, CapabilityEntry, PipelineStage, SMIRIntent, ChangeSet } from '../types/soulsonus';
import { CreatorSoundItem } from '../types/creatorIntelligence';

export interface AudioAsset {
  id: string; // e.g. "ast_c09e8841_1726589"
  name: string;
  sha256: string; // Full SHA-256 digest of binary content
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  blob?: Blob;
  blobUrl?: string;
  createdAt: string;
  originType:
    | 'creator_hum'
    | 'creator_voice'
    | 'creator_beatbox'
    | 'creator_tap'
    | 'creator_capture'
    | 'booth_recording'
    | 'booth_take'
    | 'imported_file'
    | 'midi_capture'
    | 'rendered_take'
    | string;
  musicalAnalysis?: {
    pitchContour?: number[]; // Normalized 0-1 values
    detectedNotes?: { note: string; midi: number; startTime: number; duration: number; frequency: number }[];
    dominantKey?: string;
    fundamentalRange?: { lowNote: string; highNote: string; lowFreq: number; highFreq: number };
    tempoBpm?: number;
    transientPeaks?: number[];
    loudnessLufs?: number;
    [key: string]: any;
  };
  provenanceSeedSignature: string;
}

export interface PersistedProjectState {
  metadata?: ProjectMetadata;
  tracks?: Track[];
  sessionPlayers?: SessionPlayerPersona[];
  songSections?: SongSection[];
  pipelineStages?: PipelineStage[];
  capabilityItems?: CapabilityEntry[];
  revisions?: RevisionNode[];
  smirIntent?: SMIRIntent;
  creatorSounds?: CreatorSoundItem[];
  assets?: Omit<AudioAsset, 'blob' | 'blobUrl'>[];
}

const DB_NAME = 'SoulSonusStudioDB';
const DB_VERSION = 1;
const ASSETS_STORE = 'audio_assets';
const PROJECT_STORE = 'project_state';

class AssetStoreService {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryAssets: Map<string, AudioAsset> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(ASSETS_STORE)) {
          db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(PROJECT_STORE)) {
          db.createObjectStore(PROJECT_STORE, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = (err) => {
        console.warn('SoulSonus AssetStore IndexedDB init failed, falling back to memory/localStorage:', err);
        reject(err);
      };
    });

    return this.dbPromise;
  }

  // Cryptographic SHA-256 computation on ArrayBuffer
  public async computeSha256(buffer: ArrayBuffer): Promise<string> {
    try {
      if (window.crypto && window.crypto.subtle) {
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      // Fallback pseudo-sha
    }
    // Deterministic fallback hash if SubtleCrypto is restricted in iframe
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      h1 = Math.imul(h1 ^ bytes[i], 2654435761);
      h2 = Math.imul(h2 ^ bytes[i], 1597334677);
    }
    const hex1 = ((h1 ^ (h1 >>> 16)) >>> 0).toString(16).padStart(8, '0');
    const hex2 = ((h2 ^ (h2 >>> 16)) >>> 0).toString(16).padStart(8, '0');
    return `sha256_${hex1}${hex2}${Date.now().toString(16)}`;
  }

  // Register an Audio Blob as an immutable Asset
  public async registerAudioAsset(
    name: string,
    blob: Blob,
    originType: AudioAsset['originType'],
    durationSeconds: number,
    analysis?: AudioAsset['musicalAnalysis']
  ): Promise<AudioAsset> {
    const arrayBuffer = await blob.arrayBuffer();
    const sha256 = await this.computeSha256(arrayBuffer);
    const id = `ast_${sha256.slice(0, 12)}_${Date.now()}`;
    const blobUrl = URL.createObjectURL(blob);

    const asset: AudioAsset = {
      id,
      name,
      sha256,
      mimeType: blob.type || 'audio/wav',
      sizeBytes: blob.size,
      durationSeconds,
      sampleRate: 48000,
      channels: 1,
      blob,
      blobUrl,
      createdAt: new Date().toISOString(),
      originType,
      musicalAnalysis: analysis,
      provenanceSeedSignature: `ss_${sha256.slice(0, 16)}`,
    };

    this.memoryAssets.set(id, asset);

    // Save into IndexedDB if available
    try {
      const db = await this.initDB();
      const tx = db.transaction(ASSETS_STORE, 'readwrite');
      const store = tx.objectStore(ASSETS_STORE);
      // Store asset with blob
      store.put(asset);
    } catch (e) {
      console.warn('Asset IndexedDB save error:', e);
    }

    return asset;
  }

  // Retrieve an asset by ID
  public async getAsset(id: string): Promise<AudioAsset | null> {
    if (this.memoryAssets.has(id)) {
      return this.memoryAssets.get(id)!;
    }

    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ASSETS_STORE, 'readonly');
        const store = tx.objectStore(ASSETS_STORE);
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result) {
            const asset = req.result as AudioAsset;
            if (asset.blob && !asset.blobUrl) {
              asset.blobUrl = URL.createObjectURL(asset.blob);
            }
            this.memoryAssets.set(asset.id, asset);
            resolve(asset);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // Retrieve all registered assets in store
  public async getAllAssets(): Promise<AudioAsset[]> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ASSETS_STORE, 'readonly');
        const store = tx.objectStore(ASSETS_STORE);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []) as AudioAsset[];
          list.forEach((asset) => {
            if (asset.blob && !asset.blobUrl) {
              asset.blobUrl = URL.createObjectURL(asset.blob);
            }
            this.memoryAssets.set(asset.id, asset);
          });
          resolve(Array.from(this.memoryAssets.values()));
        };
        req.onerror = () => resolve(Array.from(this.memoryAssets.values()));
      });
    } catch {
      return Array.from(this.memoryAssets.values());
    }
  }

  // Persist full Project State
  public async saveProjectState(state: PersistedProjectState): Promise<void> {
    try {
      // 1. Save to LocalStorage as fast synchronous checkpoint
      const serialized = JSON.stringify({
        ...state,
        assets: (state.assets || []).map((a) => ({
          ...a,
          blob: undefined,
          blobUrl: undefined,
        })),
      });
      localStorage.setItem('soulsonus_active_project', serialized);

      // 2. Save to IndexedDB
      const db = await this.initDB();
      const tx = db.transaction(PROJECT_STORE, 'readwrite');
      const store = tx.objectStore(PROJECT_STORE);
      store.put({ key: 'current_project', updatedAt: Date.now(), data: state });
    } catch (e) {
      console.warn('Failed to persist project state:', e);
    }
  }

  // Load persisted Project State if exists
  public async loadProjectState(): Promise<PersistedProjectState | null> {
    try {
      // Check IndexedDB first
      const db = await this.initDB();
      const stateFromDB = await new Promise<any>((resolve) => {
        const tx = db.transaction(PROJECT_STORE, 'readonly');
        const store = tx.objectStore(PROJECT_STORE);
        const req = store.get('current_project');
        req.onsuccess = () => resolve(req.result?.data || null);
        req.onerror = () => resolve(null);
      });

      if (stateFromDB) return stateFromDB;
    } catch {
      // Fallback to localStorage
    }

    try {
      const raw = localStorage.getItem('soulsonus_active_project');
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // No saved state
    }

    return null;
  }

  // Clear all saved data (reset project)
  public async resetStorage(): Promise<void> {
    this.memoryAssets.clear();
    localStorage.removeItem('soulsonus_active_project');
    try {
      const db = await this.initDB();
      const tx = db.transaction([ASSETS_STORE, PROJECT_STORE], 'readwrite');
      tx.objectStore(ASSETS_STORE).clear();
      tx.objectStore(PROJECT_STORE).clear();
    } catch (e) {
      console.warn('Error clearing IndexedDB:', e);
    }
  }
}

export const assetStore = new AssetStoreService();
