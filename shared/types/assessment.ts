import { BaseEntity } from './common';

export interface Landmark {
  id: number;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface LandmarkFrame {
  timestamp: number;
  landmarks: Landmark[];
}

export interface JointAngleRecord {
  timestamp: number;
  angle: number;
}

export interface MovementAnalysisResult {
  jitterScore: number;
  stability: 'High' | 'Medium' | 'Low';
  asymmetryPercent?: number;
}

export type LimitationClassification = 'Normal' | 'Mild Limitation' | 'Moderate Limitation' | 'Severe Limitation';

export interface Assessment extends BaseEntity {
  assessmentId: string;
  patientId: string; // Foreign key to User/Patient
  doctorId: string;  // Foreign key to User/Doctor
  joint: string;      // e.g. "left_shoulder"
  peakRom: number;
  referenceMin: number;
  referenceMax: number;
  classification: LimitationClassification;
  movementAnalysis: MovementAnalysisResult;
  confidenceScore: number;
}
