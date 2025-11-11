import { PrismaClient } from '@prisma/client';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { Project } from '../../domain/entities/Project';
import { ProjectCode } from '../../domain/value-objects/ProjectCode';
import { ProjectStatus, ProjectStatusVO } from '../../domain/value-objects/ProjectStatus';
import { TemplateType } from '../../domain/value-objects/ProjectEnums';

export class PrismaProjectRepository implements IProjectRepository {
  async create(project: Project): Promise<Project> {
    const prismaProject = await prisma.project.create({
      data: {
        id: project.getId(),
        name: project.getName(),
        description: project.getDescription(),
        code: project.getCode().getValue(),
        status: project.getStatus().getValue(),
        type: project.getType(),
        createdById: project.getCreatedById(),
        createdAt: project.getCreatedAt(),
        updatedAt: project.getUpdatedAt(),
      },
      include: {
        createdBy: true,
      },
    });

    return this.toDomain(prismaProject);
  }

  async findById(id: string): Promise<Project | null> {
    const prismaProject = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: true,
      },
    });

    return prismaProject ? this.toDomain(prismaProject) : null;
  }

  async findByCode(code: string): Promise<Project | null> {
    const prismaProject = await prisma.project.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        createdBy: true,
      },
    });

    return prismaProject ? this.toDomain(prismaProject) : null;
  }

  async findByUserId(userId: string): Promise<Project[]> {
    // Encuentra proyectos donde el usuario es creador O es miembro
    const prismaProjects = await prisma.project.findMany({
      where: {
        OR: [
          { createdById: userId },
          {
            members: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prismaProjects.map((p) => this.toDomain(p));
  }

  async findAll(): Promise<Project[]> {
    const prismaProjects = await prisma.project.findMany({
      include: {
        createdBy: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return prismaProjects.map((p) => this.toDomain(p));
  }

  async update(project: Project): Promise<Project> {
    const prismaProject = await prisma.project.update({
      where: { id: project.getId() },
      data: {
        name: project.getName(),
        description: project.getDescription(),
        status: project.getStatus().getValue(),
        updatedAt: project.getUpdatedAt(),
      },
      include: {
        createdBy: true,
      },
    });

    return this.toDomain(prismaProject);
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({
      where: { id },
    });
  }

  private toDomain(prismaProject: any): Project {
    return new Project({
      id: prismaProject.id,
      name: prismaProject.name,
      description: prismaProject.description,
      code: new ProjectCode(prismaProject.code),
      status: new ProjectStatusVO(prismaProject.status as ProjectStatus),
      type: prismaProject.type as TemplateType,
      createdById: prismaProject.createdById,
      createdAt: prismaProject.createdAt,
      updatedAt: prismaProject.updatedAt,
    });
  }
}
