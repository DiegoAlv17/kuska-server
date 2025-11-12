// src/templates/application/use-cases/CreateTemplateUseCase.ts
import { v4 as uuidv4 } from 'uuid';
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { Template } from '../../domain/entities/Template';
import { TemplateComplexity, TemplateCategory, TemplateIndustry } from '../../domain/value-objects/TemplateEnums';
import { TemplateType } from '../../domain/value-objects/TemplateTypes';
import { CreateTemplateDto } from '../dtos/CreateTemplateDto';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';
import { TemplateMapper } from '../mappers/TemplateMapper';
import { generateTemplateContent } from '../helpers/templateContentHelper';

export class CreateTemplateUseCase {
  constructor(private readonly templateRepository: ITemplateRepository) {}

  async execute(dto: CreateTemplateDto, userId: string): Promise<TemplateResponseDto> {
    // ✅ Generar contenido estructurado según el tipo de template
    const structuredContent = generateTemplateContent(dto.templateType as TemplateType);

    const template = new Template({
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      category: dto.category as TemplateCategory | undefined,
      industry: dto.industry as TemplateIndustry | undefined,
      complexity: dto.complexity as TemplateComplexity,
      templateType: dto.templateType as TemplateType, // ✅ NUEVO CAMPO
      content: structuredContent, // ✅ Contenido estructurado generado
      isPublic: dto.isPublic,
      usageCount: 0,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const templateWithCreator = await this.templateRepository.createWithCreator(template);
    
    return TemplateMapper.toResponseDtoFromTemplateWithCreator(templateWithCreator);
  }
}