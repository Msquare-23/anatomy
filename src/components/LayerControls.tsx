import React from 'react';
import { ViewerSettings, AnatomyLayer, BackgroundTheme, ModelColorMode } from '../types/anatomy';
import { Sliders, Eye, Bone, Sparkles, Sun, Palette, Grid, Rotate3d } from 'lucide-react';

interface LayerControlsProps {
  settings: ViewerSettings;
  onUpdateSettings: (updater: Partial<ViewerSettings>) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2 text-slate-100 font-bold">
          <Sliders className="w-4 h-4 text-sky-400" />
          <span>Anatomy Layers & Display</span>
        </div>
      </div>

      {/* Opacity Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Muscle Opacity</span>
          <span className="text-sky-400 font-bold">{Math.round(settings.opacity * 100)}%</span>
        </div>
        <input
          id="muscle-opacity-slider"
          type="range"
          min="0.1"
          max="1.0"
          step="0.05"
          value={settings.opacity}
          onChange={(e) => onUpdateSettings({ opacity: parseFloat(e.target.value) })}
          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <button
            onClick={() => onUpdateSettings({ opacity: 0.25 })}
            className="hover:text-sky-300 transition"
          >
            25% (Deep)
          </button>
          <button
            onClick={() => onUpdateSettings({ opacity: 0.5 })}
            className="hover:text-sky-300 transition"
          >
            50%
          </button>
          <button
            onClick={() => onUpdateSettings({ opacity: 0.75 })}
            className="hover:text-sky-300 transition"
          >
            75%
          </button>
          <button
            onClick={() => onUpdateSettings({ opacity: 1.0 })}
            className="hover:text-sky-300 transition"
          >
            100%
          </button>
        </div>
      </div>

      {/* Structural Layers Toggles */}
      <div className="space-y-2 border-t border-slate-800/80 pt-3">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Structural Layers
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            id="toggle-skeleton-layer"
            onClick={() => onUpdateSettings({ showSkeleton: !settings.showSkeleton })}
            className={`p-2 rounded-xl flex items-center gap-2 transition border ${
              settings.showSkeleton
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Bone className="w-3.5 h-3.5" />
            <span>Skeleton</span>
          </button>

          <button
            id="toggle-tendons-layer"
            onClick={() => onUpdateSettings({ showTendons: !settings.showTendons })}
            className={`p-2 rounded-xl flex items-center gap-2 transition border ${
              settings.showTendons
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tendons & Fascia</span>
          </button>
        </div>
      </div>

      {/* Color Representation Mode */}
      <div className="space-y-2 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5" />
          <span>Color & Shading Mode</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { id: 'realistic', label: 'Realistic Red' },
              { id: 'monochrome', label: 'Monochrome' },
              { id: 'high-contrast', label: 'High Contrast' },
              { id: 'xray', label: 'X-Ray Cyan' },
            ] as { id: ModelColorMode; label: string }[]
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => onUpdateSettings({ colorMode: mode.id })}
              className={`px-2.5 py-1.5 rounded-lg text-left transition font-medium text-[11px] ${
                settings.colorMode === mode.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Background Environment */}
      <div className="space-y-2 border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <Sun className="w-3.5 h-3.5" />
          <span>Background Environment</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { id: 'dark-slate', label: 'Dark Slate' },
              { id: 'obsidian', label: 'Obsidian' },
              { id: 'clinical-light', label: 'Clinical Light' },
              { id: 'warm-studio', label: 'Warm Studio' },
            ] as { id: BackgroundTheme; label: string }[]
          ).map((theme) => (
            <button
              key={theme.id}
              onClick={() => onUpdateSettings({ backgroundTheme: theme.id })}
              className={`px-2.5 py-1.5 rounded-lg text-left transition font-medium text-[11px] ${
                settings.backgroundTheme === theme.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-rotation toggle */}
      <div className="border-t border-slate-800/80 pt-3">
        <button
          onClick={() => onUpdateSettings({ autoRotate: !settings.autoRotate })}
          className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition font-medium border ${
            settings.autoRotate
              ? 'bg-sky-600 text-white border-sky-500'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          <Rotate3d className="w-4 h-4" />
          <span>{settings.autoRotate ? 'Pause 360° Turntable' : 'Auto 360° Turntable'}</span>
        </button>
      </div>
    </div>
  );
};
