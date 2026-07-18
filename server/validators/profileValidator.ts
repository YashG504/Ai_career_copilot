import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
    role: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    github: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
    skills: z.array(z.string()).optional(),
    experience: z.array(
      z.object({
        title: z.string(),
        company: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string().optional(),
      })
    ).optional(),
    education: z.array(
      z.object({
        school: z.string(),
        degree: z.string(),
        fieldOfStudy: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    ).optional(),
  }),
});
