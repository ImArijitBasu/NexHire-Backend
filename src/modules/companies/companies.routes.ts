import { Router } from 'express';
import { companiesController } from './companies.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { cacheMiddleware } from '../../middleware/cache';

const router = Router();

router.get('/', cacheMiddleware(120), companiesController.getAll);
router.get('/my', authenticate, authorize('EMPLOYER'), companiesController.getMyCompany);
router.get('/:slug', companiesController.getBySlug);
router.post('/', authenticate, authorize('EMPLOYER', 'ADMIN'), companiesController.create);
router.put('/:id', authenticate, companiesController.update);

export default router;
