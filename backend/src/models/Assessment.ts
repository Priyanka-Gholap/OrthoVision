import { Schema, model, Document } from 'mongoose';

export interface IAssessment {
  patientId: Schema.Types.ObjectId;
  joint: 'SF001' | 'SA001' | 'EF001' | 'KF001' | 'HF001' | 'NR001';
  peakRom: number;
  classification: 'Normal' | 'Mild Limitation' | 'Moderate Limitation' | 'Severe Limitation';
  confidenceScore: number;
  remarks: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type IAssessmentDocument = IAssessment & Document;

const assessmentSchema = new Schema<IAssessmentDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient User ID reference is required'],
      index: true,
    },
    joint: {
      type: String,
      enum: ['SF001', 'SA001', 'EF001', 'KF001', 'HF001', 'NR001'],
      required: [true, 'Joint identifier (e.g. SF001) is required'],
    },
    peakRom: {
      type: Number,
      required: [true, 'Peak Range of Motion (ROM) is required'],
    },
    classification: {
      type: String,
      enum: ['Normal', 'Mild Limitation', 'Moderate Limitation', 'Severe Limitation'],
      required: [true, 'Screening classification is required'],
    },
    confidenceScore: {
      type: Number,
      default: 1.0,
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Assessment = model<IAssessmentDocument>('Assessment', assessmentSchema);
export default Assessment;
