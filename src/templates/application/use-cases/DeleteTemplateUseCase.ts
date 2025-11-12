// src/templates/application/use-cases/DeleteTemplateUseCase.ts

import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateNotFoundException, InsufficientPermissionsException } from '../../domain/exceptions/TemplateExceptions';

export class DeleteTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(templateId: string, userId: string): Promise<void> {
    // Buscar template
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new TemplateNotFoundException(templateId);
    }

    // Verificar permisos (solo creador)
    if (!template.isCreator(userId)) {
      throw new InsufficientPermissionsException('delete this template');
    }

    // Eliminar
    await this.templateRepository.delete(templateId);
  }
}