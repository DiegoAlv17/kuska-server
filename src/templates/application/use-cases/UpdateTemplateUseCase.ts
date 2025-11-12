// src/templates/application/use-cases/UpdateTemplateUseCase.ts
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { TemplateNotFoundException, InsufficientPermissionsException } from '../../domain/exceptions/TemplateExceptions';
import { UpdateTemplateDto } from '../dtos/UpdateTemplateDto';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';
import { TemplateMapper } from '../mappers/TemplateMapper';

export class UpdateTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(templateId: string, dto: UpdateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    // Buscar template (método básico para validación)
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
    if (dto.content) template.updateContent(dto.content as any);
    if (dto.isPublic !== undefined) {
      dto.isPublic ? template.makePublic() : template.makePrivate();
    }

    // Guardar cambios
    await this.templateRepository.update(template);

    // ✅ Obtener información actualizada con creador
    const updatedTemplateWithCreator = await this.templateRepository.findByIdWithCreator(templateId);
    
    if (!updatedTemplateWithCreator) {
      throw new TemplateNotFoundException(templateId);
    }

    // ✅ Usar el mapper
    return TemplateMapper.toResponseDtoFromTemplateWithCreator(updatedTemplateWithCreator);
  }
}