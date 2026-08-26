import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MuscleData, ViewerSettings, ViewPreset } from '../types/anatomy';
import { LoadedAnatomyModel } from '../lib/anatomyModelLoader';
import { ModelPreparationNotice } from './ModelPreparationNotice';
import { ViewerControls } from './ViewerControls';
import { MuscleLabels, LabelProjectionItem } from './MuscleLabels';

interface AnatomyViewerProps {
  model: LoadedAnatomyModel | null;
  selectedMuscle: MuscleData | null;
  onSelectMuscle: (muscle: MuscleData | null) => void;
  settings: ViewerSettings;
  onUpdateSettings: (updater: Partial<ViewerSettings>) => void;
  isDrawingMode?: boolean;
  onLoadCustomModel?: (file: File) => void;
  onRetryLoad?: () => void;
  isLoading?: boolean;
  loadProgress?: number;
}

export const AnatomyViewer: React.FC<AnatomyViewerProps> = ({
  model,
  selectedMuscle,
  onSelectMuscle,
  settings,
  onUpdateSettings,
  isDrawingMode = false,
  onLoadCustomModel,
  onRetryLoad,
  isLoading = false,
  loadProgress = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Three.js core instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Lighting refs
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const backLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Interaction & Raycasting
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const hoveredMeshRef = useRef<THREE.Mesh | null>(null);
  const [hoveredMuscleName, setHoveredMuscleName] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Camera transition targets
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  // 3D Screen-projected labels
  const [projectedLabels, setProjectedLabels] = useState<LabelProjectionItem[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  // Original material cache for non-destructive runtime swapping
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material>>(new Map());

  // 1. Initialize Scene, Perspective Camera, High-performance WebGL Renderer, OrbitControls
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 600;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Perspective Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.0, 2.7);
    cameraRef.current = camera;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // required for screenshot capture
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.3;
    controls.maxDistance = 6.0;
    controls.target.set(0, 0.9, 0);
    controls.enablePan = true;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // Studio Lighting for Medical Clarity
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    ambientLightRef.current = ambient;

    const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.5);
    keyLight.position.set(2.5, 3.5, 2.5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    const fillLight = new THREE.DirectionalLight(0xeef4ff, 0.9);
    fillLight.position.set(-3.0, 2.0, 2.0);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    const backLight = new THREE.DirectionalLight(0xffffff, 1.2);
    backLight.position.set(0, 2.5, -3.0);
    scene.add(backLight);
    backLightRef.current = backLight;

    // Animation Render Loop
    let isRunning = true;
    const animate = () => {
      if (!isRunning) return;

      controls.update();

      // Camera lerp animation for smooth focus on selected muscles
      if (targetCamPos.current && targetLookAt.current) {
        camera.position.lerp(targetCamPos.current, 0.08);
        controls.target.lerp(targetLookAt.current, 0.08);

        if (
          camera.position.distanceTo(targetCamPos.current) < 0.01 &&
          controls.target.distanceTo(targetLookAt.current) < 0.01
        ) {
          targetCamPos.current = null;
          targetLookAt.current = null;
        }
      }

      // Auto rotation if enabled
      if (settings.autoRotate && !targetCamPos.current) {
        scene.rotation.y += 0.004;
      } else {
        scene.rotation.y = 0;
      }

      renderer.render(scene, camera);

      // Compute dynamic 3D label projections
      if (settings.labelMode !== 'off' && model && containerRef.current) {
        const curW = containerRef.current.clientWidth || width;
        const curH = containerRef.current.clientHeight || height;
        updateLabelsProjection(model, camera, curW, curH, selectedMuscle, settings.labelMode);
      } else if (projectedLabels.length > 0) {
        setProjectedLabels([]);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // ResizeObserver for dynamic canvas sizing
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0 && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newW / newH;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  // Update background lighting when settings change
  useEffect(() => {
    if (!rendererRef.current) return;
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.6 * settings.lightIntensity;
    }
    if (keyLightRef.current) {
      keyLightRef.current.intensity = 1.4 * settings.lightIntensity;
    }
    if (fillLightRef.current) {
      fillLightRef.current.intensity = 0.9 * settings.lightIntensity;
    }
  }, [settings.backgroundTheme, settings.lightIntensity]);

  // 2. Attach Model to Scene and Cache Materials
  useEffect(() => {
    if (!sceneRef.current) return;

    // Clear previous models from scene
    const currentRoot = sceneRef.current.getObjectByName('ZAnatomy_Muscular_System');
    if (currentRoot) {
      sceneRef.current.remove(currentRoot);
    }

    if (model) {
      sceneRef.current.add(model.root);

      // Cache original materials for non-destructive modification
      originalMaterialsRef.current.clear();
      model.root.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          originalMaterialsRef.current.set(child, child.material);
        }
      });
    }
  }, [model]);

  // 3. Apply Selection, Opacity, Layers, Isolation, and Color Modes non-destructively
  useEffect(() => {
    if (!model) return;

    const isIsolated = settings.isolateSelected && selectedMuscle !== null;
    const selectedMuscleId = selectedMuscle?.id;

    model.root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const isMuscle = child.userData?.isMuscle;
        const isSkeleton = child.userData?.isSkeleton;
        const isTendon = child.userData?.isTendon;
        const muscleId = child.userData?.muscleId;

        // Skeleton layer toggle
        if (isSkeleton) {
          child.visible = settings.showSkeleton;
          return;
        }

        // Tendon layer toggle
        if (isTendon) {
          child.visible = settings.showTendons;
          return;
        }

        if (!isMuscle) return;

        const isSelected = selectedMuscleId && muscleId === selectedMuscleId;

        if (isIsolated) {
          if (isSelected) {
            child.visible = true;
            applyMaterialState(child, 1.0, true, settings.colorMode);
          } else {
            // In isolation mode, hide all other muscles completely to give unobstructed view
            child.visible = false;
          }
        } else {
          child.visible = true;
          if (isSelected && settings.highlightSelected) {
            applyMaterialState(child, 1.0, true, settings.colorMode);
          } else {
            const baseOpacity = selectedMuscleId ? settings.opacity * 0.4 : settings.opacity;
            applyMaterialState(child, baseOpacity, false, settings.colorMode);
          }
        }
      }
    });
  }, [model, selectedMuscle, settings]);

  const applyMaterialState = (
    mesh: THREE.Mesh,
    opacity: number,
    isHighlighted: boolean,
    colorMode: ViewerSettings['colorMode']
  ) => {
    const orig = originalMaterialsRef.current.get(mesh) as THREE.MeshStandardMaterial;
    if (!orig) return;

    if (!mesh.material || !(mesh.material instanceof THREE.MeshStandardMaterial)) {
      mesh.material = orig.clone();
    }

    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.transparent = opacity < 0.98;
    mat.opacity = opacity;

    if (isHighlighted) {
      mat.emissive = new THREE.Color(0xf43f5e);
      mat.emissiveIntensity = 0.6;
      mat.color = new THREE.Color(0xff2d55);
      mat.roughness = 0.25;
    } else {
      mat.emissive = new THREE.Color(0x000000);
      mat.emissiveIntensity = 0;

      if (colorMode === 'monochrome') {
        mat.color = new THREE.Color(0x94a3b8);
      } else if (colorMode === 'high-contrast') {
        mat.color = new THREE.Color(0xe11d48);
      } else if (colorMode === 'xray') {
        mat.color = new THREE.Color(0x38bdf8);
        mat.opacity = opacity * 0.35;
      } else {
        mat.color.copy(orig.color || new THREE.Color(0xad3842));
      }
    }
  };

  // 4. Update 3D Label Projections
  const updateLabelsProjection = (
    loadedModel: LoadedAnatomyModel,
    cam: THREE.PerspectiveCamera,
    width: number,
    height: number,
    selected: MuscleData | null,
    mode: ViewerSettings['labelMode']
  ) => {
    const list: LabelProjectionItem[] = [];
    const musclesToShow =
      mode === 'selected'
        ? selected
          ? [selected]
          : []
        : loadedModel.allMuscles;

    musclesToShow.forEach((muscle) => {
      const isCurrentSelected = selected?.id === muscle.id;

      // Project muscle center point to normalized device coordinates
      const v = new THREE.Vector3(...muscle.center);
      v.project(cam);

      // Frustum check
      if (v.z < 1.0 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05) {
        const x = ((v.x + 1) * width) / 2;
        const y = ((-v.y + 1) * height) / 2;

        list.push({
          muscle,
          x,
          y,
          visible: true,
          isSelected: isCurrentSelected,
        });
      }
    });

    setProjectedLabels(list);
  };

  // 5. Smoothly Focus Camera on Muscle when Selected
  useEffect(() => {
    if (!selectedMuscle || !cameraRef.current || !controlsRef.current) return;

    const [cx, cy, cz] = selectedMuscle.center;
    const target = new THREE.Vector3(cx, cy, cz);
    targetLookAt.current = target;

    // Position camera offset depending on region and depth
    const camDist = 0.75;
    const isPosterior = cz < -0.04 || selectedMuscle.region === 'Back' || selectedMuscle.region === 'Gluteal region';
    const isLateral = Math.abs(cx) > 0.25;

    const nx = isLateral ? cx * 1.4 : cx * 0.3;
    const ny = cy + 0.04;
    const nz = isPosterior ? cz - camDist : cz + camDist;

    targetCamPos.current = new THREE.Vector3(nx, ny, nz);
  }, [selectedMuscle]);

  // 6. Raycast Mouse Interactions for Highlighting & Selection
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !model || !rendererRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(model.root.children, true);

    const firstMuscleHit = intersects.find(
      (hit) => hit.object instanceof THREE.Mesh && hit.object.userData?.isMuscle && hit.object.visible
    );

    if (firstMuscleHit && firstMuscleHit.object instanceof THREE.Mesh) {
      hoveredMeshRef.current = firstMuscleHit.object;
      const mName = firstMuscleHit.object.userData?.muscleName || 'Muscle';
      setHoveredMuscleName(mName);
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 34 });
      if (canvasRef.current) canvasRef.current.style.cursor = 'pointer';
    } else {
      hoveredMeshRef.current = null;
      setHoveredMuscleName(null);
      setTooltipPos(null);
      if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
    }
  };

  const handlePointerDown = () => {
    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    if (canvasRef.current) canvasRef.current.style.cursor = hoveredMeshRef.current ? 'pointer' : 'grab';
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !model) return;

    const rect = canvasRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(model.root.children, true);

    const firstMuscleHit = intersects.find(
      (hit) => hit.object instanceof THREE.Mesh && hit.object.userData?.isMuscle && hit.object.visible
    );

    if (firstMuscleHit && firstMuscleHit.object.userData?.muscleId) {
      const muscleId = firstMuscleHit.object.userData.muscleId;
      const matched = model.allMuscles.find((m) => m.id === muscleId);
      if (matched) {
        onSelectMuscle(matched);
      }
    }
  };

  // 7. Preset View Camera Positions
  const applyViewPreset = useCallback((preset: ViewPreset) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const defaultCenter = new THREE.Vector3(0, 0.9, 0);
    targetLookAt.current = defaultCenter;

    switch (preset) {
      case 'front':
        targetCamPos.current = new THREE.Vector3(0, 0.95, 2.6);
        break;
      case 'back':
        targetCamPos.current = new THREE.Vector3(0, 0.95, -2.6);
        break;
      case 'left':
        targetCamPos.current = new THREE.Vector3(-2.6, 0.95, 0);
        break;
      case 'right':
        targetCamPos.current = new THREE.Vector3(2.6, 0.95, 0);
        break;
      case 'superior':
        targetCamPos.current = new THREE.Vector3(0, 3.2, 0.2);
        break;
      case 'inferior':
        targetCamPos.current = new THREE.Vector3(0, -1.6, 0.3);
        break;
      case 'isometric':
      default:
        targetCamPos.current = new THREE.Vector3(1.7, 1.3, 1.9);
        break;
    }
  }, []);

  // 8. Capture High-Resolution Viewport Snapshot
  const handleCaptureView = () => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    setIsCapturing(true);

    // Force pristine re-render to frame buffer
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png', 1.0);

    const link = document.createElement('a');
    const muscleNameSlug = selectedMuscle ? selectedMuscle.name.toLowerCase().replace(/\s+/g, '-') : 'full-muscular-system';
    link.download = `Anatomy3D-${muscleNameSlug}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();

    setTimeout(() => setIsCapturing(false), 800);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const getBackgroundClass = () => {
    switch (settings.backgroundTheme) {
      case 'obsidian':
        return 'bg-neutral-950 text-neutral-100';
      case 'clinical-light':
        return 'bg-slate-100 text-slate-900';
      case 'warm-studio':
        return 'bg-[#1c1917] text-amber-50';
      case 'dark-slate':
      default:
        return 'bg-[#0b0f19] text-slate-100';
    }
  };

  return (
    <div
      ref={containerRef}
      id="anatomy-3d-viewport-container"
      className={`relative w-full h-full select-none overflow-hidden transition-colors duration-300 ${getBackgroundClass()}`}
    >
      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        id="anatomy-3d-webgl-canvas"
        className="w-full h-full block touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
      />

      {/* When model is not loaded, display clean preparation notice without fake anatomy */}
      {!model && (
        <ModelPreparationNotice
          onLoadCustomModel={onLoadCustomModel}
          onRetryLoad={onRetryLoad}
          isLoading={isLoading}
          loadProgress={loadProgress}
        />
      )}

      {/* Hover Tooltip */}
      {hoveredMuscleName && tooltipPos && (
        <div
          id="muscle-hover-tooltip"
          className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-xl bg-slate-900/95 text-rose-300 font-semibold text-xs shadow-2xl border border-rose-500/40 backdrop-blur-md transform -translate-x-1/2 transition-all duration-75"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>{hoveredMuscleName}</span>
          </div>
        </div>
      )}

      {/* Screen-Projected 3D Dynamic Labels */}
      {model && (
        <MuscleLabels labels={projectedLabels} onSelectMuscle={onSelectMuscle} />
      )}

      {/* Viewport HUD Controls */}
      {model && (
        <ViewerControls
          onApplyPreset={applyViewPreset}
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          selectedMuscle={selectedMuscle}
          onCaptureScreenshot={handleCaptureView}
          isCapturing={isCapturing}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          isDrawingMode={isDrawingMode}
        />
      )}

      {/* Model Asset Info Badge */}
      {model && (
        <div
          id="model-asset-badge"
          className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2 pointer-events-none shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span className="font-semibold text-slate-200">Z-Anatomy Muscular Model Active</span>
          <span className="text-slate-600">|</span>
          <span>{model.objectCount} anatomical meshes</span>
        </div>
      )}
    </div>
  );
};
