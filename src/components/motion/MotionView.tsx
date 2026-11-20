import React from 'react';
import { VideoMetadata, RenderSettings } from '../../types';
import { Activity, Sparkles } from 'lucide-react';

interface MotionViewProps {
  metadata: VideoMetadata | null;
  settings: RenderSettings;
  onUpdateSettings: (settings: Partial<RenderSettings>) => void;
}

export const MotionView: React.FC<MotionViewProps> = ({
  metadata,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <span>Motion Tracking & Landmark Diagnostics</span>
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Configure body landmarks, dual-hand detection, foot tracking, and confidence thresholds for MediaPipe Tasks Vision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tracking Options Card */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
            Tracking Modules
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181820] border border-[#242430]">
            <div>
              <div className="text-sm font-medium text-white">Full-Body Pose Landmarker</div>
              <div className="text-xs text-neutral-400">MediaPipe 33 3D landmarks & body segmentation mask</div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-medium">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181820] border border-[#242430]">
            <div>
              <div className="text-sm font-medium text-white">Dual-Hand & Finger Tracking</div>
              <div className="text-xs text-neutral-400">Up to 2 hands with 21 landmarks per hand</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.handsAndFingers}
                onChange={(e) => onUpdateSettings({ handsAndFingers: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2a38] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181820] border border-[#242430]">
            <div>
              <div className="text-sm font-medium text-white">Foot & Heel Ground Tracker</div>
              <div className="text-xs text-neutral-400">Heel and foot-index bounds to anchor contact</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.footTracking}
                onChange={(e) => onUpdateSettings({ footTracking: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#2a2a38] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Video Telemetry & Pipeline Status */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider">
            Video Input Telemetry
          </h3>

          {metadata ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs py-2 border-b border-[#20202a]">
                <span className="text-neutral-400">Source Resolution</span>
                <span className="text-neutral-200 font-mono">{metadata.width} × {metadata.height}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-[#20202a]">
                <span className="text-neutral-400">Duration</span>
                <span className="text-neutral-200 font-mono">{metadata.duration.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2 border-b border-[#20202a]">
                <span className="text-neutral-400">Sample Rate</span>
                <span className="text-neutral-200 font-mono">~{metadata.fps} FPS</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2">
                <span className="text-neutral-400">Container / Type</span>
                <span className="text-neutral-200 font-mono">{metadata.type}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-neutral-500 bg-[#181820] rounded-xl border border-dashed border-[#242430]">
              No video imported yet. Import a video in the Studio tab to see real stream telemetry.
            </div>
          )}

          {/* Sprints 2 & 3 Roadmap Notice */}
          <div className="mt-auto p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
            <div>
              <strong className="text-indigo-200">Sprint 1 Foundation:</strong>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                MediaPipe PoseLandmarker and HandLandmarker models will be loaded locally in Sprint 3 without any external API calls.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
