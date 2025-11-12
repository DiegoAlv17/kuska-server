// src/templates/application/dtos/UpdateTemplateDto.ts
import { z } from 'zod';
import { TemplateComplexity } from '../../domain/value-objects/TemplateEnums';

export const UpdateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  complexity: z.enum(Object.values(TemplateComplexity) as [string, ...string[]]).optional(),
  content: z.record(z.string(), z.any()).optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateTemplateDto = z.infer<typeof UpdateTemplateSchema>;