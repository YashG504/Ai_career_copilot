import { Router } from 'express';
import { getProfile, updateProfile, getDashboardStats } from '../controllers/profileController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { updateProfileSchema } from '../validators/profileValidator';

const router = Router();

router.get('/', protect, getProfile);
router.put('/', protect, validate(updateProfileSchema), updateProfile);
router.get('/dashboard', protect, getDashboardStats);

export default router;
