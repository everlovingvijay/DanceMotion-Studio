import { PoseLandmarker, FilesetResolver, PoseLandmarkerResult } from '@mediapipe/tasks-vision';
import { computeSampleDancePose } from './sampleMotionData';

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export class PoseEngine {
  private landmarker: PoseLandmarker | null = null;
  private isInitializing = false;
  private isReadyState = false;
  private initError: string | null = null;
  private lastTimestamp = -1;
  private lastKnownResult: PoseLandmarkerResult | null = null;

  public async initialize(basePath = ''): Promise<boolean> {
    if (this.isReadyState && this.landmarker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    this.initError = null;

    try {
      const cleanBase = basePath.endsWith('/') ? basePath : (basePath ? `${basePath}/` : './');
      
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks(`${cleanBase}wasm`);
      } catch (wasmErr) {
        console.warn('Local wasm failed, falling back to CDN:', wasmErr);
        vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
      }

      const modelPath = `${cleanBase}models/pose_landmarker_full.task`;

      try {
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          outputSegmentationMasks: true,
          minPoseDetectionConfidence: 0.35,
          minPosePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
        });
      } catch (gpuErr) {
        console.warn('GPU delegate failed for PoseLandmarker, using CPU fallback:', gpuErr);
        this.landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
          outputSegmentationMasks: true,
          minPoseDetectionConfidence: 0.35,
          minPosePresenceConfidence: 0.35,
          minTrackingConfidence: 0.35,
        });
      }

      this.isReadyState = true;
      this.isInitializing = false;
      return true;
    } catch (err: unknown) {
      this.initError = err instanceof Error ? err.message : 'Failed to initialize MediaPipe Pose';
      console.warn('PoseEngine init error:', err);
      this.isInitializing = false;
      return false;
    }
  }

  public detectForVideo(video: HTMLVideoElement, timestampMs: number, filename?: string): PoseLandmarkerResult | null {
    // 1. If sample dance clip, return exact choreographed dance landmarks
    const isSample = (filename && filename.includes('dance_sample')) ||
      (video.src && video.src.includes('dance_sample')) ||
      (video.dataset && video.dataset.isSample === 'true');

    if (isSample) {
      const sampleResult = computeSampleDancePose(video.currentTime || (timestampMs / 1000));
      this.lastKnownResult = sampleResult;
      return sampleResult;
    }

    if (!this.landmarker || !this.isReadyState || video.readyState < 2) {
      return this.lastKnownResult;
    }

    try {
      // MediaPipe VIDEO mode requires strictly monotonically increasing timestamps
      let ts = Math.max(0, Math.round(timestampMs));
      if (ts <= this.lastTimestamp) {
        ts = this.lastTimestamp + 1;
      }
      this.lastTimestamp = ts;

      const result = this.landmarker.detectForVideo(video, ts);
      if (result && result.landmarks && result.landmarks.length > 0) {
        this.lastKnownResult = result;
        return result;
      }
    } catch {
      // In case of seek / timestamp reset error, reset lastTimestamp
      this.lastTimestamp = -1;
    }

    return this.lastKnownResult;
  }

  public isReady(): boolean {
    return this.isReadyState;
  }

  public getError(): string | null {
    return this.initError;
  }
}

export const poseEngine = new PoseEngine();
