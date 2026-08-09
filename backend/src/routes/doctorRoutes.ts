import { Router } from 'express';
import { getPatients, getPatientById, assignPatient, getPatientAssessments } from '../controllers/doctorController';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Gated doctor-only configurations
router.get('/patients', requireAuth, authorizeRoles('Doctor'), getPatients);
router.get('/patients/:id', requireAuth, authorizeRoles('Doctor'), getPatientById);
router.get('/patients/:id/assessments', requireAuth, authorizeRoles('Doctor'), getPatientAssessments);
router.post('/patients/:id/assign', requireAuth, authorizeRoles('Doctor'), assignPatient);

export default router;
