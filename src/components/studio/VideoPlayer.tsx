import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipBack, 
  SkipForward, 
  Trash2, 
  Layers, 
  Sparkles,
  Download,
  Activity
} from 'lucide-react';
import { VideoMetadata, RenderSettings } from '../../types';
import { formatBytes, formatTime, formatResolution, getAspectRatioLabel } from '../../utils/formatters';
import { poseEngine } from '../../engine/PoseEngine';
import { handEngine } from '../../engine/HandEngine';
import { silhouetteRenderer } from '../../engine/SilhouetteRenderer';
import { ExportModal } from '../export/ExportModal';

interface VideoPlayerProps {
  metadata: VideoMetadata;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  settings: RenderSettings;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSetSpeed: (speed: number) => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
  onClear: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  metadata,
  currentTime,
  isPlaying,
  playbackSpeed,
  settings,
  videoRef,
  onTogglePlay,
  onSeek,
  onSetSpeed,
  onTimeUpdate,
  onEnded,
  onClear,
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'source' | 'silhouette'>('split');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [modelStatus, setModelStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speeds = [0.25, 0.5, 1.0, 1.5, 2.0];

  // Initialize MediaPipe engines with base path
  useEffect(() => {
    const basePath = import.meta.env.BASE_URL || './';
    Promise.all([
      poseEngine.initialize(basePath),
      handEngine.initialize(basePath),
    ]).then(([poseOk]) => {
      setModelStatus(poseOk ? 'ready' : 'fallback');
    }).catch(() => {
      setModelStatus('fallback');
    });
  }, []);

  // Frame detection & rendering function
  const renderFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const timeMs = video.currentTime * 1000;
    const poseRes = poseEngine.detectForVideo(video, timeMs, metadata.name);
    const handRes = settings.handsAndFingers
      ? handEngine.detectForVideo(video, timeMs)
      : null;

    silhouetteRenderer.attach(canvas);
    silhouetteRenderer.render(
      poseRes,
      handRes,
      settings,
      metadata.width || 720,
      metadata.height || 1280
    );
  }, [metadata, settings, videoRef]);

  // Real-time animation loop when playing
  useEffect(() => {
    let animId: number;

    const loop = () => {
      renderFrame();
      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };

    if (isPlaying) {
      animId = requestAnimationFrame(loop);
    } else {
      // Render static frame when paused
      renderFrame();
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, renderFrame]);

  // Handle timeline slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    onSeek(time);
    setTimeout(renderFrame, 50);
  };

  const stepFrame = (frames: number) => {
    const frameDuration = 1 / (metadata.fps || 30);
    onSeek(currentTime + frames * frameDuration);
    setTimeout(renderFrame, 50);
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-7xl mx-auto p-4">
      {/* Top action bar: File info, export button, & view switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#121217] p-3 rounded-xl border border-[#242430]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                {metadata.name}
              </h2>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#1f1f2a] text-neutral-300 border border-[#2e2e3f]">
                {formatResolution(metadata.width, metadata.height)}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#1f1f2a] text-neutral-300 border border-[#2e2e3f]">
                {getAspectRatioLabel(metadata.width, metadata.height)}
              </span>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-3 mt-0.5">
              <span>{formatBytes(metadata.size)}</span>
              <span>•</span>
              <span>{formatTime(metadata.duration)}</span>
              <span>•</span>
              <span>~{metadata.fps} FPS</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[11px] text-indigo-300">
                <Activity className="w-3 h-3 text-indigo-400" />
                {modelStatus === 'ready' ? 'MediaPipe Live' : modelStatus === 'loading' ? 'Loading Model...' : 'Fast Tracking'}
              </span>
            </div>
          </div>
        </div>

        {/* View mode toggle & Export Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export Video</span>
          </button>

          <div className="bg-[#181820] p-1 rounded-lg border border-[#242430] flex items-center text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'split' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('source')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'source' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Source Only
            </button>
            <button
              onClick={() => setViewMode('silhouette')}
              className={`px-3 py-1 rounded transition-colors ${
                viewMode === 'silhouette' ? 'bg-indigo-600 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Silhouette Target
            </button>
          </div>

          <button
            onClick={onClear}
            className="p-2 rounded-lg bg-[#181820] text-neutral-400 hover:text-rose-400 hover:bg-rose-950/30 border border-[#242430] transition-colors"
            title="Remove Video"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video Viewports Area */}
      <div className={`grid gap-4 w-full ${
        viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
      }`}>
        {/* Source Video Canvas */}
        {(viewMode === 'split' || viewMode === 'source') && (
          <div className="relative rounded-2xl overflow-hidden bg-[#000000] border border-[#242430] flex flex-col items-center justify-center min-h-[380px] max-h-[600px] shadow-xl group">
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-medium text-neutral-200 border border-white/10">
              Source Video
            </div>

            <video
              ref={videoRef}
              src={metadata.url}
              playsInline
              onTimeUpdate={() => {
                onTimeUpdate();
                renderFrame();
              }}
              onEnded={onEnded}
              className="max-h-[580px] w-auto h-auto object-contain cursor-pointer"
              onClick={onTogglePlay}
            />
          </div>
        )}

        {/* Live Reconstructed Silhouette Output Canvas */}
        {(viewMode === 'split' || viewMode === 'silhouette') && (
          <div className="relative rounded-2xl overflow-hidden bg-[#000000] border border-[#242430] flex flex-col items-center justify-center min-h-[380px] max-h-[600px] shadow-xl">
            <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-[11px] font-medium text-neutral-200 border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: settings.silhouetteColor }} />
              <span>Grey Silhouette Reference ({settings.silhouetteColor})</span>
            </div>

            <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-md bg-indigo-950/80 backdrop-blur-md text-[11px] font-medium text-indigo-300 border border-indigo-700/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Live Reconstructed Motion</span>
            </div>

            {/* Live HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={metadata.width || 720}
              height={metadata.height || 1280}
              className="max-h-[580px] w-auto h-auto object-contain"
            />
          </div>
        )}
      </div>

      {/* Playback Controls & Timeline Scrubber */}
      <div className="bg-[#121217] p-4 rounded-2xl border border-[#242430] flex flex-col gap-3 shadow-xl">
        {/* Timeline track */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-300 w-16 text-right">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min={0}
              max={metadata.duration || 1}
              step={0.01}
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-2 bg-[#242430] rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none"
            />
          </div>
          <span className="text-xs font-mono text-neutral-400 w-16">
            {formatTime(metadata.duration)}
          </span>
        </div>

        {/* Buttons row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Main playback control group */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSeek(0);
                setTimeout(renderFrame, 50);
              }}
              className="p-2 rounded-lg bg-[#181820] text-neutral-400 hover:text-white hover:bg-[#242430] border border-[#242430] transition-colors"
              title="Return to start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => stepFrame(-1)}
              className="p-2 rounded-lg bg-[#181820] text-neutral-400 hover:text-white hover:bg-[#242430] border border-[#242430] transition-colors"
              title="Previous Frame"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={onTogglePlay}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="text-xs">Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span className="text-xs">Play</span>
                </>
              )}
            </button>

            <button
              onClick={() => stepFrame(1)}
              className="p-2 rounded-lg bg-[#181820] text-neutral-400 hover:text-white hover:bg-[#242430] border border-[#242430] transition-colors"
              title="Next Frame"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Speed control & Quick Export */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#181820] p-1 rounded-lg border border-[#242430] text-xs">
              <span className="text-neutral-500 px-1 text-[11px]">Speed</span>
              {speeds.map((s) => (
                <button
                  key={s}
                  onClick={() => onSetSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    playbackSpeed === s
                      ? 'bg-indigo-600 text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 hover:text-white text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        videoRef={videoRef}
        metadata={metadata}
        settings={settings}
      />
    </div>
  );
};
