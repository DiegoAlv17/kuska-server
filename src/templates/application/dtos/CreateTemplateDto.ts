// src/templates/application/dtos/CreateTemplateDto.ts

import { z } from 'zod';
import { TemplateComplexity } from '../../domain/value-objects/TemplateEnums';

export const CreateTemplateSchema = z.object({
    name: z.string().min(1, 'Template name is required').max(255, 'Name is too long'),
    description: z.string().max(1000, 'Description is too long').optional(),
    category: z.string().max(100).optional(),
    industry: z.string().max(100).optional(),
    complexity: z.enum(Object.values(TemplateComplexity) as [string, ...string[]]).default(TemplateComplexity.MEDIUM),
    content: z.record(z.string(), z.any()), // JSON structure
    isPublic: z.boolean().default(false),
});

export type CreateTemplateDto = z.infer<typeof CreateTemplateSchema>;