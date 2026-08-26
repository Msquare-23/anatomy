import React, { useRef } from 'react';
import { ViewerSettings, BackgroundTheme, ModelColorMode } from '../types/anatomy';
import {
  X,
  Upload,
  RotateCcw,
  Sun,
  Sliders,
  Palette,
  Eye,
  Check,
  FileBox,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ViewerSettings;
  onUpdateSettings: (updater: Partial<ViewerSettings>) => void;
  onLoadCustomModel: (file: File) => void;
  onResetToDefaultModel: () => void;
  isExternalModelLoaded: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onLoadCustomModel,
  onResetToDefaultModel,
  isExternalModelLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadCustomModel(file);
      onClose();
    }
  };

  return (
    <div
      id="settings-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="settings-modal-container"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-slate-200 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Atlas Settings & 3D Assets</h2>
              <p className="text-xs text-slate-400">Configure viewport rendering and custom models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 text-xs text-slate-300">
          {/* Custom 3D Model Loading Section */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBox className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-slate-100 text-sm">3D Anatomy Asset (GLB/GLTF)</span>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  isExternalModelLoaded
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}
              >
                {isExternalModelLoaded ? 'Custom GLB Active' : 'Default Muscular Rig'}
              </span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Load your own Z-Anatomy or custom GLB/GLTF file directly into the 3D atlas. The system will automatically map each discrete object name to the medical database.
            </p>

            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Custom GLB Asset</span>
              </button>

              {isExternalModelLoaded && (
                <button
                  onClick={onResetToDefaultModel}
                  className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium flex items-center gap-1.5 transition"
                  title="Reset to Built-in Muscular Atlas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Lighting Intensity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Lighting Exposure</span>
              <span className="text-sky-400 font-bold">{Math.round(settings.lightIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.0"
              step="0.1"
              value={settings.lightIntensity}
              onChange={(e) => onUpdateSettings({ lightIntensity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
            />
          </div>

          {/* Background Theme */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-200">Default Viewport Environment</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'dark-slate', label: 'Dark Slate (Default)' },
                  { id: 'obsidian', label: 'Obsidian Black' },
                  { id: 'clinical-light', label: 'Clinical Light' },
                  { id: 'warm-studio', label: 'Warm Studio' },
                ] as { id: BackgroundTheme; label: string }[]
              ).map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onUpdateSettings({ backgroundTheme: bg.id })}
                  className={`p-2.5 rounded-xl text-left font-medium transition border flex items-center justify-between ${
                    settings.backgroundTheme === bg.id
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>{bg.label}</span>
                  {settings.backgroundTheme === bg.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
