
// src/templates/application/use-cases/ListTemplatesUseCase.ts

import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';

export class ListTemplatesUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(userId: string, includePublic: boolean = true): Promise<TemplateResponseDto[]> {
    const prisma = require('../../../auth/infrastructure/persistence/PrismaClient').prisma;

    // Obtener templates del usuario Y públicos
    const templates = await prisma.template.findMany({
      where: includePublic
        ? {
            OR: [
              { createdById: userId },
              { isPublic: true },
            ],
          }
        : { createdById: userId },
      include: { createdBy: true },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return templates.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      industry: t.industry,
      complexity: t.complexity,
      content: t.content,
      isPublic: t.isPublic,
      usageCount: t.usageCount,
      rating: t.rating ? parseFloat(t.rating) : undefined,
      createdById: t.createdById,
      createdByEmail: t.createdBy.email,
      createdByName: t.createdBy.completeName,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }
}
