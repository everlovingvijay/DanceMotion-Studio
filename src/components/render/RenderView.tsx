import React from 'react';
import { RenderSettings } from '../../types';
import { Palette, Sliders, Eye } from 'lucide-react';

interface RenderViewProps {
  settings: RenderSettings;
  onUpdateSettings: (settings: Partial<RenderSettings>) => void;
}

export const RenderView: React.FC<RenderViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const smoothingOptions: { id: RenderSettings['smoothing']; label: string; desc: string }[] = [
    { id: 'none', label: 'None', desc: 'Raw frame detections (may jitter on fast turns)' },
    { id: 'low', label: 'Low', desc: 'Minimal smoothing, ultra responsive' },
    { id: 'medium', label: 'Medium (Default)', desc: 'Balanced jitter reduction and rapid movement fidelity' },
    { id: 'high', label: 'High', desc: 'Strong stabilization for slow, fluid contemporary dance' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Palette className="w-5 h-5 text-indigo-400" />
          <span>Silhouette Rendering & Edge Styling</span>
        </h2>
        <p className="text-sm text-neutral-400 mt-1">
          Configure the identity-neutral grey silhouette appearance and temporal smoothing parameters for Gemini references.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colors & Canvas Card */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-neutral-400" />
            <span>Color Profile</span>
          </h3>

          {/* Silhouette Color */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181820] border border-[#242430]">
            <div>
              <div className="text-sm font-medium text-white">Silhouette Fill Color</div>
              <div className="text-xs text-neutral-400 font-mono">
                Current: {settings.silhouetteColor} (Blueprint Standard: #888888)
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.silhouetteColor}
                onChange={(e) => onUpdateSettings({ silhouetteColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-[#3b3b4f] bg-transparent cursor-pointer"
              />
              <button
                onClick={() => onUpdateSettings({ silhouetteColor: '#888888' })}
                className="text-[11px] px-2 py-1 bg-[#242430] hover:bg-[#2c2c3c] text-neutral-300 rounded font-mono transition-colors"
                title="Reset to #888888"
              >
                Default
              </button>
            </div>
          </div>

          {/* Background Color */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#181820] border border-[#242430]">
            <div>
              <div className="text-sm font-medium text-white">Background Color</div>
              <div className="text-xs text-neutral-400 font-mono">
                Current: {settings.backgroundColor} (Blueprint Standard: #000000)
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.backgroundColor}
                onChange={(e) => onUpdateSettings({ backgroundColor: e.target.value })}
                className="w-9 h-9 rounded-lg border border-[#3b3b4f] bg-transparent cursor-pointer"
              />
              <button
                onClick={() => onUpdateSettings({ backgroundColor: '#000000' })}
                className="text-[11px] px-2 py-1 bg-[#242430] hover:bg-[#2c2c3c] text-neutral-300 rounded font-mono transition-colors"
                title="Reset to #000000"
              >
                Default
              </button>
            </div>
          </div>

          {/* Color preview box */}
          <div className="mt-2 p-4 rounded-xl border border-[#242430] flex items-center justify-center gap-4" style={{ backgroundColor: settings.backgroundColor }}>
            <div
              className="w-16 h-28 rounded-2xl flex items-center justify-center shadow-lg font-mono text-[10px] font-bold"
              style={{ backgroundColor: settings.silhouetteColor, color: settings.backgroundColor }}
            >
              #888888
            </div>
            <div className="text-xs text-neutral-400 max-w-[200px]">
              Identity-neutral body silhouette with high contrast for Gemini visual reasoning.
            </div>
          </div>
        </div>

        {/* Temporal Smoothing Card */}
        <div className="bg-[#121217] p-5 rounded-2xl border border-[#242430] flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-2">
            <Eye className="w-4 h-4 text-neutral-400" />
            <span>Confidence-Aware Temporal Smoothing</span>
          </h3>

          <div className="flex flex-col gap-2">
            {smoothingOptions.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  settings.smoothing === opt.id
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-[#242430] bg-[#181820] hover:border-[#38384a]'
                }`}
              >
                <input
                  type="radio"
                  name="smoothing"
                  value={opt.id}
                  checked={settings.smoothing === opt.id}
                  onChange={() => onUpdateSettings({ smoothing: opt.id })}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <div className="text-sm font-medium text-white">{opt.label}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="mt-auto p-3 rounded-xl bg-[#181820] border border-[#242430] text-xs text-neutral-400">
            <strong>Blueprint Note:</strong> Temporal smoothing uses confidence weights to avoid lagging behind rapid dance jumps or spins while eliminating single-frame flickering.
          </div>
        </div>
      </div>
    </div>
  );
};
