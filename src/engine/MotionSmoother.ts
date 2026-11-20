/**
 * MotionSmoother module for confidence-aware temporal smoothing.
 * Implemented in Sprint 4.
 */

export interface SmoothingConfig {
  alpha: number; // EMA factor or Euro filter beta
  threshold: number;
}

export class MotionSmoother {
  private alpha: number;

  constructor(alpha = 0.5) {
    this.alpha = alpha;
  }

  public smoothValue(prev: number, curr: number, confidence = 1.0): number {
    const effectiveAlpha = this.alpha * Math.max(0.1, confidence);
    return prev + effectiveAlpha * (curr - prev);
  }
}
