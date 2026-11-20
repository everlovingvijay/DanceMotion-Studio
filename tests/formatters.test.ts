import { describe, it, expect } from 'vitest';
import { formatBytes, formatTime, formatResolution, getAspectRatioLabel } from '../src/utils/formatters';

describe('formatters', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1024 * 1024 * 5.5)).toBe('5.5 MB');
  });

  it('formats time to mm:ss.ms', () => {
    expect(formatTime(0)).toBe('00:00.00');
    expect(formatTime(65.25)).toBe('01:05.25');
  });

  it('formats resolutions and aspect ratios', () => {
    expect(formatResolution(1080, 1920)).toBe('1080 × 1920');
    expect(getAspectRatioLabel(1080, 1920)).toBe('9:16 (Vertical)');
    expect(getAspectRatioLabel(1920, 1080)).toBe('16:9 (Landscape)');
    expect(getAspectRatioLabel(1000, 1000)).toBe('1:1 (Square)');
  });
});
