import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  completeName: z.string().min(1, 'Complete name is required').max(255, 'Name is too long'),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;
