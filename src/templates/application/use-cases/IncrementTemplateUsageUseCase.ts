// src/templates/application/use-cases/IncrementTemplateUsageUseCase.ts

import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateNotFoundException, TemplateAccessDeniedException } from '../../domain/exceptions/TemplateExceptions';

export class IncrementTemplateUsageUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(templateId: string, userId: string): Promise<void> {
    const template = await this.templateRepository.findById(templateId);
    
    if (!template) {
      throw new TemplateNotFoundException(templateId);
    }

    // Verificar que el usuario puede usar este template (público o creador)
    if (!template.canBeUsedBy(userId)) {
      throw new TemplateAccessDeniedException(userId, templateId);
    }

    // Incrementar el contador de uso
    await this.templateRepository.incrementUsageCount(templateId);
  }
}