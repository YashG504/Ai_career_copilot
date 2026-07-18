import { Router } from 'express';
import {
  uploadResumeFile,
  getResumes,
  getResume,
  deleteResume,
  analyzeResume,
  compareResumes,
  downloadResume,
} from '../controllers/resumeController';
import { protect } from '../middlewares/auth';
import { uploadResume } from '../middlewares/upload';
import { validate } from '../middlewares/validate';
import { compareResumesSchema } from '../validators/resumeValidator';

const router = Router();

router.post('/upload', protect, uploadResume.single('resume'), uploadResumeFile);
router.get('/', protect, getResumes);
router.get('/:id', protect, getResume);
router.get('/:id/download', protect, downloadResume);
router.delete('/:id', protect, deleteResume);
router.post('/:id/analyze', protect, analyzeResume);
router.post('/compare', protect, validate(compareResumesSchema), compareResumes);

export default router;
