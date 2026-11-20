import React, { useState } from 'react';
import { SystemCapabilities } from '../../types';
import { pwaService } from '../../services/pwaService';
import { 
  Settings, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Trash2, 
  HardDrive, 
  Layers, 
  Globe 
} from 'lucide-react';

interface SettingsViewProps {
  capabilities: SystemCapabilities | null;
  loading: boolean;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  capabilities,
  loading,
  onRefresh,
}) => {
  const [clearing, setClearing] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const handleClearCache = async () => {
    setClearing(true);
    setClearMessage(null);
    try {
      const ok = await pwaService.clearCacheAndData();
      if (ok) {
        setClearMessage('All offline caches and local temporary buffers cleared.');
      } else {
        setClearMessage('Completed cache cleanup.');
      }
    } finally {
      setClearing(false);
      setTimeout(() => setClearMessage(null), 3000);
    }
  };

  const capabilityItems = [
    {
      title: 'WebCodecs Frame Decoder',
      supported: capabilities?.webCodecsDecoder ?? false,
      desc: 'Enables high-performance zero-copy frame decoding without freezing UI thread.',
      critical: true,
    },
    {
      title: 'WebCodecs Frame Encoder',
      supported: capabilities?.webCodecsEncoder ?? false,
      desc: 'Enables hardware-accelerated AVC/H.264 & VP9 video encoding in-browser.',
      critical: true,
    },
    {
      title: 'OffscreenCanvas',
      supported: capabilities?.offscreenCanvas ?? false,
      desc: 'Permits background Web Worker thread to render grey silhouette masks.',
      critical: true,
    },
    {
      title: 'Web Workers',
      supported: capabilities?.webWorkers ?? false,
      desc: 'Prevents main thread UI stutter during heavy video & MediaPipe processing.',
      critical: true,
    },
    {
      title: 'WebGL 2 Acceleration',
      supported: capabilities?.webgl2 ?? false,
      desc: capabilities?.gpuRenderer || 'Hardware GPU delegate available for MediaPipe & shaders.',
      critical: false,
    },
    {
      title: 'WebGPU (Next-Gen)',
      supported: capabilities?.webgpu ?? false,
      desc: 'Browser WebGPU acceleration available.',
      critical: false,
    },
    {
      title: 'PWA Service Worker',
      supported: capabilities?.serviceWorker ?? false,
      desc: 'Caches application shell, WASM runtimes, and neural network weights for offline execution.',
      critical: false,
    },
    {
      title: 'IndexedDB Storage',
      supported: capabilities?.indexedDB ?? false,
      desc: 'Locally persists project configs and model weights.',
      critical: false,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <span>Browser Capabilities & Diagnostics</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Real-time verification of browser hardware APIs required by DanceMotion Studio.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#181820] hover:bg-[#20202d] text-neutral-300 hover:text-white border border-[#28283a] text-xs font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Recheck Hardware</span>
        </button>
      </div>

      {/* Hardware & CPU Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#121217] p-4 rounded-xl border border-[#242430]">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5 mb-1">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>Logical CPU Cores</span>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {capabilities?.hardwareConcurrency || 4} threads
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">Available for Web Worker pool</div>
        </div>

        <div className="bg-[#121217] p-4 rounded-xl border border-[#242430]">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5 mb-1">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>GPU Acceleration</span>
          </div>
          <div className="text-sm font-semibold text-white truncate font-mono mt-1">
            {capabilities?.webgl2 ? 'Active (WebGL 2)' : 'CPU Fallback'}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1 truncate" title={capabilities?.gpuRenderer}>
            {capabilities?.gpuRenderer || 'Standard browser graphics'}
          </div>
        </div>

        <div className="bg-[#121217] p-4 rounded-xl border border-[#242430]">
          <div className="text-xs text-neutral-400 flex items-center gap-1.5 mb-1">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Hosting & Privacy</span>
          </div>
          <div className="text-sm font-semibold text-white mt-1">
            GitHub Pages + Client
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">
            Zero cloud uploads; 100% device processing
          </div>
        </div>
      </div>

      {/* Full Capabilities Checklist */}
      <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
          Browser API Verification Table
        </h3>

        <div className="divide-y divide-[#20202d]">
          {capabilityItems.map((item) => (
            <div key={item.title} className="py-3 flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-medium text-white flex items-center gap-2">
                  <span>{item.title}</span>
                  {item.critical && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Required
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">{item.desc}</div>
              </div>

              <div>
                {item.supported ? (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Supported</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-rose-950/60 text-rose-400 border border-rose-800/50 font-medium">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Unavailable</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage and Cleanup Card */}
      <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-neutral-400" />
          <span>Cache & Local Storage Management</span>
        </h3>
        <p className="text-xs text-neutral-400">
          In compliance with Section 9 of the Blueprint, you can completely purge cached PWA assets, temporary frame buffers, and cached models from your device at any time.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleClearCache}
            disabled={clearing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-800/60 text-xs font-medium transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>{clearing ? 'Clearing...' : 'Clear All Cache & Temp Files'}</span>
          </button>

          {clearMessage && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{clearMessage}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
