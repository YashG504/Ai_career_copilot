import { Router } from 'express';
import { createJob, getJobs, updateJobStatus, updateJob, deleteJob } from '../controllers/jobApplicationController';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { jobApplicationSchema, updateJobStatusSchema } from '../validators/jobApplicationValidator';

const router = Router();

router.route('/')
  .post(protect, validate(jobApplicationSchema), createJob)
  .get(protect, getJobs);

router.route('/:id')
  .put(protect, validate(jobApplicationSchema), updateJob)
  .delete(protect, deleteJob);

router.put('/:id/status', protect, validate(updateJobStatusSchema), updateJobStatus);

export default router;
