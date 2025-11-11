import { z } from 'zod';

export const AddProjectMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  role: z.enum(['ADMIN', 'MEMBER', 'READER']).default('MEMBER'),
});

export type AddProjectMemberDto = z.infer<typeof AddProjectMemberSchema>;
