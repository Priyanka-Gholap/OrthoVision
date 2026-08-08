import { Schema, model } from 'mongoose';

const doctorSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor User ID reference is required'],
      unique: true,
    },
    specialization: {
      type: String,
      trim: true,
    },
    hospital: {
      type: String,
      trim: true,
    },
    experience: {
      type: Number,
      min: [0, 'Experience years cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = model('Doctor', doctorSchema);
export default Doctor;
