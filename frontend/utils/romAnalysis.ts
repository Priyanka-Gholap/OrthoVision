/**
 * ROM Analysis & Movement Metrics Utility
 * Milestone 7: Computes starting/ending/min/max angles, peak ROM,
 * movement range, valid frame counts, assessment duration, and clinical classification.
 */

export type ClinicalClassification =
  | 'Normal'
  | 'Mild Limitation'
  | 'Moderate Limitation'
  | 'Severe Limitation'
  | 'Reference range unavailable';

export interface AngleSample {
  timestamp: number;
  angle: number;
}

export interface AssessmentMetrics {
  jointId: string;
  jointName: string;
  side?: 'LEFT' | 'RIGHT';
  direction?: 'Left' | 'Right';
  startingAngle: number;
  endingAngle: number;
  minimumAngle: number;
  maximumAngle: number;
  peakRom: number;
  movementRange: number;
  validFrameCount: number;
  assessmentDuration: number; // in seconds
  classification: ClinicalClassification;
}

/**
 * Validates whether an angle reading is a valid finite numeric value.
 */
export function isValidAngle(angle: number | null | undefined): angle is number {
  return angle !== null && angle !== undefined && typeof angle === 'number' && !isNaN(angle) && isFinite(angle);
}

/**
 * Clinical reference ranges from CLINICAL_PROTOCOL.md:
 * - Shoulder Flexion (SF001): Normal >= 160°, Mild 140-159°, Mod 120-139°, Severe < 120°
 * - Shoulder Abduction (SA001): Normal >= 160°, Mild 140-159°, Mod 120-139°, Severe < 120°
 * - Elbow Flexion (EF001): Normal >= 145°, Mild 130-144°, Mod 110-129°, Severe < 110°
 * - Knee Flexion (KF001): Normal >= 130°, Mild 115-129°, Mod 90-114°, Severe < 90°
 * - Hip Flexion (HF001): Normal >= 110°, Mild 95-109°, Mod 80-94°, Severe < 80°
 * - Neck Rotation (NR001): Normal >= 70°, Mild 60-69°, Mod 45-59°, Severe < 45°
 */
export function classifyRom(jointId: string, peakRom: number): ClinicalClassification {
  if (!isValidAngle(peakRom)) {
    return 'Reference range unavailable';
  }

  switch (jointId) {
    case 'SF001': // Shoulder Flexion
    case 'SA001': // Shoulder Abduction
      if (peakRom >= 160) return 'Normal';
      if (peakRom >= 140) return 'Mild Limitation';
      if (peakRom >= 120) return 'Moderate Limitation';
      return 'Severe Limitation';

    case 'EF001': // Elbow Flexion
      if (peakRom >= 145) return 'Normal';
      if (peakRom >= 130) return 'Mild Limitation';
      if (peakRom >= 110) return 'Moderate Limitation';
      return 'Severe Limitation';

    case 'KF001': // Knee Flexion
      if (peakRom >= 130) return 'Normal';
      if (peakRom >= 115) return 'Mild Limitation';
      if (peakRom >= 90) return 'Moderate Limitation';
      return 'Severe Limitation';

    case 'HF001': // Hip Flexion
      if (peakRom >= 110) return 'Normal';
      if (peakRom >= 95) return 'Mild Limitation';
      if (peakRom >= 80) return 'Moderate Limitation';
      return 'Severe Limitation';

    case 'NR001': // Neck Rotation
      if (peakRom >= 70) return 'Normal';
      if (peakRom >= 60) return 'Mild Limitation';
      if (peakRom >= 45) return 'Moderate Limitation';
      return 'Severe Limitation';

    default:
      return 'Reference range unavailable';
  }
}

/**
 * Calculates complete assessment movement metrics from recorded angle samples.
 * Returns null if insufficient valid samples (< minValidFrames) were collected.
 */
export function calculateAssessmentMetrics(
  jointId: string,
  jointName: string,
  samples: AngleSample[],
  startTimeMs: number,
  endTimeMs: number,
  side?: 'LEFT' | 'RIGHT',
  direction?: 'Left' | 'Right',
  minValidFrames: number = 15
): AssessmentMetrics | null {
  if (!samples || samples.length < minValidFrames) {
    return null;
  }

  // Filter for valid numbers
  const validAngles = samples
    .map((s) => s.angle)
    .filter(isValidAngle);

  if (validAngles.length < minValidFrames) {
    return null;
  }

  const startingAngle = validAngles[0];
  const endingAngle = validAngles[validAngles.length - 1];
  const minimumAngle = Math.min(...validAngles);
  const maximumAngle = Math.max(...validAngles);
  const peakRom = maximumAngle;
  const movementRange = Math.max(0, maximumAngle - minimumAngle);
  const validFrameCount = validAngles.length;

  const rawDuration = Math.max(0, (endTimeMs - startTimeMs) / 1000);
  const assessmentDuration = Math.round(rawDuration * 10) / 10;

  const classification = classifyRom(jointId, peakRom);

  return {
    jointId,
    jointName,
    side,
    direction,
    startingAngle: Math.round(startingAngle * 10) / 10,
    endingAngle: Math.round(endingAngle * 10) / 10,
    minimumAngle: Math.round(minimumAngle * 10) / 10,
    maximumAngle: Math.round(maximumAngle * 10) / 10,
    peakRom: Math.round(peakRom * 10) / 10,
    movementRange: Math.round(movementRange * 10) / 10,
    validFrameCount,
    assessmentDuration,
    classification,
  };
}
