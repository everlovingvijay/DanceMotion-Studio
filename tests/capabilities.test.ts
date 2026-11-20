import { describe, it, expect } from 'vitest';
import { detectSystemCapabilities } from '../src/services/capabilityDetector';

describe('capabilityDetector', () => {
  it('detects capabilities in current runtime environment', async () => {
    const caps = await detectSystemCapabilities();
    expect(caps).toBeDefined();
    expect(typeof caps.hardwareConcurrency).toBe('number');
    expect(typeof caps.isFullyCapable).toBe('boolean');
  });
});
