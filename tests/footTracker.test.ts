import { describe, it, expect } from 'vitest';
import { FootTracker } from '../src/engine/FootTracker';

describe('FootTracker', () => {
  it('computes vertical bounds correctly from heel and foot index', () => {
    const tracker = new FootTracker();
    const bounds = tracker.computeBoundaries({
      leftHeel: { x: 0.4, y: 0.85, z: 0 },
      leftFootIndex: { x: 0.42, y: 0.92, z: 0 },
      rightHeel: { x: 0.55, y: 0.87, z: 0 },
      rightFootIndex: { x: 0.58, y: 0.95, z: 0 },
    });

    expect(bounds.minY).toBeCloseTo(0.85);
    expect(bounds.maxY).toBeCloseTo(0.95);
  });
});
