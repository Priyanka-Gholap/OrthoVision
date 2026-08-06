import { BaseEntity } from './common';

export interface Report extends BaseEntity {
  assessmentId: string; // Foreign key to Assessment
  remarks: string;       // Doctor notes/diagnosis
  reportURL: string;     // Local local/cloud report path link
}
