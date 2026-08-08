import { Router } from 'express';
import { updateProfile, getHistory, saveAssessment } from '../controllers/patientController';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Gated patient-only configurations
router.put('/patients/profile', requireAuth, authorizeRoles('Patient'), updateProfile);
router.get('/assessment/history', requireAuth, authorizeRoles('Patient'), getHistory);
router.post('/assessment/save', requireAuth, authorizeRoles('Patient'), saveAssessment);

export default router;
