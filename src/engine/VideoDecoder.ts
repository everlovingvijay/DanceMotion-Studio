/**
 * VideoDecoder engine module interface.
 * Implemented in Sprint 2 for frame-by-frame decoding and queue management.
 */

export interface VideoDecoderOptions {
  sampleFps?: number;
  onFrame?: (frame: VideoFrame, timestampUs: number) => Promise<void>;
  onError?: (error: Error) => void;
}

export class VideoDecoderEngine {
  private isProcessing = false;

  public async initialize(): Promise<boolean> {
    if (typeof window !== 'undefined' && 'VideoDecoder' in window) {
      return true;
    }
    return false;
  }

  public get active(): boolean {
    return this.isProcessing;
  }
}
