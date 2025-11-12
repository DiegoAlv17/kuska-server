// src/templates/infrastructure/repositories/PrismaTemplateRepository.ts
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { ITemplateRepository, TemplateWithCreator } from '../../domain/repositories/ITemplateRepository';
import { Template } from '../../domain/entities/Template';
// ✅ Usar enums de Prisma Client directamente
import { TemplateComplexity, TemplateCategory, TemplateIndustry, TemplateType } from '@prisma/client';

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
        // Cast domain enums/json to Prisma compatible types
        templateType: template.getTemplateType() as unknown as TemplateType,
        content: template.getContent() as unknown as any,
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

  async findByCategory(category: TemplateCategory): Promise<Template[]> {
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
        templateType: template.getTemplateType() as unknown as TemplateType,
        content: template.getContent() as unknown as any,
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
    // Ensure JSON coming from DB is treated as domain TemplateContent
    const content = prismaTemplate.content as unknown as import('../../domain/value-objects/TemplateTypes').TemplateContent;

    // Backwards compatibility: if a stored SCRUM template misses dailyScrum, add a safe default
    if (prismaTemplate.templateType === 'SCRUM' && content?.type === 'SCRUM') {
      // ensure ceremonies.dailyScrum exists
      if (!content.ceremonies) content.ceremonies = {} as any;
      if (!content.ceremonies.dailyScrum) {
        content.ceremonies.dailyScrum = { durationMinutes: 15, description: 'Daily standup' } as any;
      }
    }

    return new Template({
      id: prismaTemplate.id,
      name: prismaTemplate.name,
      description: prismaTemplate.description,
      category: prismaTemplate.category,
      industry: prismaTemplate.industry,
      complexity: prismaTemplate.complexity,
      templateType: prismaTemplate.templateType as unknown as import('../../domain/value-objects/TemplateTypes').TemplateType,
      content,
      isPublic: prismaTemplate.isPublic,
      usageCount: prismaTemplate.usageCount,
      rating: prismaTemplate.rating ? parseFloat(prismaTemplate.rating.toString()) : undefined,
      createdById: prismaTemplate.createdById,
      createdAt: prismaTemplate.createdAt,
      updatedAt: prismaTemplate.updatedAt,
    });
  }

  // 🆕 MÉTODOS CON CREATOR
  async createWithCreator(template: Template): Promise<TemplateWithCreator> {
    console.log('Guardando template en BD:', template.getId());
    const prismaTemplate: any = await prisma.template.create({
      data: {
        id: template.getId(),
        name: template.getName(),
        description: template.getDescription(),
        category: template.getCategory(),
        industry: template.getIndustry(),
        complexity: template.getComplexity(),
        templateType: template.getTemplateType() as unknown as TemplateType,
        content: template.getContent() as unknown as any,
        isPublic: template.isPublicTemplate(),
        usageCount: template.getUsageCount(),
        rating: template.getRating(),
        createdById: template.getCreatedById(),
        createdAt: template.getCreatedAt(),
        updatedAt: template.getUpdatedAt(),
      },
      include: { createdBy: true },
    });
    console.log('Template guardado:', prismaTemplate.id);

    return {
      template: this.toDomain(prismaTemplate),
      creator: {
        email: (prismaTemplate.createdBy as any)?.email,
        name: (prismaTemplate.createdBy as any)?.completeName,
      }
    };
  }

  async findByIdWithCreator(id: string): Promise<TemplateWithCreator | null> {
    const prismaTemplate: any = await prisma.template.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!prismaTemplate) return null;

    return {
      template: this.toDomain(prismaTemplate),
      creator: {
        email: (prismaTemplate.createdBy as any)?.email,
        name: (prismaTemplate.createdBy as any)?.completeName,
      }
    };
  }

  async findUserTemplatesWithCreator(userId: string): Promise<TemplateWithCreator[]> {
    const prismaTemplates: any[] = await prisma.template.findMany({
      where: { createdById: userId },
      include: { createdBy: true },
      orderBy: { createdAt: 'desc' },
    });

    return prismaTemplates.map(t => ({
      template: this.toDomain(t),
      creator: {
        email: (t.createdBy as any)?.email,
        name: (t.createdBy as any)?.completeName,
      }
    }));
  }

  async findPublicTemplatesWithCreator(): Promise<TemplateWithCreator[]> {
    const prismaTemplates: any[] = await prisma.template.findMany({
      where: { isPublic: true },
      include: { createdBy: true },
      orderBy: [
        { usageCount: 'desc' },
        { rating: 'desc' },
      ],
    });

    return prismaTemplates.map(t => ({
      template: this.toDomain(t),
      creator: {
        email: (t.createdBy as any)?.email,
        name: (t.createdBy as any)?.completeName,
      }
    }));
  }

  async findTemplatesWithCreator(filters: {
    userId?: string;
    includePublic?: boolean;
  }): Promise<TemplateWithCreator[]> {
    const where = filters.includePublic
      ? {
        OR: [
          { createdById: filters.userId },
          { isPublic: true },
        ],
      }
      : { createdById: filters.userId };

    const prismaTemplates: any[] = await prisma.template.findMany({
      where,
      include: { createdBy: true },
      orderBy: [
        { usageCount: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return prismaTemplates.map(t => ({
      template: this.toDomain(t),
      creator: {
        email: (t.createdBy as any)?.email,
        name: (t.createdBy as any)?.completeName,
      }
    }));
  }
}