import { Router } from 'express';
import { getProfile, updateProfile, getDashboardStats } from '../controllers/profileController';
import { protect } from '../middlewares/auth';

const router = Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.get('/dashboard', protect, getDashboardStats);

export default router;
