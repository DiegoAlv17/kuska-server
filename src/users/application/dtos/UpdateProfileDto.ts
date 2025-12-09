import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  jobTitle: z.string()
    .max(100, 'Job title must be at most 100 characters')
    .optional(),
  location: z.string()
    .max(200, 'Location must be at most 200 characters')
    .optional(),
  organization: z.string()
    .max(200, 'Organization must be at most 200 characters')
    .optional(),
  phone: z.string()
    .regex(/^\+\d+$/, 'Phone must start with + followed by country code and number')
    .min(8, 'Phone must be at least 8 characters')
    .max(20, 'Phone must be at most 20 characters')
    .optional()
    .or(z.literal('')),
  avatar: z.string()
    .url('Avatar must be a valid URL')
    .max(500, 'Avatar URL is too long')
    .optional()
    .or(z.literal('')),
});

export type UpdateProfileDto = z.infer<typeof UpdateProfileSchema>;
