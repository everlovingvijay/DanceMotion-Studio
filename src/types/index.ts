export type NavTab = 'studio' | 'motion' | 'render' | 'export' | 'projects' | 'settings';

export interface VideoMetadata {
  file: File;
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  fps: number;
  type: string;
  url: string;
}

export interface CapabilityItem {
  name: string;
  supported: boolean;
  details?: string;
  critical: boolean;
}

export interface SystemCapabilities {
  webCodecsDecoder: boolean;
  webCodecsEncoder: boolean;
  offscreenCanvas: boolean;
  webWorkers: boolean;
  webgl2: boolean;
  webgpu: boolean;
  serviceWorker: boolean;
  indexedDB: boolean;
  hardwareConcurrency: number;
  gpuRenderer?: string;
  isFullyCapable: boolean;
}

export interface RenderSettings {
  silhouetteColor: string; // default #888888
  backgroundColor: string; // default #000000
  smoothing: 'none' | 'low' | 'medium' | 'high';
  handsAndFingers: boolean;
  footTracking: boolean;
  aspectRatio: '9:16' | '16:9' | '1:1' | 'source';
  targetResolution: '720p' | '1080p' | 'source';
  targetFps: number;
  container: 'mp4' | 'webm';
  preserveAudio: boolean;
}

export interface ProjectState {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  videoMetadata?: VideoMetadata | null;
  settings: RenderSettings;
}
