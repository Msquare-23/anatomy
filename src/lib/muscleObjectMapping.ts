import { MuscleData, MuscleRegion, AnatomyLayer } from '../types/anatomy';
import { MUSCLES_DATABASE } from '../data/muscles';

// Mapping dictionary from normalized 3D mesh names to MuscleData IDs
const objectNameToMuscleIdMap: Map<string, string> = new Map();

/**
 * Normalizes raw 3D mesh names from GLB assets (Z-Anatomy, BodyParts3D, Blender exports)
 * into a standardized canonical anatomy key.
 */
export function normalizeAnatomyName(rawName: string): string {
  if (!rawName) return '';

  return rawName
    .trim()
    .toLowerCase()
    // Remove common prefixes
    .replace(/^(m_|musculus_|muscle_|z_anatomy_|zanatomy_|bp3d_|fma_|ta98_|ta_)/i, '')
    // Remove Blender copy / mesh suffixes like .001, .002, _mesh, _geo
    .replace(/\.\d+$/g, '')
    .replace(/_(mesh|geo|geometry|model|primitive\d*)$/i, '')
    // Normalize side suffixes (e.g., _l, _r, _left, _right, _sinister, _dexter)
    .replace(/_(left|right|sinister|dexter|l|r)$/i, '')
    .replace(/^(left|right)_/i, '')
    // Normalize spaces, hyphens, and multiple underscores
    .replace(/[\s\-.]+/g, '_')
    // Remove common head/part designations for base muscle matching
    .replace(/_caput_(longum|breve|mediale|laterale|profundum|superficiale)/i, '')
    .replace(/_pars_(clavicularis|sternocostalis|abdominalis|scapularis|acromialis|spinalis)/i, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Build fast lookup indexes from MUSCLES_DATABASE
 */
function initializeLookupIndex() {
  MUSCLES_DATABASE.forEach((muscle) => {
    const canonicalId = muscle.id;

    // 1. Direct ID normalized
    objectNameToMuscleIdMap.set(normalizeAnatomyName(muscle.id), canonicalId);
    objectNameToMuscleIdMap.set(muscle.id.toLowerCase(), canonicalId);

    // 2. English Display Name
    objectNameToMuscleIdMap.set(normalizeAnatomyName(muscle.name), canonicalId);
    objectNameToMuscleIdMap.set(muscle.name.toLowerCase(), canonicalId);

    // 3. Latin Name
    if (muscle.latinName) {
      objectNameToMuscleIdMap.set(normalizeAnatomyName(muscle.latinName), canonicalId);
      objectNameToMuscleIdMap.set(muscle.latinName.toLowerCase(), canonicalId);
    }

    // 4. Aliases declared in objectNames array
    muscle.objectNames.forEach((alias) => {
      objectNameToMuscleIdMap.set(normalizeAnatomyName(alias), canonicalId);
      objectNameToMuscleIdMap.set(alias.toLowerCase(), canonicalId);
      objectNameToMuscleIdMap.set(alias.toLowerCase().replace(/[\s_-]+/g, ''), canonicalId);
    });
  });
}

initializeLookupIndex();

/**
 * Finds the corresponding MuscleData for a given 3D object/mesh name in the GLB.
 * Supports exact matching, normalized matching, alias dictionary lookup,
 * and fuzzy substring token matching.
 */
export function getMuscleByObjectName(objectName: string): MuscleData | undefined {
  if (!objectName) return undefined;

  const rawLower = objectName.trim().toLowerCase();

  // Step 1: Direct lookup
  const directId = objectNameToMuscleIdMap.get(rawLower);
  if (directId) {
    return MUSCLES_DATABASE.find((m) => m.id === directId);
  }

  // Step 2: Normalized lookup (prefix/suffix stripped)
  const normalized = normalizeAnatomyName(objectName);
  const normalizedId = objectNameToMuscleIdMap.get(normalized);
  if (normalizedId) {
    return MUSCLES_DATABASE.find((m) => m.id === normalizedId);
  }

  // Step 3: Check sanitized alphanumeric equality
  const sanitizedObj = rawLower.replace(/[^a-z0-9]/g, '');
  for (const muscle of MUSCLES_DATABASE) {
    const sanitizedId = muscle.id.replace(/[^a-z0-9]/g, '');
    const sanitizedName = muscle.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedLatin = muscle.latinName ? muscle.latinName.toLowerCase().replace(/[^a-z0-9]/g, '') : '';

    if (
      sanitizedObj === sanitizedId ||
      sanitizedObj === sanitizedName ||
      (sanitizedLatin && sanitizedObj === sanitizedLatin)
    ) {
      return muscle;
    }
  }

  // Step 4: Token overlap / Alias inclusion
  for (const muscle of MUSCLES_DATABASE) {
    for (const alias of muscle.objectNames) {
      const normAlias = normalizeAnatomyName(alias);
      if (normalized.includes(normAlias) || normAlias.includes(normalized)) {
        return muscle;
      }
    }
  }

  // Step 5: If the object represents a muscle but is not yet in our pre-indexed list,
  // return undefined so the caller can either create a dynamic entry or classify it.
  return undefined;
}

/**
 * Checks if a given 3D mesh name in the GLB represents a skeletal bone, tendon, or ligament structure.
 */
export function isSkeletonOrTendonObject(objectName: string): 'skeleton' | 'tendon' | null {
  if (!objectName) return null;
  const lower = objectName.toLowerCase();

  if (
    lower.includes('bone') ||
    lower.includes('skeleton') ||
    lower.includes('skull') ||
    lower.includes('cranium') ||
    lower.includes('mandible') ||
    lower.includes('rib') ||
    lower.includes('costa') ||
    lower.includes('femur') ||
    lower.includes('humerus') ||
    lower.includes('spine') ||
    lower.includes('vertebra') ||
    lower.includes('pelvis') ||
    lower.includes('ilium') ||
    lower.includes('ischium') ||
    lower.includes('pubis') ||
    lower.includes('sacrum') ||
    lower.includes('scapula') ||
    lower.includes('clavicle') ||
    lower.includes('clavicula') ||
    lower.includes('sternum') ||
    lower.includes('tibia') ||
    lower.includes('fibula') ||
    lower.includes('radius') ||
    lower.includes('ulna') ||
    lower.includes('patella') ||
    lower.includes('carpal') ||
    lower.includes('tarsal') ||
    lower.includes('phalanx') ||
    lower.includes('os_')
  ) {
    return 'skeleton';
  }

  if (
    lower.includes('tendon') ||
    lower.includes('aponeurosis') ||
    lower.includes('fascia') ||
    lower.includes('retinaculum') ||
    lower.includes('ligament') ||
    lower.includes('ligamentum') ||
    lower.includes('tendo') ||
    lower.includes('tractus_iliotibialis') ||
    lower.includes('iliotibial') ||
    lower.includes('achilles')
  ) {
    return 'tendon';
  }

  return null;
}

/**
 * Determines anatomical region from an object name when a mesh is unindexed.
 */
export function inferRegionFromObjectName(objectName: string): MuscleRegion {
  const norm = normalizeAnatomyName(objectName);
  if (norm.includes('face') || norm.includes('zygomatic') || norm.includes('oris') || norm.includes('oculi') || norm.includes('masseter') || norm.includes('buccinator')) return 'Face';
  if (norm.includes('head') || norm.includes('temporalis') || norm.includes('frontalis') || norm.includes('occipitalis')) return 'Head';
  if (norm.includes('neck') || norm.includes('cervic') || norm.includes('sternocleidomastoid') || norm.includes('scalene') || norm.includes('hyoid')) return 'Neck';
  if (norm.includes('pectoral') || norm.includes('chest') || norm.includes('intercostal') || norm.includes('subclavius') || norm.includes('serratus_anterior')) return 'Chest';
  if (norm.includes('abdom') || norm.includes('oblique') || norm.includes('transversus') || norm.includes('pyramidalis')) return 'Abdomen';
  if (norm.includes('back') || norm.includes('latissimus') || norm.includes('trapezius') || norm.includes('rhomboid') || norm.includes('erector') || norm.includes('splenius') || norm.includes('levator_scapulae')) return 'Back';
  if (norm.includes('deltoid') || norm.includes('supraspinatus') || norm.includes('infraspinatus') || norm.includes('teres') || norm.includes('subscapularis') || norm.includes('shoulder')) return 'Shoulder';
  if (norm.includes('biceps_brachii') || norm.includes('brachialis') || norm.includes('coracobrachialis') || norm.includes('triceps')) return 'Arm';
  if (norm.includes('brachioradialis') || norm.includes('pronator') || norm.includes('supinator') || norm.includes('forearm') || norm.includes('carpi') || norm.includes('digitorum')) return 'Forearm';
  if (norm.includes('thenar') || norm.includes('lumbrical') || norm.includes('interossei') || norm.includes('hand') || norm.includes('pollicis')) return 'Hand';
  if (norm.includes('iliopsoas') || norm.includes('psoas') || norm.includes('iliacus') || norm.includes('pelvis') || norm.includes('obturator') || norm.includes('piriformis')) return 'Pelvis';
  if (norm.includes('gluteus') || norm.includes('gluteal') || norm.includes('tensor_fasciae_latae')) return 'Gluteal region';
  if (norm.includes('quadriceps') || norm.includes('rectus_femoris') || norm.includes('vastus') || norm.includes('sartorius') || norm.includes('gracilis') || norm.includes('biceps_femoris') || norm.includes('semitendinosus') || norm.includes('semimembranosus') || norm.includes('adductor') || norm.includes('thigh')) return 'Thigh';
  if (norm.includes('tibialis') || norm.includes('gastrocnemius') || norm.includes('soleus') || norm.includes('plantaris') || norm.includes('popliteus') || norm.includes('fibularis') || norm.includes('peroneus') || norm.includes('leg') || norm.includes('calf')) return 'Leg';
  if (norm.includes('foot') || norm.includes('hallucis') || norm.includes('digiti_minimi') || norm.includes('plantar')) return 'Foot';

  return 'Chest';
}
