import { Request, Response, NextFunction } from 'express';
import { Patient } from '../models/Patient';
import { Assessment } from '../models/Assessment';
import { AppError } from '../middleware/errorHandler';
import { TokenPayload } from '../utils/jwt/token';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { age, gender, height, weight } = req.body;

  try {
    if (!req.user || req.user.role !== 'Patient') {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }

    // Input validation checks
    if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 120)) {
      const error: AppError = new Error('Invalid age value.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    if (height !== undefined && (typeof height !== 'number' || height < 0 || height > 300)) {
      const error: AppError = new Error('Invalid height value.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    if (weight !== undefined && (typeof weight !== 'number' || weight < 0 || weight > 500)) {
      const error: AppError = new Error('Invalid weight value.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    if (gender !== undefined && !['Male', 'Female', 'Other'].includes(gender)) {
      const error: AppError = new Error('Invalid gender value.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    // Update patient profile (upsert if not exists)
    const updatedProfile = await Patient.findOneAndUpdate(
      { patientId: req.user.id },
      { age, gender, height, weight },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProfile,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'Patient') {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }

    // Retrieve assessments logs mapped to verified user ID (newest first)
    const assessments = await Assessment.find({ patientId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (err: any) {
    next(err);
  }
};

export const saveAssessment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { joint, peakRom, classification, confidenceScore } = req.body;

  try {
    if (!req.user || req.user.role !== 'Patient') {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }

    // Ensure parameters exist
    if (!joint || peakRom === undefined || !classification) {
      const error: AppError = new Error('Missing required assessment parameters.');
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      return next(error);
    }

    // Save assessment results (patientId is resolved from verified JWT)
    const savedAssessment = await Assessment.create({
      patientId: req.user.id,
      joint,
      peakRom,
      classification,
      confidenceScore: confidenceScore !== undefined ? confidenceScore : 1.0,
    });

    res.status(201).json({
      success: true,
      data: savedAssessment,
    });
  } catch (err: any) {
    next(err);
  }
};
