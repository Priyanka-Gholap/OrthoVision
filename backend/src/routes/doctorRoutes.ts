import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  assignPatient,
  getPatientAssessments,
  updateAssessmentRemarks,
  getAssessmentReport,
} from '../controllers/doctorController';
import { requireAuth, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Gated doctor-only configurations
router.get('/patients', requireAuth, authorizeRoles('Doctor'), getPatients);
router.get('/patients/:id', requireAuth, authorizeRoles('Doctor'), getPatientById);
router.get('/patients/:id/assessments', requireAuth, authorizeRoles('Doctor'), getPatientAssessments);
router.put('/patients/:patientId/assessments/:assessmentId/remarks', requireAuth, authorizeRoles('Doctor'), updateAssessmentRemarks);
router.get('/patients/:patientId/assessments/:assessmentId/report', requireAuth, authorizeRoles('Doctor'), getAssessmentReport);
router.post('/patients/:id/assign', requireAuth, authorizeRoles('Doctor'), assignPatient);

export default router;
