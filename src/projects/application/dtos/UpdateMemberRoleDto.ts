import { z } from 'zod';

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'READER']),
});

export type UpdateMemberRoleDto = z.infer<typeof UpdateMemberRoleSchema>;
