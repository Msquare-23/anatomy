import React from 'react';
import { MuscleData } from '../types/anatomy';
import { SearchBar } from './SearchBar';
import {
  Activity,
  PenTool,
  Sliders,
  Layers,
  Award,
  Settings,
  RotateCcw,
  BookOpen,
  Eye,
} from 'lucide-react';

interface HeaderProps {
  muscles: MuscleData[];
  selectedMuscle: MuscleData | null;
  onSelectMuscle: (muscle: MuscleData | null) => void;
  isDrawingMode: boolean;
  onToggleDrawingMode: () => void;
  onOpenSettings: () => void;
  onOpenCredits: () => void;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  showLayersPanel: boolean;
  onToggleLayersPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  muscles,
  selectedMuscle,
  onSelectMuscle,
  isDrawingMode,
  onToggleDrawingMode,
  onOpenSettings,
  onOpenCredits,
  showSidebar,
  onToggleSidebar,
  showLayersPanel,
  onToggleLayersPanel,
}) => {
  return (
    <header
      id="main-app-header"
      className="h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between gap-4 z-40 relative flex-shrink-0"
    >
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-rose-600/25 flex-shrink-0">
          <Activity className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-extrabold text-slate-100 tracking-tight leading-none">
              Anatomy <span className="text-rose-500">3D</span>
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-rose-300 border border-rose-500/20">
              Muscle Atlas
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:block">
            Interactive 3D Human Muscular System
          </span>
        </div>
      </div>

      {/* Prominent Center Search Bar */}
      <div className="flex-1 max-w-lg hidden md:block">
        <SearchBar
          muscles={muscles}
          onSelectMuscle={onSelectMuscle}
          selectedMuscle={selectedMuscle}
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Toggle Regions & Directory */}
        <button
          id="btn-toggle-directory"
          onClick={onToggleSidebar}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
            showSidebar
              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle Regions & Muscle Directory"
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden lg:inline">Directory</span>
        </button>

        {/* Toggle Layers & Display */}
        <button
          id="btn-toggle-layers"
          onClick={onToggleLayersPanel}
          className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
            showLayersPanel
              ? 'bg-sky-600 text-white border-sky-500 shadow-md'
              : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle Layers & Display Controls"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden lg:inline">Layers</span>
        </button>

        {/* Drawing Reference Mode Toggle */}
        <button
          id="btn-toggle-drawing-mode"
          onClick={onToggleDrawingMode}
          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm ${
            isDrawingMode
              ? 'bg-rose-600 text-white ring-2 ring-rose-400'
              : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white'
          }`}
          title="Switch to Artist & Student Drawing Reference Mode"
        >
          <PenTool className="w-4 h-4" />
          <span className="hidden sm:inline">Drawing Mode</span>
        </button>

        {/* Settings Button */}
        <button
          id="btn-open-settings"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Atlas Settings & 3D Assets"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* About / Credits Button */}
        <button
          id="btn-open-credits"
          onClick={onOpenCredits}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="Z-Anatomy Project Attribution & License"
        >
          <Award className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
