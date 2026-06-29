import { Router } from 'express';
import { getSystemStats, getAllUsers } from '../controllers/adminController';
import { protect } from '../middlewares/auth';
import { admin } from '../middlewares/admin';

const router = Router();

router.get('/stats', protect, admin, getSystemStats);
router.get('/users', protect, admin, getAllUsers);

export default router;
