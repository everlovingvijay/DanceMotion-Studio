/**
 * FootTracker module interface for heel and foot-index landmark tracking.
 * Implemented in Sprint 3.
 */

export interface FootCoordinates {
  leftHeel?: { x: number; y: number; z: number };
  leftFootIndex?: { x: number; y: number; z: number };
  rightHeel?: { x: number; y: number; z: number };
  rightFootIndex?: { x: number; y: number; z: number };
}

export class FootTracker {
  public computeBoundaries(coords: FootCoordinates): { minY: number; maxY: number } {
    let minY = 1.0;
    let maxY = 0.0;
    const points = [
      coords.leftHeel,
      coords.leftFootIndex,
      coords.rightHeel,
      coords.rightFootIndex
    ].filter(Boolean);

    for (const pt of points) {
      if (pt) {
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
      }
    }
    return { minY, maxY };
  }
}
