import { z } from 'zod';

export const startInterviewSchema = z.object({
  body: z.object({
    domain: z.string().min(2, 'Domain is required'),
    type: z.enum(['technical', 'hr', 'coding']),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    totalQuestions: z.number().min(1).max(20).optional(),
  }),
});

export const submitAnswerSchema = z.object({
  body: z.object({
    answer: z.string().min(2, 'Answer must not be empty'),
  }),
});
