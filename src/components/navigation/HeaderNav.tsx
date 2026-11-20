import React from 'react';
import { NavTab } from '../../types';
import { 
  Film, 
  Activity, 
  Palette, 
  Download, 
  FolderKanban, 
  Settings, 
  Cpu, 
  Wifi, 
  WifiOff 
} from 'lucide-react';

interface HeaderNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasVideo: boolean;
  gpuEnabled: boolean;
  isOnline: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  activeTab,
  onTabChange,
  hasVideo,
  gpuEnabled,
  isOnline,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'studio', label: 'Studio', icon: <Film className="w-4 h-4" /> },
    { id: 'motion', label: 'Motion', icon: <Activity className="w-4 h-4" /> },
    { id: 'render', label: 'Render', icon: <Palette className="w-4 h-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="h-14 border-b border-[#242430] bg-[#121217] px-4 flex items-center justify-between select-none sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="2" />
            <path d="m9 20 3-6 3 6" />
            <path d="m6 8 6 2 6-2" />
            <path d="M12 10v4" />
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white uppercase">DanceMotion Studio</h1>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60">
              SPRINT 1
            </span>
          </div>
          <p className="text-[10px] text-neutral-400">Gemini Motion Reference Pipeline</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 bg-[#181820] p-1 rounded-lg border border-[#242430]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#242430]/50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Status diagnostics badges */}
      <div className="flex items-center gap-2">
        {gpuEnabled ? (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
            <Cpu className="w-3.5 h-3.5" />
            <span>GPU Ready</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
            <Cpu className="w-3.5 h-3.5" />
            <span>CPU Fallback</span>
          </span>
        )}

        {isOnline ? (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-neutral-900 text-neutral-400 border border-neutral-800" title="Online (Local processing)">
            <Wifi className="w-3.5 h-3.5 text-neutral-400" />
            <span>Local</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50" title="PWA Offline Mode">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </span>
        )}

        {hasVideo && (
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Video Loaded" />
        )}
      </div>
    </header>
  );
};
