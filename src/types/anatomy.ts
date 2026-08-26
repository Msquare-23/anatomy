export type MuscleRegion =
  | 'Head'
  | 'Face'
  | 'Neck'
  | 'Chest'
  | 'Abdomen'
  | 'Back'
  | 'Shoulder'
  | 'Arm'
  | 'Forearm'
  | 'Hand'
  | 'Pelvis'
  | 'Gluteal region'
  | 'Thigh'
  | 'Leg'
  | 'Foot';

export type AnatomyLayer =
  | 'Superficial muscles'
  | 'Intermediate muscles'
  | 'Deep muscles'
  | 'Tendons'
  | 'Skeleton';

export interface MuscleData {
  id: string;
  name: string;
  latinName?: string;
  region: MuscleRegion;
  layer: AnatomyLayer;
  origin: string | string[];
  insertion: string | string[];
  action: string | string[];
  innervation: string | string[];
  bloodSupply?: string | string[];
  notes?: string;
  objectNames: string[];
  center: [number, number, number];
  description?: string;
  antagonist?: string;
  synergists?: string[];
  pronunciation?: string;
}

export type ViewPreset =
  | 'front'
  | 'back'
  | 'left'
  | 'right'
  | 'superior'
  | 'inferior'
  | 'isometric';

export type BackgroundTheme =
  | 'dark-slate'
  | 'obsidian'
  | 'clinical-light'
  | 'warm-studio';

export type LabelDisplayMode = 'off' | 'selected' | 'all';

export type ModelColorMode = 'realistic' | 'monochrome' | 'high-contrast' | 'xray';

export interface ViewerSettings {
  opacity: number;
  labelMode: LabelDisplayMode;
  isolateSelected: boolean;
  highlightSelected: boolean;
  backgroundTheme: BackgroundTheme;
  colorMode: ModelColorMode;
  showSkeleton: boolean;
  showTendons: boolean;
  showGrid: boolean;
  lightIntensity: number;
  autoRotate: boolean;
  wireframe: boolean;
}

export interface RegionMetadata {
  id: MuscleRegion;
  name: string;
  description: string;
  muscleCount: number;
  defaultCameraPosition: [number, number, number];
  defaultTarget: [number, number, number];
}
