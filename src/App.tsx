import React, { useState, useEffect, useCallback } from 'react';
import { MuscleData, MuscleRegion, ViewerSettings } from './types/anatomy';
import { MUSCLES_DATABASE } from './data/muscles';
import { loadAnatomyModel, LoadedAnatomyModel } from './lib/anatomyModelLoader';
import { AnatomyViewer } from './components/AnatomyViewer';
import { Header } from './components/Header';
import { RegionNav } from './components/RegionNav';
import { MuscleList } from './components/MuscleList';
import { MuscleInfoPanel } from './components/MuscleInfoPanel';
import { LayerControls } from './components/LayerControls';
import { DrawingMode } from './components/DrawingMode';
import { SettingsModal } from './components/SettingsModal';
import { CreditsModal } from './components/CreditsModal';
import { MuscleSearch } from './components/MuscleSearch';

export default function App() {
  const [model, setModel] = useState<LoadedAnatomyModel | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<MuscleRegion | 'ALL'>('ALL');
  const [retryTrigger, setRetryTrigger] = useState<number>(0);

  const [settings, setSettings] = useState<ViewerSettings>({
    opacity: 1.0,
    labelMode: 'selected',
    isolateSelected: false,
    highlightSelected: true,
    backgroundTheme: 'dark-slate',
    colorMode: 'realistic',
    showSkeleton: true,
    showTendons: true,
    showGrid: false,
    lightIntensity: 1.0,
    autoRotate: false,
    wireframe: false,
  });

  const [isDrawingMode, setIsDrawingMode] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showLayersPanel, setShowLayersPanel] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);
  const [customModelUrl, setCustomModelUrl] = useState<string | null>(null);

  // Load the real Z-Anatomy muscular GLB asset
  useEffect(() => {
    let isMounted = true;
    setIsLoadingModel(true);
    setLoadProgress(0);

    const targetUrl = customModelUrl || '/models/muscular.glb';
    loadAnatomyModel(targetUrl, (progress) => {
      if (isMounted) setLoadProgress(progress);
    })
      .then((loaded) => {
        if (isMounted) {
          setModel(loaded);
          setIsLoadingModel(false);
        }
      })
      .catch((_err) => {
        // Model file is not yet placed at public/models/muscular.glb or failed to load
        // Do not show fake anatomy and do not crash
        if (isMounted) {
          setModel(null);
          setIsLoadingModel(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [customModelUrl, retryTrigger]);

  const handleRetryLoad = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  const handleUpdateSettings = useCallback((updater: Partial<ViewerSettings>) => {
    setSettings((prev) => ({ ...prev, ...updater }));
  }, []);

  const handleSelectMuscle = useCallback((muscle: MuscleData | null) => {
    setSelectedMuscle(muscle);
    if (muscle) {
      setSelectedRegion((prev) => (prev === 'ALL' ? prev : muscle.region));
    }
  }, []);

  // Filter muscles for currently active region
  const currentRegionMuscles = React.useMemo(() => {
    const activeDatabase = model?.allMuscles || MUSCLES_DATABASE;
    if (selectedRegion === 'ALL') return activeDatabase;
    return activeDatabase.filter((m) => m.region === selectedRegion);
  }, [selectedRegion, model]);

  const handleNextMuscle = () => {
    if (!selectedMuscle || currentRegionMuscles.length === 0) return;
    const currentIndex = currentRegionMuscles.findIndex((m) => m.id === selectedMuscle.id);
    const nextIdx = (currentIndex + 1) % currentRegionMuscles.length;
    setSelectedMuscle(currentRegionMuscles[nextIdx]);
  };

  const handlePrevMuscle = () => {
    if (!selectedMuscle || currentRegionMuscles.length === 0) return;
    const currentIndex = currentRegionMuscles.findIndex((m) => m.id === selectedMuscle.id);
    const prevIdx = (currentIndex - 1 + currentRegionMuscles.length) % currentRegionMuscles.length;
    setSelectedMuscle(currentRegionMuscles[prevIdx]);
  };

  // Allow immediate custom GLB file upload for testing or local usage
  const handleLoadCustomModel = (file: File) => {
    const url = URL.createObjectURL(file);
    setCustomModelUrl(url);
  };

  const handleResetToDefaultModel = () => {
    setCustomModelUrl(null);
    setRetryTrigger((prev) => prev + 1);
  };

  const allMusclesList = model?.allMuscles || MUSCLES_DATABASE;

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      {/* Top Navigation & App Header */}
      <Header
        muscles={allMusclesList}
        selectedMuscle={selectedMuscle}
        onSelectMuscle={handleSelectMuscle}
        isDrawingMode={isDrawingMode}
        onToggleDrawingMode={() => setIsDrawingMode(!isDrawingMode)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCredits={() => setIsCreditsOpen(true)}
        showSidebar={showSidebar}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        showLayersPanel={showLayersPanel}
        onToggleLayersPanel={() => setShowLayersPanel(!showLayersPanel)}
      />

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 py-2 bg-slate-900/90 border-b border-slate-800 z-30">
        <MuscleSearch
          muscles={allMusclesList}
          onSelectMuscle={handleSelectMuscle}
          selectedMuscle={selectedMuscle}
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar: Anatomical Regions & Muscle Directory */}
        {!isDrawingMode && showSidebar && (
          <aside
            id="left-anatomy-sidebar"
            className="w-full sm:w-80 lg:w-96 h-full p-3 sm:p-4 bg-slate-950/95 sm:bg-slate-950/70 backdrop-blur-xl border-r border-slate-800/80 z-30 flex flex-col gap-3 overflow-hidden absolute sm:relative left-0 top-0 bottom-0 shadow-2xl sm:shadow-none"
          >
            {/* Region Filter Chips */}
            <div className="flex-shrink-0">
              <RegionNav
                selectedRegion={selectedRegion}
                onSelectRegion={(reg) => setSelectedRegion(reg)}
              />
            </div>

            {/* Muscles List within Region */}
            <div className="flex-1 min-h-0">
              <MuscleList
                muscles={allMusclesList}
                selectedRegion={selectedRegion}
                selectedMuscle={selectedMuscle}
                onSelectMuscle={(m) => {
                  handleSelectMuscle(m);
                  if (window.innerWidth < 640) {
                    setShowSidebar(false);
                  }
                }}
              />
            </div>
          </aside>
        )}

        {/* Center: Interactive 3D Anatomy Viewport */}
        <main id="center-viewport-stage" className="flex-1 h-full relative overflow-hidden">
          <AnatomyViewer
            model={model}
            selectedMuscle={selectedMuscle}
            onSelectMuscle={handleSelectMuscle}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            isDrawingMode={isDrawingMode}
            onLoadCustomModel={handleLoadCustomModel}
            onRetryLoad={handleRetryLoad}
            isLoading={isLoadingModel}
            loadProgress={loadProgress}
          />

          {/* Floating Layers Panel */}
          {!isDrawingMode && showLayersPanel && (
            <div className="absolute top-4 right-4 z-30 w-72 max-h-[80vh] overflow-y-auto animate-fadeIn">
              <LayerControls settings={settings} onUpdateSettings={handleUpdateSettings} />
            </div>
          )}

          {/* Floating Muscle Anatomical Detail Panel */}
          {!isDrawingMode && selectedMuscle && !showLayersPanel && (
            <div className="absolute top-4 right-4 z-30 animate-fadeIn">
              <MuscleInfoPanel
                muscle={selectedMuscle}
                onClose={() => setSelectedMuscle(null)}
                isIsolated={settings.isolateSelected}
                onToggleIsolate={() =>
                  handleUpdateSettings({ isolateSelected: !settings.isolateSelected })
                }
                onNextMuscle={handleNextMuscle}
                onPrevMuscle={handlePrevMuscle}
                onFocusMuscle={() => {
                  if (selectedMuscle) setSelectedMuscle({ ...selectedMuscle });
                }}
              />
            </div>
          )}

          {/* Drawing & Artistic Reference Mode Overlay */}
          {isDrawingMode && (
            <DrawingMode
              onExit={() => setIsDrawingMode(false)}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              selectedMuscle={selectedMuscle}
              onCaptureView={() => {
                const btn = document.getElementById('btn-capture-viewport-snapshot');
                if (btn) btn.click();
              }}
            />
          )}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onLoadCustomModel={handleLoadCustomModel}
        onResetToDefaultModel={handleResetToDefaultModel}
        isExternalModelLoaded={Boolean(customModelUrl || model?.isExternalGLB)}
      />

      {/* Credits & Z-Anatomy Attribution Modal */}
      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />
    </div>
  );
}
