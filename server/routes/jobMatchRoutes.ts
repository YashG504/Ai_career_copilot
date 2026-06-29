import { Router } from 'express';
import {
  matchJob,
  getJobMatches,
  getJobMatch,
  deleteJobMatch,
} from '../controllers/jobMatchController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/', protect, matchJob);
router.get('/', protect, getJobMatches);
router.get('/:id', protect, getJobMatch);
router.delete('/:id', protect, deleteJobMatch);

export default router;
