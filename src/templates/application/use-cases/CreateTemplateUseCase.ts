// src/templates/application/use-cases/CreateTemplateUseCase.ts

import { v4 as uuidv4 } from 'uuid';
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { Template } from '../../domain/entities/Template';
import { TemplateComplexity } from '../../domain/value-objects/TemplateEnums';
import { CreateTemplateDto } from '../dtos/CreateTemplateDto';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';

export class CreateTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(dto: CreateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    // Crear entidad de dominio
    const template = new Template({
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      category: dto.category,
      industry: dto.industry,
      complexity: dto.complexity as TemplateComplexity,
      content: dto.content,
      isPublic: dto.isPublic,
      usageCount: 0,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Guardar en BD
    const savedTemplate = await this.templateRepository.create(template);

    // Obtener información completa para respuesta
    return this.getTemplateWithUserInfo(savedTemplate.getId());
  }

  private async getTemplateWithUserInfo(templateId: string): Promise<TemplateResponseDto> {
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
