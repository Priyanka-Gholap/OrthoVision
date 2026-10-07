import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Patient } from '../models/Patient';
import { User } from '../models/User';
import { Assessment } from '../models/Assessment';
import { AppError } from '../middleware/errorHandler';
import { TokenPayload } from '../utils/jwt/token';
import { generateAssessmentReportPdf } from '../utils/pdf/assessmentReport';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

const createAppError = (message: string, statusCode: number, code: string): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const getAuthorizedPatientAssessment = async (req: Request) => {
  if (!req.user || req.user.role !== 'Doctor') {
    throw createAppError('Access denied. Insufficient permissions.', 403, 'FORBIDDEN_ROLE');
  }

  const { patientId, assessmentId } = req.params;
  if (!mongoose.isValidObjectId(patientId)) {
    throw createAppError('Patient not found.', 404, 'NOT_FOUND');
  }

  const patientProfile = await Patient.findOne({ patientId }).populate('patientId', 'fullName');
  if (!patientProfile) {
    throw createAppError('Patient not found.', 404, 'NOT_FOUND');
  }

  if (!patientProfile.doctorId || patientProfile.doctorId.toString() !== req.user.id) {
    throw createAppError(
      'Access denied. You are not authorized to access this patient\'s clinical records.',
      403,
      'FORBIDDEN_PATIENT_ACCESS'
    );
  }

  if (!mongoose.isValidObjectId(assessmentId)) {
    throw createAppError('Assessment not found.', 404, 'ASSESSMENT_NOT_FOUND');
  }

  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) {
    throw createAppError('Assessment not found.', 404, 'ASSESSMENT_NOT_FOUND');
  }

  if (assessment.patientId.toString() !== patientId) {
    throw createAppError(
      'Access denied. This assessment does not belong to the requested patient.',
      403,
      'FORBIDDEN_ASSESSMENT_ACCESS'
    );
  }

  return { patientProfile, assessment };
};

/**
 * List all patients (privacy-filtered: name, email, assignment status only)
 */
export const getPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { search } = req.query;

  try {
    if (!req.user || req.user.role !== 'Doctor') {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }

    let patientUserIds: any[] = [];

    // If search is supplied, filter users first
    if (search && typeof search === 'string') {
      const users = await User.find({
        role: 'Patient',
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      patientUserIds = users.map(u => u._id);
    }

    const query: any = {};
    if (search) {
      query.patientId = { $in: patientUserIds };
    }

    // Retrieve patients, populate ONLY name/email from User model
    const patientsList = await Patient.find(query)
      .populate('patientId', 'fullName email')
      .select('patientId doctorId'); // Exclude age, height, weight, medicalHistory for privacy

    res.status(200).json({
      success: true,
      data: patientsList,
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * Fetch detailed clinical profile (Gated: Doctor must be assigned to the patient)
 */
export const getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const patientUserId = req.params.id;

  try {
    if (!req.user || req.user.role !== 'Doctor') {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }

    const patientProfile = await Patient.findOne({ patientId: patientUserId }).populate('patientId', 'fullName email');

    if (!patientProfile) {
      const error: AppError = new Error('Patient not found.');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    // Access Control check: Is this patient assigned to the requesting doctor?
    if (!patientProfile.doctorId || patientProfile.doctorId.toString() !== req.user.id) {
      const error: AppError = new Error('Access denied. You are not authorized to view this patient\'s clinical metrics.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_PATIENT_ACCESS';
      return next(error);
    }

    res.status(200).json({
      success: true,
      data: patientProfile,
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * Self-assign an unassigned patient
 */
export const assignPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const patientUserId = req.params.id;

  try {
    if (!req.user || req.user.role !== 'Doctor') {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }

    const patientProfile = await Patient.findOne({ patientId: patientUserId });

    if (!patientProfile) {
      const error: AppError = new Error('Patient not found.');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    // Constraints check: Is patient already assigned to another doctor?
    if (patientProfile.doctorId) {
      const error: AppError = new Error('Reassignment blocked. This patient is already assigned to a clinician.');
      error.statusCode = 409;
      error.code = 'PATIENT_ALREADY_ASSIGNED';
      return next(error);
    }

    // Set doctor assignment
    patientProfile.doctorId = req.user.id as any;
    await patientProfile.save();

    res.status(200).json({
      success: true,
      data: patientProfile,
    });
  } catch (err: any) {
    next(err);
  }
};

/**
 * Fetch patient assessment history (Gated: Doctor must be assigned to the patient)
 */
export const getPatientAssessments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const patientUserId = req.params.id;

  try {
    if (!req.user || req.user.role !== 'Doctor') {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_ROLE';
      return next(error);
    }

    const patientProfile = await Patient.findOne({ patientId: patientUserId });

    if (!patientProfile) {
      const error: AppError = new Error('Patient not found.');
      error.statusCode = 404;
      error.code = 'NOT_FOUND';
      return next(error);
    }

    // Access Control check: Is patient assigned to the requesting doctor?
    if (!patientProfile.doctorId || patientProfile.doctorId.toString() !== req.user.id) {
      const error: AppError = new Error('Access denied. You are not authorized to view this patient\'s screening records.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN_PATIENT_ACCESS';
      return next(error);
    }

    // Fetch actual assessment records only (no fake data)
    const assessments = await Assessment.find({ patientId: patientUserId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: assessments,
    });
  } catch (err: any) {
    next(err);
  }
};

export const updateAssessmentRemarks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { assessment } = await getAuthorizedPatientAssessment(req);
    const remarksValue = req.body?.remarks;
    if (typeof remarksValue !== 'string') {
      throw createAppError('Remarks must be a string.', 400, 'VALIDATION_ERROR');
    }

    if (remarksValue.length > 2000) {
      throw createAppError('Remarks cannot exceed 2000 characters.', 400, 'VALIDATION_ERROR');
    }

    assessment.remarks = remarksValue.trim();
    const updatedAssessment = await assessment.save();

    res.status(200).json({
      success: true,
      data: updatedAssessment,
    });
  } catch (err: any) {
    next(err);
  }
};

export const getAssessmentReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { patientProfile, assessment } = await getAuthorizedPatientAssessment(req);
    const patientUser = patientProfile.patientId as { _id?: { toString(): string }; fullName?: string } | null;
    const pdf = await generateAssessmentReportPdf({
      patientName: patientUser?.fullName,
      patientId: patientUser?._id?.toString() || req.params.patientId,
      age: patientProfile.age,
      gender: patientProfile.gender,
      height: patientProfile.height,
      weight: patientProfile.weight,
      assessmentDate: assessment.createdAt,
      joint: assessment.joint,
      peakRom: assessment.peakRom,
      classification: assessment.classification,
      confidenceScore: assessment.confidenceScore,
      remarks: assessment.remarks,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="clinical-assessment-${assessment._id}.pdf"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).send(pdf);
  } catch (err: any) {
    next(err);
  }
};
