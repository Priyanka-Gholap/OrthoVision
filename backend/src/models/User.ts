import { Schema, model, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

// User fields definition interface
export interface IUser {
  fullName: string;
  email: string;
  password?: string;
  role: 'Patient' | 'Doctor' | 'Admin';
  status: 'Active' | 'Suspended' | 'Pending';
}

// User instance methods interface
export interface IUserMethods {
  comparePassword(passwordAttempt: string): Promise<boolean>;
}

// User Model type
type UserModel = Model<IUser, {}, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Ensure password hash is excluded in queries by default
    },
    role: {
      type: String,
      enum: ['Patient', 'Doctor', 'Admin'],
      required: [true, 'Role is required'],
    },
    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Pending'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save password hashing hook
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password!, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Compare password helper method
userSchema.methods.comparePassword = function (this: any, passwordAttempt: string): Promise<boolean> {
  // expects password to have been loaded (e.g. select('+password'))
  return bcrypt.compare(passwordAttempt, this.password || '');
};

export const User = model<IUser, UserModel>('User', userSchema);
export default User;
