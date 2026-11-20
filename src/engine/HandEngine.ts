import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export class HandEngine {
  private landmarker: HandLandmarker | null = null;
  private isInitializing = false;
  private isReadyState = false;

  public async initialize(basePath = ''): Promise<boolean> {
    if (this.isReadyState && this.landmarker) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;

    try {
      const cleanBase = basePath.endsWith('/') ? basePath : (basePath ? `${basePath}/` : './');
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks(`${cleanBase}wasm`);
      } catch {
        vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
      }

      const modelPath = `${cleanBase}models/hand_landmarker.task`;

      try {
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch {
        this.landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      this.isReadyState = true;
      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('HandEngine init error:', err);
      this.isInitializing = false;
      return false;
    }
  }

  public detectForVideo(video: HTMLVideoElement, timestampMs: number): HandLandmarkerResult | null {
    if (!this.landmarker || !this.isReadyState || video.readyState < 2) {
      return null;
    }

    try {
      return this.landmarker.detectForVideo(video, Math.max(0, Math.round(timestampMs)));
    } catch {
      return null;
    }
  }

  public isReady(): boolean {
    return this.isReadyState;
  }
}

export const handEngine = new HandEngine();
