// src/templates/application/use-cases/GetTemplateUseCase.ts
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateNotFoundException, TemplateAccessDeniedException } from '../../domain/exceptions/TemplateExceptions';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';
import { TemplateMapper } from '../mappers/TemplateMapper';

export class GetTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(templateId: string, userId: string): Promise<TemplateResponseDto> {
    // ✅ Usar el nuevo método con información del creador
    const templateWithCreator = await this.templateRepository.findByIdWithCreator(templateId);
    
    if (!templateWithCreator) {
      throw new TemplateNotFoundException(templateId);
    }

    // Verificar acceso (público O creador)
    if (!templateWithCreator.template.canBeUsedBy(userId)) {
      throw new TemplateAccessDeniedException(userId, templateId);
    }

    // ✅ Usar el mapper
    return TemplateMapper.toResponseDtoFromTemplateWithCreator(templateWithCreator);
  }
}