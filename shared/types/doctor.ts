import { BaseEntity } from './common';

export interface DoctorProfile {
  specialization: string;
  hospital: string;
  experience: number; // in years
}

export interface Doctor extends BaseEntity {
  doctorId: string; // Foreign key to User
  profile: DoctorProfile;
}
