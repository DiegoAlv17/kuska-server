// src/templates/infrastructure/repositories/PrismaTemplateRepository.ts

import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { ITemplateRepository } from '../../domain/repositories/ITemplateRepository';
import { Template } from '../../domain/entities/Template';
import { TemplateComplexity } from '../../domain/value-objects/TemplateEnums';

export class PrismaTemplateRepository implements ITemplateRepository {
  async create(template: Template): Promise<Template> {
    const prismaTemplate = await prisma.template.create({
      data: {
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
        createdAt: template.getCreatedAt(),
        updatedAt: template.getUpdatedAt(),
      },
    });

    return this.toDomain(prismaTemplate);
  }

  async findById(id: string): Promise<Template | null> {
    const prismaTemplate = await prisma.template.findUnique({
      where: { id },
    });

    return prismaTemplate ? this.toDomain(prismaTemplate) : null;
  }

  async findByUserId(userId: string): Promise<Template[]> {
    const prismaTemplates = await prisma.template.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });

    return prismaTemplates.map((t) => this.toDomain(t));
  }

  async findPublicTemplates(): Promise<Template[]> {
    const prismaTemplates = await prisma.template.findMany({
      where: { isPublic: true },
      orderBy: [
        { usageCount: 'desc' },
        { rating: 'desc' },
      ],
    });

    return prismaTemplates.map((t) => this.toDomain(t));
  }

  async findByCategory(category: string): Promise<Template[]> {
    const prismaTemplates = await prisma.template.findMany({
      where: {
        category,
        isPublic: true,
      },
      orderBy: { usageCount: 'desc' },
    });

    return prismaTemplates.map((t) => this.toDomain(t));
  }

  async findAll(): Promise<Template[]> {
    const prismaTemplates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaTemplates.map((t) => this.toDomain(t));
  }

  async update(template: Template): Promise<Template> {
    const prismaTemplate = await prisma.template.update({
      where: { id: template.getId() },
      data: {
        name: template.getName(),
        description: template.getDescription(),
        category: template.getCategory(),
        industry: template.getIndustry(),
        complexity: template.getComplexity(),
        content: template.getContent(),
        isPublic: template.isPublicTemplate(),
        rating: template.getRating(),
        updatedAt: template.getUpdatedAt(),
      },
    });

    return this.toDomain(prismaTemplate);
  }

  async delete(id: string): Promise<void> {
    await prisma.template.delete({
      where: { id },
    });
  }

  async incrementUsageCount(id: string): Promise<void> {
    await prisma.template.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1,
        },
      },
    });
  }

  private toDomain(prismaTemplate: any): Template {
    return new Template({
      id: prismaTemplate.id,
      name: prismaTemplate.name,
      description: prismaTemplate.description,
      category: prismaTemplate.category,
      industry: prismaTemplate.industry,
      complexity: prismaTemplate.complexity as TemplateComplexity,
      content: prismaTemplate.content as Record<string, any>,
      isPublic: prismaTemplate.isPublic,
      usageCount: prismaTemplate.usageCount,
      rating: prismaTemplate.rating ? parseFloat(prismaTemplate.rating.toString()) : undefined,
      createdById: prismaTemplate.createdById,
      createdAt: prismaTemplate.createdAt,
      updatedAt: prismaTemplate.updatedAt,
    });
  }
}