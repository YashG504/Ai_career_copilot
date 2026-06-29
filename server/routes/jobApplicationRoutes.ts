import { Router } from 'express';
import { createJob, getJobs, updateJobStatus, updateJob, deleteJob } from '../controllers/jobApplicationController';
import { protect } from '../middlewares/auth';

const router = Router();

router.route('/')
  .post(protect, createJob)
  .get(protect, getJobs);

router.route('/:id')
  .put(protect, updateJob)
  .delete(protect, deleteJob);

router.put('/:id/status', protect, updateJobStatus);

export default router;
