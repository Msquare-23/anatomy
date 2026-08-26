import React from 'react';
import { ViewPreset, ViewerSettings, MuscleData } from '../types/anatomy';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Camera,
  Maximize2,
  Minimize2,
  Layers,
  Compass,
} from 'lucide-react';

interface ViewerControlsProps {
  onApplyPreset: (preset: ViewPreset) => void;
  settings: ViewerSettings;
  onUpdateSettings: (updater: Partial<ViewerSettings>) => void;
  selectedMuscle: MuscleData | null;
  onCaptureScreenshot: () => void;
  isCapturing: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isDrawingMode?: boolean;
}

export const ViewerControls: React.FC<ViewerControlsProps> = ({
  onApplyPreset,
  settings,
  onUpdateSettings,
  selectedMuscle,
  onCaptureScreenshot,
  isCapturing,
  isFullscreen,
  onToggleFullscreen,
  isDrawingMode = false,
}) => {
  if (isDrawingMode) return null;

  return (
    <>
      {/* Top Left: Standard Anatomical Camera View Presets */}
      <div
        id="viewer-presets-bar"
        className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-800 shadow-xl text-xs"
      >
        <button
          id="view-preset-front"
          onClick={() => onApplyPreset('front')}
          className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Anterior (Front) View"
        >
          Front
        </button>
        <button
          id="view-preset-back"
          onClick={() => onApplyPreset('back')}
          className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Posterior (Back) View"
        >
          Back
        </button>
        <button
          id="view-preset-left"
          onClick={() => onApplyPreset('left')}
          className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Left Lateral View"
        >
          Left
        </button>
        <button
          id="view-preset-right"
          onClick={() => onApplyPreset('right')}
          className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Right Lateral View"
        >
          Right
        </button>
        <button
          id="view-preset-superior"
          onClick={() => onApplyPreset('superior')}
          className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Superior (Top) View"
        >
          Top
        </button>
        <button
          id="view-preset-inferior"
          onClick={() => onApplyPreset('inferior')}
          className="px-2.5 py-1 rounded-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
          title="Inferior (Bottom) View"
        >
          Bottom
        </button>
        <div className="h-4 w-px bg-slate-700/80 mx-0.5" />
        <button
          id="view-preset-reset"
          onClick={() => onApplyPreset('isometric')}
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          title="Reset Anatomical Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Right: Interactive Viewport Actions */}
      <div
        id="viewer-actions-bar"
        className="absolute bottom-4 right-4 z-20 flex items-center gap-2"
      >
        {/* Muscle Isolation Toggle */}
        {selectedMuscle && (
          <button
            id="btn-toggle-isolate-viewport"
            onClick={() => onUpdateSettings({ isolateSelected: !settings.isolateSelected })}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xl border backdrop-blur-md transition ${
              settings.isolateSelected
                ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:bg-slate-800'
            }`}
          >
            {settings.isolateSelected ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{settings.isolateSelected ? 'Show All Muscles' : 'Isolate Muscle'}</span>
          </button>
        )}

        {/* Labels Display Mode */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl text-xs">
          <button
            id="btn-labels-off"
            onClick={() => onUpdateSettings({ labelMode: 'off' })}
            className={`px-2.5 py-1.5 rounded-lg transition font-medium text-[11px] ${
              settings.labelMode === 'off'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Labels Off
          </button>
          <button
            id="btn-labels-selected"
            onClick={() => onUpdateSettings({ labelMode: 'selected' })}
            className={`px-2.5 py-1.5 rounded-lg transition font-medium text-[11px] ${
              settings.labelMode === 'selected'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Selected Only
          </button>
          <button
            id="btn-labels-all"
            onClick={() => onUpdateSettings({ labelMode: 'all' })}
            className={`px-2.5 py-1.5 rounded-lg transition font-medium text-[11px] ${
              settings.labelMode === 'all'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Labels
          </button>
        </div>

        {/* Screenshot Capture Button */}
        <button
          id="btn-capture-viewport-snapshot"
          onClick={onCaptureScreenshot}
          disabled={isCapturing}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-800 shadow-xl backdrop-blur-md transition flex items-center gap-1.5 text-xs font-semibold"
          title="Capture Snapshot (Export High-Resolution PNG)"
        >
          <Camera className={`w-4 h-4 ${isCapturing ? 'animate-spin text-rose-400' : ''}`} />
          <span className="hidden sm:inline">Snapshot</span>
        </button>

        {/* Fullscreen Toggle */}
        <button
          id="btn-toggle-viewport-fullscreen"
          onClick={onToggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-xl backdrop-blur-md transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </>
  );
};
