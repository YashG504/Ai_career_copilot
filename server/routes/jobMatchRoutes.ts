import { Router } from 'express';
import {
  matchJob,
  getJobMatches,
  getJobMatch,
  deleteJobMatch,
} from '../controllers/jobMatchController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { matchJobSchema } from '../validators/jobMatchValidator';

const router = Router();

router.post('/', protect, validate(matchJobSchema), matchJob);
router.get('/', protect, getJobMatches);
router.get('/:id', protect, getJobMatch);
router.delete('/:id', protect, deleteJobMatch);

export default router;
