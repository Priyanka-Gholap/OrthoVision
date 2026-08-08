import { Schema, model } from 'mongoose';

const patientSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient User ID reference is required'],
      unique: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    age: {
      type: Number,
      min: [0, 'Age cannot be negative'],
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
    },
    height: {
      type: Number,
      min: [0, 'Height must be positive'],
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be positive'],
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Patient = model('Patient', patientSchema);
export default Patient;
