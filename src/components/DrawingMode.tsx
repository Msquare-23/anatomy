import React, { useState } from 'react';
import { ViewerSettings, MuscleData, BackgroundTheme, ModelColorMode } from '../types/anatomy';
import {
  Camera,
  X,
  Sliders,
  Grid,
  Sun,
  Eye,
  RotateCcw,
  Palette,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';

interface DrawingModeProps {
  onExit: () => void;
  settings: ViewerSettings;
  onUpdateSettings: (updater: Partial<ViewerSettings>) => void;
  selectedMuscle: MuscleData | null;
  onCaptureView: () => void;
}

export const DrawingMode: React.FC<DrawingModeProps> = ({
  onExit,
  settings,
  onUpdateSettings,
  selectedMuscle,
  onCaptureView,
}) => {
  const [showTools, setShowTools] = useState(true);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6">
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950/80 backdrop-blur-xl border border-slate-800 shadow-2xl text-slate-100">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Drawing & Reference Mode
            </span>
            <span className="text-[11px] text-slate-400">
              {selectedMuscle ? `Focus: ${selectedMuscle.name}` : 'Full Anatomy Form Study'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTools(!showTools)}
            className="p-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-slate-700 backdrop-blur-md transition shadow-lg text-xs flex items-center gap-1.5"
            title="Toggle Drawing Controls"
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">{showTools ? 'Hide HUD' : 'Show HUD'}</span>
          </button>

          <button
            id="btn-drawing-capture"
            onClick={onCaptureView}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-xl flex items-center gap-2 transition"
            title="Capture High-Resolution Reference Snapshot"
          >
            <Camera className="w-4 h-4" />
            <span>Capture Snapshot</span>
          </button>

          <button
            id="btn-exit-drawing-mode"
            onClick={onExit}
            className="p-2 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md transition shadow-lg"
            title="Exit Drawing Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating Side Tools (When ShowTools is true) */}
      {showTools && (
        <div className="self-end my-auto pointer-events-auto p-4 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-4 max-w-xs text-xs text-slate-200">
          <div className="font-bold text-slate-100 flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Palette className="w-4 h-4 text-sky-400" />
            <span>Artist Form & Lighting</span>
          </div>

          {/* Shading / Value study mode */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Color & Values
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'realistic', label: 'Anatomy Tone' },
                  { id: 'monochrome', label: 'Monochrome Value' },
                  { id: 'high-contrast', label: 'High Contrast' },
                  { id: 'xray', label: 'X-Ray Silhouette' },
                ] as { id: ModelColorMode; label: string }[]
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => onUpdateSettings({ colorMode: mode.id })}
                  className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium transition ${
                    settings.colorMode === mode.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Background Canvas Tint */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Canvas Background
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'dark-slate', label: 'Dark Slate' },
                  { id: 'obsidian', label: 'Obsidian Black' },
                  { id: 'clinical-light', label: 'Sketchbook White' },
                  { id: 'warm-studio', label: 'Warm Studio' },
                ] as { id: BackgroundTheme; label: string }[]
              ).map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onUpdateSettings({ backgroundTheme: bg.id })}
                  className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-medium transition ${
                    settings.backgroundTheme === bg.id
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Control */}
          <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Muscle Form Opacity</span>
              <span className="text-sky-400 font-bold">{Math.round(settings.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.opacity}
              onChange={(e) => onUpdateSettings({ opacity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>

          {/* Structural Reference Toggles */}
          <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Anatomical Underlay
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ showSkeleton: !settings.showSkeleton })}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition border ${
                  settings.showSkeleton
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Skeleton Underlay
              </button>
              <button
                onClick={() => onUpdateSettings({ showTendons: !settings.showTendons })}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center font-medium transition border ${
                  settings.showTendons
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                Tendons
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Bottom Artist Tip */}
      <div className="self-center pointer-events-auto px-4 py-1.5 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-800 text-[11px] text-slate-400">
        💡 Orbit: Left-click drag | Pan: Right-click drag / Two-finger drag | Zoom: Scroll / Pinch
      </div>
    </div>
  );
};
