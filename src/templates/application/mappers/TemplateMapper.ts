// src/templates/application/mappers/TemplateMapper.ts
import { Template } from '../../domain/entities/Template';
import { TemplateResponseDto } from '../dtos/TemplateResponseDto';
import { TemplateWithCreator } from '../../domain/repositories/ITemplateRepository';

export class TemplateMapper {
  static toResponseDto(template: Template, creatorEmail: string, creatorName: string): TemplateResponseDto {
    return {
      id: template.getId(),
      name: template.getName(),
      description: template.getDescription(),
      category: template.getCategory(),
      industry: template.getIndustry(),
      complexity: template.getComplexity(),
      content: template.getContent(),
      isPublic: template.isPublicTemplate(),
      usageCount: template.getUsageCount(),
      rating: template.getRating(),
      createdById: template.getCreatedById(),
      createdByEmail: creatorEmail,
      createdByName: creatorName,
      createdAt: template.getCreatedAt(),
      updatedAt: template.getUpdatedAt(),
    };
  }

  static toResponseDtoFromTemplateWithCreator(templateWithCreator: TemplateWithCreator): TemplateResponseDto {
    return this.toResponseDto(
      templateWithCreator.template,
      templateWithCreator.creator.email,
      templateWithCreator.creator.name
    );
  }

  static toResponseDtoList(templatesWithCreator: TemplateWithCreator[]): TemplateResponseDto[] {
    return templatesWithCreator.map(twc => this.toResponseDtoFromTemplateWithCreator(twc));
  }
}