import { SystemCapabilities } from '../types';

export async function detectSystemCapabilities(): Promise<SystemCapabilities> {
  const hasWindow = typeof window !== 'undefined';
  const hasNav = typeof navigator !== 'undefined';

  const webCodecsDecoder = hasWindow && 'VideoDecoder' in window;
  const webCodecsEncoder = hasWindow && 'VideoEncoder' in window;
  const offscreenCanvas = hasWindow && 'OffscreenCanvas' in window;
  const webWorkers = hasWindow && 'Worker' in window;
  const serviceWorker = hasNav && 'serviceWorker' in navigator;
  const indexedDB = hasWindow && 'indexedDB' in window;
  const hardwareConcurrency = hasNav ? (navigator.hardwareConcurrency || 4) : 4;

  let webgl2 = false;
  let gpuRenderer: string | undefined = undefined;

  if (hasWindow) {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (gl) {
        webgl2 = true;
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'WebGL2 Supported';
        } else {
          gpuRenderer = 'WebGL2 GPU Delegate Available';
        }
      }
    } catch {
      webgl2 = false;
    }
  }

  let webgpu = false;
  if (hasNav && 'gpu' in navigator && (navigator as unknown as { gpu: unknown }).gpu) {
    webgpu = true;
  }

  const isFullyCapable = webCodecsDecoder && offscreenCanvas && webWorkers;

  return {
    webCodecsDecoder,
    webCodecsEncoder,
    offscreenCanvas,
    webWorkers,
    webgl2,
    webgpu,
    serviceWorker,
    indexedDB,
    hardwareConcurrency,
    gpuRenderer,
    isFullyCapable,
  };
}
