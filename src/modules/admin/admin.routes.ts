import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Admin routes
router.get('/stats', authenticate, authorize('ADMIN'), adminController.getStats);
router.get('/users', authenticate, authorize('ADMIN'), adminController.getUsers);
router.put('/users/:id/role', authenticate, authorize('ADMIN'), adminController.updateUserRole);
router.delete('/users/:id', authenticate, authorize('ADMIN'), adminController.deleteUser);
router.get('/jobs', authenticate, authorize('ADMIN'), adminController.getJobs);
router.get('/contacts', authenticate, authorize('ADMIN'), adminController.getContacts);
router.put('/contacts/:id', authenticate, authorize('ADMIN'), adminController.updateContactStatus);

// Role-specific stats
router.get('/employer-stats', authenticate, authorize('EMPLOYER'), adminController.getEmployerStats);
router.get('/seeker-stats', authenticate, adminController.getSeekerStats);

export default router;
