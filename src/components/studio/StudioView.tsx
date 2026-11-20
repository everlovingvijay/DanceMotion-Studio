import React from 'react';
import { VideoDropzone } from './VideoDropzone';
import { VideoPlayer } from './VideoPlayer';
import { VideoMetadata, RenderSettings } from '../../types';
import { PlayCircle } from 'lucide-react';

interface StudioViewProps {
  metadata: VideoMetadata | null;
  settings: RenderSettings;
  isLoading: boolean;
  error: string | null;
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onFileSelected: (file: File) => void;
  onClear: () => void;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSetSpeed: (speed: number) => void;
  onTimeUpdate: () => void;
  onEnded: () => void;
}

export const StudioView: React.FC<StudioViewProps> = ({
  metadata,
  settings,
  isLoading,
  error,
  currentTime,
  isPlaying,
  playbackSpeed,
  videoRef,
  onFileSelected,
  onClear,
  onTogglePlay,
  onSeek,
  onSetSpeed,
  onTimeUpdate,
  onEnded,
}) => {
  // Quick test video generator for immediate offline verification
  const handleGenerateSampleVideo = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 720;
    canvas.height = 1280;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use MediaRecorder to generate a 3-second sample dance motion reference clip
    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9'
      : 'video/webm';
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const testFile = new File([blob], 'dance_sample_vertical.webm', { type: 'video/webm' });
      onFileSelected(testFile);
    };

    recorder.start();

    let frame = 0;
    const totalFrames = 90; // 3 seconds at 30fps

    const drawFrame = () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      // Draw dark studio background
      ctx.fillStyle = '#0a0a10';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = '#1a1a24';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Animated dancer figure
      const t = frame / 15;
      const hipX = 360 + Math.sin(t) * 35;
      const hipY = 680 + Math.cos(t * 2) * 20;

      // Body torso
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.ellipse(hipX, hipY - 140, 45, 90, Math.sin(t) * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.fillStyle = '#60a5fa';
      ctx.beginPath();
      ctx.arc(hipX + Math.sin(t) * 10, hipY - 270, 36, 0, Math.PI * 2);
      ctx.fill();

      // Limbs & motion indicators
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';

      // Left leg
      ctx.beginPath();
      ctx.moveTo(hipX - 25, hipY);
      ctx.lineTo(hipX - 50 + Math.sin(t) * 40, hipY + 180);
      ctx.lineTo(hipX - 60 + Math.sin(t) * 60, hipY + 360);
      ctx.stroke();

      // Right leg
      ctx.beginPath();
      ctx.moveTo(hipX + 25, hipY);
      ctx.lineTo(hipX + 50 - Math.sin(t) * 40, hipY + 180);
      ctx.lineTo(hipX + 60 - Math.sin(t) * 60, hipY + 360);
      ctx.stroke();

      // Left arm
      ctx.beginPath();
      ctx.moveTo(hipX - 40, hipY - 190);
      ctx.lineTo(hipX - 110, hipY - 120 + Math.cos(t) * 60);
      ctx.lineTo(hipX - 160, hipY - 180 + Math.cos(t) * 90);
      ctx.stroke();

      // Right arm
      ctx.beginPath();
      ctx.moveTo(hipX + 40, hipY - 190);
      ctx.lineTo(hipX + 110, hipY - 120 - Math.cos(t) * 60);
      ctx.lineTo(hipX + 170, hipY - 180 - Math.cos(t) * 90);
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Sample Dance Video (Vertical 9:16)', 360, 200);

      frame++;
      requestAnimationFrame(drawFrame);
    };

    drawFrame();
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {!metadata ? (
        <div className="flex flex-col items-center">
          <VideoDropzone
            onFileSelected={onFileSelected}
            isLoading={isLoading}
            error={error}
          />

          <div className="mt-2 text-center">
            <button
              onClick={handleGenerateSampleVideo}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181820] hover:bg-[#20202d] text-neutral-300 hover:text-white border border-[#2a2a3c] text-xs font-medium transition-all"
            >
              <PlayCircle className="w-4 h-4 text-indigo-400" />
              <span>Load 9:16 Sample Dance Clip (No file needed)</span>
            </button>
          </div>
        </div>
      ) : (
        <VideoPlayer
          metadata={metadata}
          currentTime={currentTime}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          settings={settings}
          videoRef={videoRef}
          onTogglePlay={onTogglePlay}
          onSeek={onSeek}
          onSetSpeed={onSetSpeed}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onClear={onClear}
        />
      )}
    </div>
  );
};
