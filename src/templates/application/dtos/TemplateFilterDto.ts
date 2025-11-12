// src/templates/application/dtos/TemplateFilterDto.ts

import { z } from 'zod';
import { TemplateComplexity } from '../../domain/value-objects/TemplateEnums';

export const TemplateFilterSchema = z.object({
    category: z.string().optional(),
    industry: z.string().optional(),
    complexity: z.enum(Object.values(TemplateComplexity) as [string, ...string[]]).optional(),
    isPublic: z.boolean().optional(),
    minRating: z.number().min(0).max(5).optional(),
    // 🆕 Agregar para búsquedas
    search: z.string().optional(), // Búsqueda por nombre/descripción
    userId: z.string().optional(), // Filtrar por creador
});

export type TemplateFilterDto = z.infer<typeof TemplateFilterSchema>;