import React, { useState, useEffect } from 'react';
import { NavTab, RenderSettings } from '../types';
import { HeaderNav } from '../components/navigation/HeaderNav';
import { StudioView } from '../components/studio/StudioView';
import { MotionView } from '../components/motion/MotionView';
import { RenderView } from '../components/render/RenderView';
import { ExportView } from '../components/export/ExportView';
import { ProjectsView } from '../components/projects/ProjectsView';
import { SettingsView } from '../components/settings/SettingsView';
import { useVideoSource } from '../hooks/useVideoSource';
import { useCapabilities } from '../hooks/useCapabilities';
import { pwaService } from '../services/pwaService';

export const AppShell: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('studio');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [settings, setSettings] = useState<RenderSettings>({
    silhouetteColor: '#888888',
    backgroundColor: '#000000',
    smoothing: 'medium',
    handsAndFingers: true,
    footTracking: true,
    aspectRatio: '9:16',
    targetResolution: '1080p',
    targetFps: 30,
    container: 'mp4',
    preserveAudio: false,
  });

  const {
    videoMetadata,
    isLoading: isVideoLoading,
    error: videoError,
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
  } = useVideoSource();

  const { capabilities, loading: isCapsLoading, refresh: refreshCaps } = useCapabilities();

  const handleUpdateSettings = (partial: Partial<RenderSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  useEffect(() => {
    // Register PWA service worker foundation
    const baseUrl = import.meta.env.BASE_URL || './';
    pwaService.register(baseUrl);

    const unsubscribe = pwaService.subscribe((status) => {
      setIsOnline(status.isOnline);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Header & Navigation Bar */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasVideo={!!videoMetadata}
        gpuEnabled={capabilities?.webgl2 ?? false}
        isOnline={isOnline}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {activeTab === 'studio' && (
          <StudioView
            metadata={videoMetadata}
            settings={settings}
            isLoading={isVideoLoading}
            error={videoError}
            currentTime={currentTime}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            videoRef={videoElementRef}
            onFileSelected={loadVideoFile}
            onClear={clearVideo}
            onTogglePlay={togglePlay}
            onSeek={seek}
            onSetSpeed={setSpeed}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        )}

        {activeTab === 'motion' && (
          <MotionView
            metadata={videoMetadata}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'render' && (
          <RenderView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'export' && (
          <ExportView
            settings={settings}
            metadata={videoMetadata}
            capabilities={capabilities}
            videoRef={videoElementRef}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            metadata={videoMetadata}
            settings={settings}
            onApplySettings={setSettings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            capabilities={capabilities}
            loading={isCapsLoading}
            onRefresh={refreshCaps}
          />
        )}
      </main>
    </div>
  );
};
