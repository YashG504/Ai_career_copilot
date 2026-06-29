import { z } from 'zod';

export const generateCoverLetterSchema = z.object({
  body: z.object({
    resumeId: z.string().min(1, 'Resume ID is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    companyName: z.string().min(1, 'Company name is required'),
    jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  }),
});
