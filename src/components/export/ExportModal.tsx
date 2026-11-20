import React, { useState } from 'react';
import { RenderSettings, VideoMetadata } from '../../types';
import { videoExportEngine, ExportProgress, ExportResult } from '../../engine/VideoEncoder';
import { 
  Download, 
  X, 
  Film, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  metadata: VideoMetadata | null;
  settings: RenderSettings;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  videoRef,
  metadata,
  settings,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [result, setResult] = useState<ExportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !metadata) return null;

  const startExport = async () => {
    if (!videoRef.current) return;
    setIsExporting(true);
    setResult(null);
    setError(null);

    try {
      const res = await videoExportEngine.exportSilhouetteVideo(
        videoRef.current,
        metadata,
        settings,
        (p) => setProgress(p)
      );
      setResult(res);
      setIsExporting(false);
    } catch (err) {
      setIsExporting(false);
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleCancel = () => {
    videoExportEngine.cancel();
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#121217] border border-[#242430] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#242430] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Export Motion Silhouette</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#20202d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Target specifications summary */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-[#181820] p-3 rounded-xl border border-[#242430]">
            <div>
              <span className="text-neutral-500">Preset:</span>
              <span className="ml-1.5 font-medium text-neutral-200">{settings.aspectRatio} • {settings.targetResolution}</span>
            </div>
            <div>
              <span className="text-neutral-500">Framerate:</span>
              <span className="ml-1.5 font-medium text-neutral-200">{settings.targetFps} FPS</span>
            </div>
            <div>
              <span className="text-neutral-500">Color:</span>
              <span className="ml-1.5 font-medium text-neutral-200 font-mono">{settings.silhouetteColor} on {settings.backgroundColor}</span>
            </div>
            <div>
              <span className="text-neutral-500">Container:</span>
              <span className="ml-1.5 font-medium text-neutral-200 uppercase">{settings.container}</span>
            </div>
          </div>

          {/* Progress / Status Display */}
          {isExporting && progress && (
            <div className="flex flex-col gap-2 p-4 bg-[#181820] rounded-xl border border-indigo-900/40">
              <div className="flex justify-between items-center text-xs">
                <span className="text-indigo-300 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {progress.stage === 'initializing' && 'Initializing MediaPipe engines...'}
                  {progress.stage === 'rendering' && `Rendering frame ${progress.currentFrame} / ${progress.totalFrames}`}
                  {progress.stage === 'encoding' && 'Finalizing container stream...'}
                </span>
                <span className="text-white font-mono font-bold">{progress.percent}%</span>
              </div>

              <div className="w-full h-2.5 bg-[#242430] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <button
                onClick={handleCancel}
                className="self-end mt-1 text-[11px] text-rose-400 hover:text-rose-300 underline"
              >
                Cancel Export
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Download Results Card */}
          {result && (
            <div className="flex flex-col gap-3 p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Export Complete! Ready for Gemini ingestion.</span>
              </div>

              <div className="flex flex-col gap-2 mt-1">
                {/* Download Video */}
                <a
                  href={result.videoUrl}
                  download={result.filename}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#181820] hover:bg-indigo-600 border border-[#2e2e42] hover:border-indigo-500 text-white text-xs font-medium transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                    <span>{result.filename}</span>
                  </div>
                  <span className="text-neutral-400 group-hover:text-neutral-200">
                    {formatBytes(result.videoBlob.size)}
                  </span>
                </a>

                {/* Download Landmark JSON */}
                <a
                  href={result.jsonUrl}
                  download={`${metadata.name.replace(/\.[^/.]+$/, '')}_motion_landmarks.json`}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#181820] hover:bg-indigo-600 border border-[#2e2e42] hover:border-indigo-500 text-white text-xs font-medium transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                    <span>motion_landmarks.json</span>
                  </div>
                  <span className="text-neutral-400 group-hover:text-neutral-200">
                    {formatBytes(result.jsonBlob.size)}
                  </span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#242430] bg-[#101014] flex justify-end gap-2">
          {!result ? (
            <>
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2 rounded-xl bg-[#181820] text-neutral-300 hover:text-white text-xs font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={startExport}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Processing Frames...' : 'Start Video Export'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
