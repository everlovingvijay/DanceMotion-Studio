import React, { useState } from 'react';
import { RenderSettings, VideoMetadata, SystemCapabilities } from '../../types';
import { Download, Film, Music, FileCode, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { ExportModal } from './ExportModal';

interface ExportViewProps {
  settings: RenderSettings;
  metadata: VideoMetadata | null;
  capabilities: SystemCapabilities | null;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  onUpdateSettings: (settings: Partial<RenderSettings>) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  settings,
  metadata,
  capabilities,
  videoRef,
  onUpdateSettings,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const aspectRatios: { id: RenderSettings['aspectRatio']; label: string }[] = [
    { id: '9:16', label: '9:16 (Vertical Portrait - Default)' },
    { id: '16:9', label: '16:9 (Landscape)' },
    { id: '1:1', label: '1:1 (Square)' },
    { id: 'source', label: 'Source Aspect Ratio' },
  ];

  const resolutions: { id: RenderSettings['targetResolution']; label: string }[] = [
    { id: '1080p', label: '1080p (Full HD - Default)' },
    { id: '720p', label: '720p (HD - Faster processing)' },
    { id: 'source', label: 'Source Video Resolution' },
  ];

  const fpsOptions = [24, 25, 30, 50, 60];

  const canEncodeMP4 = capabilities?.webCodecsEncoder ?? false;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <span>Export Specifications</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Configure video container, resolution, frame rate, and motion JSON data export settings.
          </p>
        </div>

        {metadata && videoRef ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Export Silhouette Now</span>
          </button>
        ) : (
          <div className="text-xs text-neutral-500 bg-[#181820] px-3 py-1.5 rounded-lg border border-[#242430]">
            Import a video in Studio to export
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Video Profile Settings */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Film className="w-4 h-4 text-neutral-400" />
            <span>Output Dimensions & Framing</span>
          </h3>

          {/* Aspect Ratio */}
          <div>
            <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Aspect Ratio</label>
            <div className="grid grid-cols-1 gap-1.5">
              {aspectRatios.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateSettings({ aspectRatio: item.id })}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-colors border ${
                    settings.aspectRatio === item.id
                      ? 'bg-indigo-950/40 text-indigo-200 border-indigo-600 font-medium'
                      : 'bg-[#181820] text-neutral-300 border-[#242430] hover:border-[#353547]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution */}
          <div>
            <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Resolution Target</label>
            <div className="grid grid-cols-1 gap-1.5">
              {resolutions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateSettings({ targetResolution: item.id })}
                  className={`text-left px-3 py-2 rounded-xl text-xs transition-colors border ${
                    settings.targetResolution === item.id
                      ? 'bg-indigo-950/40 text-indigo-200 border-indigo-600 font-medium'
                      : 'bg-[#181820] text-neutral-300 border-[#242430] hover:border-[#353547]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Framerate */}
          <div>
            <label className="text-xs text-neutral-400 block mb-1.5 font-medium">Framerate (FPS)</label>
            <div className="flex gap-2">
              {fpsOptions.map((fps) => (
                <button
                  key={fps}
                  onClick={() => onUpdateSettings({ targetFps: fps })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono border transition-colors ${
                    settings.targetFps === fps
                      ? 'bg-indigo-600 text-white border-indigo-500 font-semibold'
                      : 'bg-[#181820] text-neutral-300 border-[#242430] hover:border-[#353547]'
                  }`}
                >
                  {fps}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Codec, Container & Audio Settings */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4 text-neutral-400" />
            <span>Container & Audio</span>
          </h3>

          {/* Container Selection */}
          <div className="space-y-2">
            <label className="text-xs text-neutral-400 block font-medium">Container Format</label>
            
            <div
              onClick={() => onUpdateSettings({ container: 'mp4' })}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                settings.container === 'mp4'
                  ? 'border-indigo-500 bg-indigo-950/20'
                  : 'border-[#242430] bg-[#181820]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">MP4 (H.264 / AVC)</span>
                {canEncodeMP4 ? (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> WebCodecs Ready
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Fallback to WebM
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Preferred by Gemini models for video reference ingestion.
              </p>
            </div>

            <div
              onClick={() => onUpdateSettings({ container: 'webm' })}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                settings.container === 'webm'
                  ? 'border-indigo-500 bg-indigo-950/20'
                  : 'border-[#242430] bg-[#181820]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">WebM (VP9 / VP8)</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  Universal Browser Fallback
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Supported across all modern browsers without requiring MP4 muxing extensions.
              </p>
            </div>
          </div>

          {/* Audio toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181820] border border-[#242430] mt-1">
            <div>
              <div className="text-sm font-medium text-white">Preserve Source Audio Track</div>
              <div className="text-xs text-neutral-400">Default disabled (silent silhouette)</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preserveAudio}
                onChange={(e) => onUpdateSettings({ preserveAudio: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2a38] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Landmark JSON Export notice */}
          <div className="p-3.5 rounded-xl bg-[#181820] border border-[#242430] flex items-start gap-3 mt-auto">
            <FileCode className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-medium text-neutral-200">Synchronized Motion Landmark JSON</div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Will accompany video output with timestamped 3D landmark arrays and per-point confidence values (Sprint 5).
              </p>
              {metadata && (
                <div className="mt-2 text-[10px] text-indigo-300 font-mono">
                  Target Source: {metadata.name} ({metadata.duration.toFixed(1)}s)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {videoRef && (
        <ExportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          videoRef={videoRef}
          metadata={metadata}
          settings={settings}
        />
      )}
    </div>
  );
};
