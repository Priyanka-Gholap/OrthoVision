/**
 * Shared Common TypeScript Interfaces for Flexion AI
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'Patient' | 'Doctor';

export interface User extends BaseEntity {
  fullName: string;
  email: string;
  role: UserRole;
}
