export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface AngleResult {
  angle: number | null;
  direction?: 'Left' | 'Right';
  isValid: boolean;
}

export class EMAFilter {
  private alpha: number;
  private prevValue: number | null = null;

  constructor(alpha: number = 0.25) {
    this.alpha = alpha;
  }

  filter(newValue: number | null): number | null {
    if (newValue === null) return this.prevValue;
    if (this.prevValue === null) {
      this.prevValue = newValue;
    } else {
      this.prevValue = this.alpha * newValue + (1 - this.alpha) * this.prevValue;
    }
    return this.prevValue;
  }

  reset() {
    this.prevValue = null;
  }
}

/**
 * 2D Vector Math: Calculate angle in degrees between vectors BA and BC, centered at Vertex B.
 */
export function calculate2DAngle(
  pA: PoseLandmark,
  pB: PoseLandmark,
  pC: PoseLandmark
): number | null {
  if (!pA || !pB || !pC) return null;
  if (pA.visibility < 0.5 || pB.visibility < 0.5 || pC.visibility < 0.5) return null;

  // Construct 2D vectors (projected on image plane, ignoring Z)
  const u = { x: pA.x - pB.x, y: pA.y - pB.y };
  const v = { x: pC.x - pB.x, y: pC.y - pB.y };

  const magU = Math.sqrt(u.x * u.x + u.y * u.y);
  const magV = Math.sqrt(v.x * v.x + v.y * v.y);

  // Avoid division by zero
  if (magU < 1e-5 || magV < 1e-5) return null;

  const dotProduct = u.x * v.x + u.y * v.y;
  let cosAngle = dotProduct / (magU * magV);

  // Clamp to [-1.0, 1.0] to prevent arccos returning NaN
  cosAngle = Math.max(-1.0, Math.min(1.0, cosAngle));

  const rawAngle = Math.acos(cosAngle) * (180 / Math.PI);
  return rawAngle;
}

/**
 * Reusable clinical goniometric calculation configurations.
 */
export const CLINICAL_ASSESSMENTS_CONFIG: Record<string, {
  isSideView: boolean;
  isFlexion: boolean; // Flexion angle = 180 - raw angle
  leftTriplet: [number, number, number]; // [A, B, C] where B is vertex
  rightTriplet: [number, number, number]; // [A, B, C] where B is vertex
}> = {
  SF001: {
    isSideView: true,
    isFlexion: false, // Shoulder raw angle is clinical angle
    leftTriplet: [23, 11, 13], // Hip, Shoulder, Elbow
    rightTriplet: [24, 12, 14], // Hip, Shoulder, Elbow
  },
  SA001: {
    isSideView: false, // Front View
    isFlexion: false,
    leftTriplet: [23, 11, 13], // Hip, Shoulder, Elbow
    rightTriplet: [24, 12, 14], // Hip, Shoulder, Elbow
  },
  EF001: {
    isSideView: true,
    isFlexion: true, // Elbow Bending = 180 - raw angle
    leftTriplet: [11, 13, 15], // Shoulder, Elbow, Wrist
    rightTriplet: [12, 14, 16], // Shoulder, Elbow, Wrist
  },
  HF001: {
    isSideView: true,
    isFlexion: true, // Hip Bending = 180 - raw angle
    leftTriplet: [11, 23, 25], // Shoulder, Hip, Knee
    rightTriplet: [12, 24, 26], // Shoulder, Hip, Knee
  },
  KF001: {
    isSideView: true,
    isFlexion: true, // Knee Bending = 180 - raw angle
    leftTriplet: [23, 25, 27], // Hip, Knee, Ankle
    rightTriplet: [24, 26, 28], // Hip, Knee, Ankle
  },
};

/**
 * Neck Rotation (NR001) proxy calculator.
 * Renders deviation magnitude and detects Left vs Right direction.
 */
