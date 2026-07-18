import { z } from 'zod';

export const compareResumesSchema = z.object({
  body: z.object({
    resumeId1: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Resume ID'),
    resumeId2: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Resume ID'),
  }),
});
