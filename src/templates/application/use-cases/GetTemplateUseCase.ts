// src/templates/application/use-cases/GetTemplateUseCase.ts

import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateNotFoundException, TemplateAccessDeniedException } from '../../domain/exceptions/TemplateExceptions';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';

export class GetTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(templateId: string, userId: string): Promise<TemplateResponseDto> {
    // Buscar template
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new TemplateNotFoundException(templateId);
    }

    // Verificar acceso (público O creador)
    if (!template.canBeUsedBy(userId)) {
      throw new TemplateAccessDeniedException(userId, templateId);
    }

    // Obtener información completa
    const prisma = require('../../../auth/infrastructure/persistence/PrismaClient').prisma;
    const templateData = await prisma.template.findUnique({
      where: { id: templateId },
      include: { createdBy: true },
    });

    return {
      id: templateData.id,
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      industry: templateData.industry,
      complexity: templateData.complexity,
      content: templateData.content,
      isPublic: templateData.isPublic,
      usageCount: templateData.usageCount,
      rating: templateData.rating ? parseFloat(templateData.rating) : undefined,
      createdById: templateData.createdById,
      createdByEmail: templateData.createdBy.email,
      createdByName: templateData.createdBy.completeName,
      createdAt: templateData.createdAt,
      updatedAt: templateData.updatedAt,
    };
  }
}