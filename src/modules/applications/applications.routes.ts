import { Router } from 'express';
import { applicationsController } from './applications.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.post('/', authenticate, applicationsController.apply);
router.get('/my', authenticate, applicationsController.getMy);
router.get('/employer', authenticate, authorize('EMPLOYER', 'ADMIN'), applicationsController.getForEmployer);
router.put('/:id/status', authenticate, authorize('EMPLOYER', 'ADMIN'), applicationsController.updateStatus);

export default router;
