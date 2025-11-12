// src/templates/application/use-cases/ListTemplatesUseCase.ts
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';
import { TemplateMapper } from '../mappers/TemplateMapper';

export class ListTemplatesUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(userId: string, includePublic: boolean = true): Promise<TemplateResponseDto[]> {
    // ✅ Usar el nuevo método con información del creador
    const templatesWithCreator = await this.templateRepository.findTemplatesWithCreator({
      userId,
      includePublic,
    });

    // ✅ Usar el mapper
    return TemplateMapper.toResponseDtoList(templatesWithCreator);
  }
}