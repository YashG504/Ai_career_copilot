import { z } from 'zod';

export const analyzeSkillGapSchema = z.object({
  body: z.object({
    jobDescription: z.string().min(10, 'Job description must be at least 10 characters'),
    jobTitle: z.string().optional(),
    resumeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Resume ID').optional(),
  }),
});
