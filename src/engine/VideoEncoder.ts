import { RenderSettings, VideoMetadata } from '../types';
import { poseEngine } from './PoseEngine';
import { handEngine } from './HandEngine';
import { SilhouetteRenderer } from './SilhouetteRenderer';
import { Output, Mp4OutputFormat, BufferTarget, CanvasSource } from 'mediabunny';

export interface ExportProgress {
  currentFrame: number;
  totalFrames: number;
  percent: number;
  stage: 'initializing' | 'rendering' | 'encoding' | 'completed' | 'error';
  errorMessage?: string;
}

export interface ExportResult {
  videoBlob: Blob;
  videoUrl: string;
  jsonBlob: Blob;
  jsonUrl: string;
  filename: string;
}

export class VideoExportEngine {
  private isCancelled = false;

  public cancel(): void {
    this.isCancelled = true;
  }

  public async exportSilhouetteVideo(
    videoElement: HTMLVideoElement,
    metadata: VideoMetadata,
    settings: RenderSettings,
    onProgress: (p: ExportProgress) => void
  ): Promise<ExportResult> {
    this.isCancelled = false;

    // 1. Determine target dimensions based on settings
    let width = 720;
    let height = 1280;

    if (settings.aspectRatio === '9:16') {
      if (settings.targetResolution === '1080p') {
        width = 1080;
        height = 1920;
      } else {
        width = 720;
        height = 1280;
      }
    } else if (settings.aspectRatio === '16:9') {
      if (settings.targetResolution === '1080p') {
        width = 1920;
        height = 1080;
      } else {
        width = 1280;
        height = 720;
      }
    } else if (settings.aspectRatio === '1:1') {
      width = settings.targetResolution === '1080p' ? 1080 : 720;
      height = width;
    } else {
      width = metadata.width || 720;
      height = metadata.height || 1280;
    }

    onProgress({
      currentFrame: 0,
      totalFrames: 100,
      percent: 0,
      stage: 'initializing',
    });

    // 2. Prepare export canvas and renderer
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width;
    exportCanvas.height = height;
    const renderer = new SilhouetteRenderer();
    renderer.attach(exportCanvas);

    // Initial clear
    const exportCtx = exportCanvas.getContext('2d');
    if (exportCtx) {
      exportCtx.fillStyle = settings.backgroundColor || '#000000';
      exportCtx.fillRect(0, 0, width, height);
    }

    // 3. Framing params
    const fps = settings.targetFps || metadata.fps || 30;
    const frameDuration = 1 / fps;
    const totalFrames = Math.max(1, Math.floor((metadata.duration || 1) * fps));

    // 4. Try Mediabunny MP4 muxer first
    let useMediabunny = false;
    let mediabunnyOutput: Output | null = null;
    let mediabunnySource: CanvasSource | null = null;

    if (settings.container === 'mp4' && typeof window !== 'undefined' && 'VideoEncoder' in window) {
      try {
        const target = new BufferTarget();
        mediabunnyOutput = new Output({
          target,
          format: new Mp4OutputFormat(),
        });

        mediabunnySource = new CanvasSource(exportCanvas, {
          codec: 'avc',
          bitrate: 5_000_000,
        });

        mediabunnyOutput.addVideoTrack(mediabunnySource);
        await mediabunnyOutput.start();
        useMediabunny = true;
      } catch (e) {
        console.warn('Mediabunny Output start failed, falling back to MediaRecorder:', e);
        useMediabunny = false;
        mediabunnyOutput = null;
        mediabunnySource = null;
      }
    }

    // Fallback: MediaRecorder stream
    let mediaRecorder: MediaRecorder | null = null;
    const recordedChunks: Blob[] = [];
    let streamTrack: MediaStreamTrack | null = null;
    let mimeType = 'video/webm;codecs=vp9';
    let fileExt = 'webm';

    if (!useMediabunny) {
      if (settings.container === 'mp4' && MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
        mimeType = 'video/mp4;codecs=avc1';
        fileExt = 'mp4';
      } else if (settings.container === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        fileExt = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
        fileExt = 'webm';
      } else {
        mimeType = 'video/webm';
        fileExt = 'webm';
      }

      // Capture stream with 0 fps so we can explicitly request each frame
      const stream = exportCanvas.captureStream(0);
      streamTrack = stream.getVideoTracks()[0] || null;

      mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 6_000_000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };

      mediaRecorder.start();
    } else {
      fileExt = 'mp4';
    }

    // 5. Landmark JSON accumulator
    const landmarkFrames: Array<{
      timestamp: number;
      confidence: number;
      landmarks: unknown[];
      hands?: unknown[];
    }> = [];

