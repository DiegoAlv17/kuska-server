import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(10, 'Code must be at most 10 characters')
    .regex(/^[A-Z0-9-]+$/, 'Code must contain only uppercase letters, numbers and hyphens')
    .transform((val) => val.toUpperCase()),
  type: z.enum(['SCRUM', 'KANBAN', 'SIMPLE']).default('SIMPLE'),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;
