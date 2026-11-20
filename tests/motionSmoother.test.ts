import { describe, it, expect } from 'vitest';
import { MotionSmoother } from '../src/engine/MotionSmoother';

describe('MotionSmoother', () => {
  it('smooths values towards target based on alpha and confidence', () => {
    const smoother = new MotionSmoother(0.5);
    const result = smoother.smoothValue(10, 20, 1.0);
    // 10 + 0.5 * (20 - 10) = 15
    expect(result).toBe(15);
  });
});