export function calculateNeckRotation(landmarks: PoseLandmark[]): AngleResult {
  const nose = landmarks[0];
  const shoulderL = landmarks[11];
  const shoulderR = landmarks[12];

  if (!nose || !shoulderL || !shoulderR) {
    return { angle: null, isValid: false };
  }
  if (nose.visibility < 0.5 || shoulderL.visibility < 0.5 || shoulderR.visibility < 0.5) {
    return { angle: null, isValid: false };
  }

  // Midpoint between shoulders
  const midShoulder = {
    x: (shoulderL.x + shoulderR.x) / 2,
    y: (shoulderL.y + shoulderR.y) / 2,
    z: (shoulderL.z + shoulderR.z) / 2,
    visibility: Math.min(shoulderL.visibility, shoulderR.visibility)
  };

  // Shoulder vector
  const vShoulder = { x: shoulderL.x - shoulderR.x, y: shoulderL.y - shoulderR.y };
  // Head vector
  const vHead = { x: nose.x - midShoulder.x, y: nose.y - midShoulder.y };

  const magS = Math.sqrt(vShoulder.x * vShoulder.x + vShoulder.y * vShoulder.y);
  const magH = Math.sqrt(vHead.x * vHead.x + vHead.y * vHead.y);

  if (magS < 1e-5 || magH < 1e-5) {
    return { angle: null, isValid: false };
  }

  const dot = vShoulder.x * vHead.x + vShoulder.y * vHead.y;
  let cosPhi = dot / (magS * magH);
  cosPhi = Math.max(-1.0, Math.min(1.0, cosPhi));

  const phi = Math.acos(cosPhi) * (180 / Math.PI);

  // Magnitude is deviation from vertical/perpendicular axis (90 degrees)
  const magnitude = Math.abs(90 - phi);

  // Determine direction independently based on relative Nose X coordinate
  // Note: MediaPipe horizontal coordinates (X) are mirrored for patient-facing view
  const direction = nose.x < midShoulder.x ? 'Left' : 'Right';

  return {
    angle: magnitude,
    direction,
    isValid: true
  };
}

/**
 * Main dispatcher to calculate clinical joint angle based on active assessment and presenter side.
 */
export function calculateJointAngle(
  jointId: string,
  landmarks: PoseLandmark[],
  lockedSide: 'LEFT' | 'RIGHT' | null
): AngleResult {
  if (jointId === 'NR001') {
    return calculateNeckRotation(landmarks);
  }

  const config = CLINICAL_ASSESSMENTS_CONFIG[jointId];
  if (!config) {
    return { angle: null, isValid: false };
  }

  // Determine indices depending on presentation side selection
  const side = lockedSide || 'LEFT'; // Fallback to LEFT if not locked yet
  const triplet = side === 'LEFT' ? config.leftTriplet : config.rightTriplet;

  const pA = landmarks[triplet[0]];
  const pB = landmarks[triplet[1]]; // Vertex
  const pC = landmarks[triplet[2]];

  const rawAngle = calculate2DAngle(pA, pB, pC);
  if (rawAngle === null) {
    return { angle: null, isValid: false };
  }

  const finalAngle = config.isFlexion ? 180 - rawAngle : rawAngle;

  return {
    angle: finalAngle,
    isValid: true
  };
}

/**
 * Resolves required landmarks indices for visibility checks dynamically based on presentation side.
 */
export function getRequiredLandmarksForFrame(jointId: string, landmarks: PoseLandmark[]): number[] {
  if (!landmarks || landmarks.length === 0) return [];

  // Determine side presentation: compare left shoulder (11) visibility with right shoulder (12)
  const leftShoulderVis = landmarks[11]?.visibility || 0;
  const rightShoulderVis = landmarks[12]?.visibility || 0;
  const isLeftPresented = leftShoulderVis > rightShoulderVis;

  if (jointId === 'SF001' || jointId === 'EF001') {
    // Side view exercises: require only the presented side
    return isLeftPresented ? [11, 13, 15] : [12, 14, 16]; // Shoulder, elbow, wrist
  }
  if (jointId === 'SA001') {
    // Front view: requires both shoulders, elbows, wrists
    return [11, 12, 13, 14, 15, 16];
  }
  if (jointId === 'HF001' || jointId === 'KF001') {
    // Side view leg exercises: require only the presented side
    return isLeftPresented ? [23, 25, 27] : [24, 26, 28]; // Hip, knee, ankle
  }
  if (jointId === 'NR001') {
    // Front view neck: nose, eyes, shoulders
    return [0, 2, 5, 11, 12];
  }
  return [];
}
