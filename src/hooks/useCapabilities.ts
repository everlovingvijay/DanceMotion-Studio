import { useState, useEffect } from 'react';
import { SystemCapabilities } from '../types';
import { detectSystemCapabilities } from '../services/capabilityDetector';

export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<SystemCapabilities | null>(null);
  const [loading, setLoading] = useState(true);

  const check = async () => {
    setLoading(true);
    try {
      const caps = await detectSystemCapabilities();
      setCapabilities(caps);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
  }, []);

  return { capabilities, loading, refresh: check };
}
