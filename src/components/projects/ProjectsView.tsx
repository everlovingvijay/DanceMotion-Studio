import React, { useState, useEffect } from 'react';
import { VideoMetadata, RenderSettings } from '../../types';
import { FolderKanban, Clock, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { formatTime } from '../../utils/formatters';

interface SavedProject {
  id: string;
  name: string;
  timestamp: number;
  duration?: number;
  settings: RenderSettings;
}

interface ProjectsViewProps {
  metadata: VideoMetadata | null;
  settings: RenderSettings;
  onApplySettings: (settings: RenderSettings) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  metadata,
  settings,
  onApplySettings,
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('dancemotion_projects');
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to read saved projects from localStorage:', e);
    }
  }, []);

  const saveCurrentProject = () => {
    const newProject: SavedProject = {
      id: `proj_${Date.now()}`,
      name: metadata ? metadata.name : 'Dance Motion Profile',
      timestamp: Date.now(),
      duration: metadata?.duration,
      settings: { ...settings },
    };

    const updated = [newProject, ...projects.slice(0, 9)];
    setProjects(updated);
    try {
      localStorage.setItem('dancemotion_projects', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    try {
      localStorage.setItem('dancemotion_projects', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to delete from localStorage:', e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-400" />
            <span>Projects & Saved Profiles</span>
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Persist rendering configurations, export presets, and motion metadata locally on this device.
          </p>
        </div>

        <button
          onClick={saveCurrentProject}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg shadow-indigo-600/20 transition-all"
        >
          {saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Current Profile</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {projects.length === 0 ? (
          <div className="bg-[#121217] p-10 rounded-2xl border border-dashed border-[#242430] text-center">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-neutral-300">No saved projects yet</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
              Save your current tracking thresholds, silhouette color settings, and target resolutions to quickly apply them to dance videos later.
            </p>
          </div>
        ) : (
          projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-[#121217] p-4 rounded-xl border border-[#242430] flex items-center justify-between hover:border-[#353547] transition-all"
            >
              <div>
                <div className="text-sm font-semibold text-white">{proj.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-3">
                  <span>Saved on {new Date(proj.timestamp).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Preset: {proj.settings.aspectRatio} | {proj.settings.targetResolution}</span>
                  {proj.duration && (
                    <>
                      <span>•</span>
                      <span>{formatTime(proj.duration)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onApplySettings(proj.settings)}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1c28] hover:bg-indigo-600 text-neutral-200 hover:text-white text-xs font-medium border border-[#2a2a3e] transition-colors"
                >
                  Apply Profile
                </button>
                <button
                  onClick={() => deleteProject(proj.id)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                  title="Delete Profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
