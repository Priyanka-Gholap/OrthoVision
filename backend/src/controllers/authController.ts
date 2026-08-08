import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { generateToken } from '../utils/jwt/token';
import { AppError } from '../middleware/errorHandler';
import { TokenPayload } from '../utils/jwt/token';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

// Cookie configuration matching revised implementation plan (Lax/Secure=false for dev)
const isProduction = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const, // Lax is required for local cross-port dev calls
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { fullName, email, password, role } = req.body;

  try {
    // 1. Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error: AppError = new Error('This email address is already registered.');
      error.statusCode = 409;
      error.code = 'DUPLICATE_EMAIL';
      return next(error);
    }

    // 2. Create the User (Password is hashed in User model schema pre-save hook)
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      status: 'Active',
    });

    // 3. Create the empty role-specific Profile model (Decoupled from initial registration details)
    if (role === 'Patient') {
      await Patient.create({ patientId: user._id });
    } else if (role === 'Doctor') {
      await Doctor.create({ doctorId: user._id });
    }

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  try {
    // 1. Locate user and explicitly select password hash
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error: AppError = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return next(error);
    }

    // 2. Compare password hashes
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error: AppError = new Error('Invalid email or password.');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return next(error);
    }

    // 3. Generate token
    const token = generateToken({
      id: user._id.toString(),
      role: user.role,
    });

    // 4. Attach token to cookie for client session tracking
    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        token, // Expose token to permit Postman/header testing
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Clear cookies by setting dynamic past expiration
    res.cookie('token', '', {
      ...cookieOptions,
      maxAge: 0,
      expires: new Date(0),
    });

    res.status(200).json({
      success: true,
    });
  } catch (err: any) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      const error: AppError = new Error('Not authenticated.');
      error.statusCode = 401;
      error.code = 'INVALID_TOKEN';
      return next(error);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      const error: AppError = new Error('User not found.');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      return next(error);
    }

    // Fetch decoupled profile metadata based on user role
    let profile: any = null;
    if (user.role === 'Patient') {
      profile = await Patient.findOne({ patientId: user._id });
    } else if (user.role === 'Doctor') {
      profile = await Doctor.findOne({ doctorId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        profile,
      },
    });
  } catch (err: any) {
    next(err);
  }
};
