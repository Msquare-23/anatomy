import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { getMuscleByObjectName, isSkeletonOrTendonObject, inferRegionFromObjectName } from './muscleObjectMapping';
import { MUSCLES_DATABASE } from '../data/muscles';
import { MuscleData } from '../types/anatomy';

export interface LoadedAnatomyModel {
  root: THREE.Group;
  muscleMeshMap: Map<string, THREE.Mesh[]>;
  allMuscles: MuscleData[];
  skeletonGroup: THREE.Group;
  tendonGroup: THREE.Group;
  objectCount: number;
  isExternalGLB: boolean;
  boundingBox: THREE.Box3;
  center: THREE.Vector3;
}

/**
 * Creates standard anatomical muscle material.
 * Preserves PBR properties without mutating source files.
 */
export function createMuscleMaterial(colorHex: number = 0xad3842): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    roughness: 0.45,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
}

/**
 * Loads the real Z-Anatomy muscular GLB asset using GLTFLoader and DRACOLoader.
 * Path defaults to `/models/muscular.glb` (corresponding to `public/models/muscular.glb`).
 * 
 * If the model file is not present or fails to load, this function throws a clean error
 * allowing the application to display a development state notice without generating fake anatomy.
 */
export async function loadAnatomyModel(
  modelUrl: string = '/models/muscular.glb',
  onProgress?: (percent: number) => void
): Promise<LoadedAnatomyModel> {
  const gltfLoader = new GLTFLoader();

  // Configure DRACOLoader for compressed GLTF/GLB models
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
  gltfLoader.setDRACOLoader(dracoLoader);

  // Load the GLB file
  const gltf = await new Promise<any>((resolve, reject) => {
    gltfLoader.load(
      modelUrl,
      (data) => resolve(data),
      (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
      (err) => reject(err)
    );
  });

  const root = new THREE.Group();
  root.name = 'ZAnatomy_Muscular_System';
  const sceneObj = gltf.scene || gltf.scenes[0];
  root.add(sceneObj);

  const muscleMeshMap = new Map<string, THREE.Mesh[]>();
  const skeletonGroup = new THREE.Group();
  skeletonGroup.name = 'Skeletal_Structures';
  const tendonGroup = new THREE.Group();
  tendonGroup.name = 'Tendons_and_Fascia';

  const dynamicMusclesMap = new Map<string, MuscleData>();
  let objectCount = 0;

  // Initialize dynamicMusclesMap with pre-configured database
  MUSCLES_DATABASE.forEach((m) => dynamicMusclesMap.set(m.id, { ...m }));

  // Traverse and process individual meshes without merging
  sceneObj.traverse((child: THREE.Object3D) => {
    if (child instanceof THREE.Mesh) {
      objectCount++;
      child.castShadow = true;
      child.receiveShadow = true;

      const objName = child.name || '';
      const muscleMatch = getMuscleByObjectName(objName);

      // Compute mesh local bounding box and center
      if (child.geometry) {
        child.geometry.computeBoundingBox();
        child.geometry.computeVertexNormals();
      }

      if (muscleMatch) {
        child.userData = {
          muscleId: muscleMatch.id,
          muscleName: muscleMatch.name,
          isMuscle: true,
          region: muscleMatch.region,
          layer: muscleMatch.layer,
          originalName: objName,
        };

        // Apply clean anatomical material if default is unlit or missing
        if (!child.material || child.material instanceof THREE.MeshBasicMaterial) {
          child.material = createMuscleMaterial();
        }

        const existing = muscleMeshMap.get(muscleMatch.id) || [];
        existing.push(child);
        muscleMeshMap.set(muscleMatch.id, existing);

        // Calculate and refine 3D center point from actual mesh vertices
        if (child.geometry && child.geometry.boundingBox) {
          const meshCenter = new THREE.Vector3();
          child.geometry.boundingBox.getCenter(meshCenter);
          child.localToWorld(meshCenter);

          const existingData = dynamicMusclesMap.get(muscleMatch.id);
          if (existingData) {
            existingData.center = [meshCenter.x, meshCenter.y, meshCenter.z];
          }
        }
      } else {
        const type = isSkeletonOrTendonObject(objName);
        if (type === 'skeleton') {
          child.userData = { isSkeleton: true, originalName: objName };
          skeletonGroup.add(child.clone());
        } else if (type === 'tendon') {
          child.userData = { isTendon: true, originalName: objName };
          tendonGroup.add(child.clone());
        } else {
          // If the mesh is named after an unindexed muscle structure, treat it as a muscle
          const inferredRegion = inferRegionFromObjectName(objName);
          const cleanName = objName.replace(/[_\.]+/g, ' ').trim();
          const dynamicId = objName.toLowerCase().replace(/[\s_\.]+/g, '-');

          child.userData = {
            muscleId: dynamicId,
            muscleName: cleanName,
            isMuscle: true,
            region: inferredRegion,
            layer: 'Superficial muscles',
            originalName: objName,
          };

          if (!child.material || child.material instanceof THREE.MeshBasicMaterial) {
            child.material = createMuscleMaterial();
          }

          const existing = muscleMeshMap.get(dynamicId) || [];
          existing.push(child);
          muscleMeshMap.set(dynamicId, existing);

          if (!dynamicMusclesMap.has(dynamicId)) {
            const dynamicRecord: MuscleData = {
              id: dynamicId,
              name: cleanName,
              region: inferredRegion,
              layer: 'Superficial muscles',
              origin: 'Anatomical attachment points documented in Z-Anatomy standard',
              insertion: 'Distal tendon insertion',
              action: ['Muscular contraction and joint stabilization'],
              innervation: 'Somatic motor innervation',
              objectNames: [objName],
              center: [0, 1.0, 0],
              description: `Anatomical structure: ${cleanName} (${inferredRegion} region).`,
            };
            dynamicMusclesMap.set(dynamicId, dynamicRecord);
          }
        }
      }
    }
  });

  // Calculate overall bounding box and center
  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  // Normalize model placement so it is centered on the origin
  if (size.y > 0.1) {
    const targetHeight = 2.0;
    const scale = targetHeight / size.y;
    root.scale.set(scale, scale, scale);
    root.position.y -= center.y * scale - (targetHeight / 2);
  }

  // Update dynamic centers with final transformed world positions
  muscleMeshMap.forEach((meshes, mId) => {
    if (meshes.length > 0) {
      const combinedBox = new THREE.Box3();
      meshes.forEach((m) => {
        m.updateMatrixWorld(true);
        if (m.geometry) {
          const meshBox = m.geometry.boundingBox?.clone().applyMatrix4(m.matrixWorld);
          if (meshBox) combinedBox.union(meshBox);
        }
      });
      const mCenter = new THREE.Vector3();
      combinedBox.getCenter(mCenter);
      const record = dynamicMusclesMap.get(mId);
      if (record && !isNaN(mCenter.x) && !isNaN(mCenter.y) && !isNaN(mCenter.z)) {
        record.center = [mCenter.x, mCenter.y, mCenter.z];
      }
    }
  });

  return {
    root,
    muscleMeshMap,
    allMuscles: Array.from(dynamicMusclesMap.values()),
    skeletonGroup,
    tendonGroup,
    objectCount,
    isExternalGLB: true,
    boundingBox: box,
    center,
  };
}
