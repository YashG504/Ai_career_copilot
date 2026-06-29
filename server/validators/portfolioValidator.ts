import { z } from 'zod';

export const analyzePortfolioSchema = z.object({
  body: z.object({
    githubUsername: z.string().min(1, 'GitHub username is required').max(100, 'Username too long'),
  }),
});
