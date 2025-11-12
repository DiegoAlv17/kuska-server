// src/templates/application/dtos/UpdateTemplateDto.ts
import { z } from 'zod';
import { TemplateComplexity, TemplateCategory, TemplateIndustry } from '../../domain/value-objects/TemplateEnums';
import { TemplateType } from '../../domain/value-objects/TemplateTypes';

export const UpdateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255, 'Name is too long').optional(),
  description: z.string().max(1000, 'Description is too long').optional(),
  category: z.enum(Object.values(TemplateCategory) as [string, ...string[]]).optional(),
  industry: z.enum(Object.values(TemplateIndustry) as [string, ...string[]]).optional(),
  complexity: z.enum(Object.values(TemplateComplexity) as [string, ...string[]]).optional(),
  templateType: z.enum(Object.values(TemplateType) as [string, ...string[]]).optional(),
  content: z.record(z.string(), z.any()).optional(), // Mantener como Record para flexibilidad
  isPublic: z.boolean().optional(),
});

export type UpdateTemplateDto = z.infer<typeof UpdateTemplateSchema>;