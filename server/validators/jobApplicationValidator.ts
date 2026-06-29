import { z } from 'zod';

export const jobApplicationSchema = z.object({
  body: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    status: z.enum(['Applied', 'OA', 'Interview', 'Offer', 'Rejected']).optional(),
    appliedDate: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateJobStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Applied', 'OA', 'Interview', 'Offer', 'Rejected'], {
      message: 'Invalid status'
    }),
  }),
});
