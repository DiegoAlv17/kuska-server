// src/templates/application/dtos/CreateTemplateDto.ts
import { z } from 'zod';
import { TemplateComplexity, TemplateCategory, TemplateIndustry } from '../../domain/value-objects/TemplateEnums';
import { TemplateType } from '../../domain/value-objects/TemplateTypes';

export const CreateTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required').max(255, 'Name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  category: z.enum(Object.values(TemplateCategory) as [string, ...string[]]).optional(),
  industry: z.enum(Object.values(TemplateIndustry) as [string, ...string[]]).optional(),
  complexity: z.enum(Object.values(TemplateComplexity) as [string, ...string[]]).default(TemplateComplexity.MEDIUM),
  templateType: z.enum(Object.values(TemplateType) as [string, ...string[]]).default(TemplateType.SIMPLE), // ✅ NUEVO CAMPO
  content: z.record(z.string(), z.any()), // Mantenemos flexible para validación inicial
  isPublic: z.boolean().default(false),
});

export type CreateTemplateDto = z.infer<typeof CreateTemplateSchema>;