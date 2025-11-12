// src/templates/application/use-cases/UpdateTemplateUseCase.ts

import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateNotFoundException, InsufficientPermissionsException } from '../../domain/exceptions/TemplateExceptions';
import { UpdateTemplateDto } from '../dtos/UpdateTemplateDto';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';

export class UpdateTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(templateId: string, dto: UpdateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    // Buscar template
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new TemplateNotFoundException(templateId);
    }

    // Verificar permisos (solo creador)
    if (!template.isCreator(userId)) {
      throw new InsufficientPermissionsException('update this template');
    }

    // Actualizar campos
    if (dto.name) template.updateName(dto.name);
    if (dto.description !== undefined) template.updateDescription(dto.description);
    if (dto.content) template.updateContent(dto.content);
    if (dto.isPublic !== undefined) {
      dto.isPublic ? template.makePublic() : template.makePrivate();
    }

    // Guardar cambios
    await this.templateRepository.update(template);

    // Retornar información completa
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