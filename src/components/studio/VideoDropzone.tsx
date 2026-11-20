import React, { useState, useRef } from 'react';
import { UploadCloud, Film, AlertCircle, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../../utils/formatters';

interface VideoDropzoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const VideoDropzone: React.FC<VideoDropzoneProps> = ({
  onFileSelected,
  isLoading,
  error,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      onFileSelected(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center p-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 flex flex-col items-center justify-center bg-[#121217] ${
          isDragging
            ? 'border-indigo-500 bg-indigo-950/20 shadow-2xl shadow-indigo-500/10 scale-[1.01]'
            : 'border-[#242430] hover:border-neutral-600 hover:bg-[#181820]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1a1a24] to-[#252538] border border-[#2d2d42] flex items-center justify-center mb-5 text-indigo-400 group-hover:text-indigo-300">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">
          Select or drag a dance video here
        </h3>
        <p className="text-sm text-neutral-400 max-w-sm mb-4">
          Supports MP4, WebM, QuickTime (MOV). Video stays entirely in your browser; no frames or audio are ever uploaded.
        </p>

        <div className="flex items-center gap-2 text-xs text-neutral-500 bg-[#0e0e13] px-3 py-1.5 rounded-full border border-[#20202d]">
          <Film className="w-3.5 h-3.5 text-neutral-400" />
          <span>Recommended: 9:16 vertical or 16:9 dance video, up to {formatBytes(500 * 1024 * 1024)}</span>
        </div>

        {isLoading && (
          <div className="mt-6 flex items-center gap-2 text-sm text-indigo-400 animate-pulse">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing video metadata...</span>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 w-full p-3 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Privacy guarantee banner */}
      <div className="mt-6 flex items-center gap-2 text-xs text-neutral-400 bg-[#121217] px-4 py-2 rounded-xl border border-[#242430]">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>
          <strong>100% Client-Side Privacy:</strong> Processed locally with WebAssembly and Web Workers.
        </span>
      </div>
    </div>
  );
};
