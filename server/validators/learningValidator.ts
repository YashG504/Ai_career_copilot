import { z } from 'zod';

export const generateLearningPathSchema = z.object({
  body: z.object({
    goal: z.string().min(5, 'Goal is too short'),
    currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    durationDays: z.number().min(1).max(100).optional(),
  }),
});

export const updateTaskStatusSchema = z.object({
  body: z.object({
    dayNumber: z.number().min(1),
    taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID'),
    isCompleted: z.boolean(),
  }),
});
