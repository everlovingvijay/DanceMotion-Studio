import { useState, useCallback, useEffect, useRef } from 'react';
import { VideoMetadata } from '../types';

export function useVideoSource() {
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const loadVideoFile = useCallback(async (file: File): Promise<VideoMetadata | null> => {
    setIsLoading(true);
    setError(null);

    // Validate video MIME type or common video extensions
    const isVideoMime = file.type.startsWith('video/');
    const isVideoExt = /\.(mp4|webm|mov|m4v|mkv|avi)$/i.test(file.name);

    if (!isVideoMime && !isVideoExt) {
      setError('Please select a valid video file (.mp4, .webm, .mov, etc.)');
      setIsLoading(false);
      return null;
    }

    try {
      // Clean up previous URL if any
      if (videoMetadata?.url) {
        URL.revokeObjectURL(videoMetadata.url);
      }

      const objectUrl = URL.createObjectURL(file);

      // Extract metadata using an offscreen video element
      const metadata = await new Promise<VideoMetadata>((resolve, reject) => {
        const tempVideo = document.createElement('video');
        tempVideo.preload = 'metadata';
        tempVideo.playsInline = true;
        tempVideo.muted = true;

        const onLoadedMetadata = () => {
          const duration = tempVideo.duration || 0;
          const width = tempVideo.videoWidth || 0;
          const height = tempVideo.videoHeight || 0;

          // Standard estimated FPS default (30 FPS unless detectable)
          const fps = 30;

          cleanup();
          resolve({
            file,
            name: file.name,
            size: file.size,
            duration,
            width,
            height,
            fps,
            type: file.type || 'video/mp4',
            url: objectUrl,
          });
        };

        const onError = () => {
          cleanup();
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Browser could not decode video metadata. Check video codec.'));
        };

        const cleanup = () => {
          tempVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
          tempVideo.removeEventListener('error', onError);
          tempVideo.src = '';
        };

        tempVideo.addEventListener('loadedmetadata', onLoadedMetadata);
        tempVideo.addEventListener('error', onError);
        tempVideo.src = objectUrl;
      });

      setVideoMetadata(metadata);
      setCurrentTime(0);
      setIsPlaying(false);
      setIsLoading(false);
      return metadata;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to import video';
      setError(msg);
      setIsLoading(false);
      return null;
    }
  }, [videoMetadata]);

  const clearVideo = useCallback(() => {
    if (videoMetadata?.url) {
      URL.revokeObjectURL(videoMetadata.url);
    }
    setVideoMetadata(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setError(null);
  }, [videoMetadata]);

  const togglePlay = useCallback(() => {
    if (!videoElementRef.current) return;
    if (isPlaying) {
      videoElementRef.current.pause();
      setIsPlaying(false);
    } else {
      videoElementRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Playback error:', e);
      });
    }
  }, [isPlaying]);

  const seek = useCallback((time: number) => {
    if (!videoElementRef.current) return;
    const clamped = Math.max(0, Math.min(time, videoMetadata?.duration || 0));
    videoElementRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  }, [videoMetadata]);

  const handleTimeUpdate = useCallback(() => {
    if (videoElementRef.current) {
      setCurrentTime(videoElementRef.current.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (videoElementRef.current) {
      videoElementRef.current.playbackRate = speed;
    }
    setPlaybackSpeed(speed);
  }, []);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (videoMetadata?.url) {
        URL.revokeObjectURL(videoMetadata.url);
      }
    };
  }, [videoMetadata]);

  return {
    videoMetadata,
    isLoading,
    error,
    currentTime,
    isPlaying,
    playbackSpeed,
    videoElementRef,
    loadVideoFile,
    clearVideo,
    togglePlay,
    seek,
    setSpeed,
    handleTimeUpdate,
    handleEnded,
  };
}