    // Save previous video state
    const originalTime = videoElement.currentTime;
    const wasPlaying = !videoElement.paused;
    if (wasPlaying) videoElement.pause();

    try {
      for (let f = 0; f < totalFrames; f++) {
        if (this.isCancelled) {
          throw new Error('Export cancelled by user');
        }

        const targetTime = Math.min(metadata.duration, f * frameDuration);

        // Seek video
        await new Promise<void>((resolve) => {
          let timeoutId: NodeJS.Timeout;
          const onSeeked = () => {
            clearTimeout(timeoutId);
            videoElement.removeEventListener('seeked', onSeeked);
            resolve();
          };
          timeoutId = setTimeout(() => {
            videoElement.removeEventListener('seeked', onSeeked);
            resolve();
          }, 200);

          videoElement.addEventListener('seeked', onSeeked);
          videoElement.currentTime = targetTime;
        });

        // Delay for frame buffer decode
        await new Promise((r) => setTimeout(r, 25));

        const timestampMs = targetTime * 1000;
        const poseResult = poseEngine.detectForVideo(videoElement, timestampMs, metadata.name);
        const handResult = settings.handsAndFingers
          ? handEngine.detectForVideo(videoElement, timestampMs)
          : null;

        // Render grey silhouette onto export canvas
        renderer.render(poseResult, handResult, settings, width, height);

        // Add to video output
        if (useMediabunny && mediabunnySource) {
          await mediabunnySource.add(targetTime, frameDuration);
        } else if (mediaRecorder && streamTrack) {
          // Explicitly request frame update on the capture track
          const trackAny = streamTrack as unknown as { requestFrame?: () => void };
          if (typeof trackAny.requestFrame === 'function') {
            trackAny.requestFrame();
          }
          await new Promise((r) => setTimeout(r, Math.max(20, Math.floor(frameDuration * 500))));
        }

        // Record landmark JSON frame
        landmarkFrames.push({
          timestamp: parseFloat(targetTime.toFixed(3)),
          confidence: poseResult?.landmarks?.[0]?.[0]?.visibility ?? 1.0,
          landmarks: poseResult?.landmarks?.[0] || [],
          hands: handResult?.landmarks || [],
        });

        const percent = Math.round(((f + 1) / totalFrames) * 100);
        onProgress({
          currentFrame: f + 1,
          totalFrames,
          percent,
          stage: 'rendering',
        });
      }

      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        stage: 'encoding',
      });

      let videoBlob: Blob;

      if (useMediabunny && mediabunnyOutput) {
        await mediabunnyOutput.finalize();
        const target = mediabunnyOutput.target as BufferTarget;
        const buffer = target.buffer;
        if (!buffer) {
          throw new Error('Mediabunny failed to produce buffer');
        }
        videoBlob = new Blob([buffer], { type: 'video/mp4' });
      } else if (mediaRecorder) {
        videoBlob = await new Promise<Blob>((resolve) => {
          mediaRecorder!.onstop = () => {
            resolve(new Blob(recordedChunks, { type: mimeType }));
          };
          mediaRecorder!.stop();
        });
      } else {
        throw new Error('No video encoder available');
      }

      // Generate motion landmark JSON
      const motionData = {
        name: metadata.name,
        duration: metadata.duration,
        fps,
        resolution: { width, height },
        silhouetteColor: settings.silhouetteColor,
        backgroundColor: settings.backgroundColor,
        totalFrames,
        generatedAt: new Date().toISOString(),
        frames: landmarkFrames,
      };

      const jsonBlob = new Blob([JSON.stringify(motionData, null, 2)], {
        type: 'application/json',
      });

      const videoUrl = URL.createObjectURL(videoBlob);
      const jsonUrl = URL.createObjectURL(jsonBlob);

      onProgress({
        currentFrame: totalFrames,
        totalFrames,
        percent: 100,
        stage: 'completed',
      });

      // Restore video state
      videoElement.currentTime = originalTime;
      if (wasPlaying) videoElement.play().catch(() => {});

      const baseName = metadata.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_silhouette_${width}x${height}.${fileExt}`;

      return {
        videoBlob,
        videoUrl,
        jsonBlob,
        jsonUrl,
        filename,
      };
    } catch (err) {
      if (useMediabunny && mediabunnyOutput) {
        try { mediabunnyOutput.cancel(); } catch { /* ignore */ }
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      videoElement.currentTime = originalTime;
      onProgress({
        currentFrame: 0,
        totalFrames,
        percent: 0,
        stage: 'error',
        errorMessage: err instanceof Error ? err.message : 'Export failed',
      });
      throw err;
    }
  }
}

export const videoExportEngine = new VideoExportEngine();
