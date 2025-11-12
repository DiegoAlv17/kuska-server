// src/templates/application/use-cases/DeleteTemplateUseCase.ts
// Este use case NO necesita corrección porque no retorna datos
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateNotFoundException, InsufficientPermissionsException } from '../../domain/exceptions/TemplateExceptions';

export class DeleteTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(templateId: string, userId: string): Promise<void> {
    const template = await this.templateRepository.findById(templateId);
    if (!template) {
      throw new TemplateNotFoundException(templateId);
    }

    if (!template.isCreator(userId)) {
      throw new InsufficientPermissionsException('delete this template');
    }

    await this.templateRepository.delete(templateId);
  }
}