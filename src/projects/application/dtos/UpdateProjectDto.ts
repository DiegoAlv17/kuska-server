import { z } from 'zod';

export const UpdateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Name is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED', 'ON_HOLD']).optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
