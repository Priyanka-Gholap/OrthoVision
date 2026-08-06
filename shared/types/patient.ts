import { BaseEntity } from './common';

export interface PatientProfile {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  height: number; // in cm
  weight: number; // in kg
  medicalHistory: string[];
}

export interface Patient extends BaseEntity {
  patientId: string; // Foreign key to User
  doctorId: string;  // Foreign key to User (Doctor)
  profile: PatientProfile;
}
