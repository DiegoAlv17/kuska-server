import { PrismaClient } from '@prisma/client';
import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { IProjectRepository, ProjectWithStats } from '../../domain/repositories/IProjectRepository';
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
        templateId: project.getTemplateId() ?? null,
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
        // allow updating templateId if present on the domain object
        templateId: project.getTemplateId() ?? undefined,
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

  async findRecentWithStats(userId: string, limit: number, offset: number): Promise<{
    projects: ProjectWithStats[];
    total: number;
  }> {
    const whereClause = {
      OR: [
        { createdById: userId },
        { members: { some: { userId } } }
      ]
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: whereClause,
        include: {
          tareas: {
            where: { deletedAt: null },
            select: {
              id: true,
              status: true,
              updatedAt: true
            }
          },
          members: {
            select: { id: true }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.project.count({ where: whereClause })
    ]);

    return {
      projects: projects.map((p) => {
        const tasks = p.tareas;
        const total = tasks.length;
        const completed = tasks.filter(t => t.status === 'done').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const todo = tasks.filter(t => t.status === 'todo' || t.status === 'backlog').length;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        const lastActivity = tasks.length > 0
          ? tasks.reduce((latest, task) =>
              task.updatedAt > latest ? task.updatedAt : latest,
              tasks[0].updatedAt
            )
          : null;

        return {
          project: this.toDomain(p),
          taskStats: {
            total,
            completed,
            inProgress,
            todo
          },
          progress,
          memberCount: p.members.length,
          lastActivity
        };
      }),
      total
    };
  }

  private toDomain(prismaProject: any): Project {
    return new Project({
      id: prismaProject.id,
      name: prismaProject.name,
      description: prismaProject.description,
      code: new ProjectCode(prismaProject.code),
      status: new ProjectStatusVO(prismaProject.status as ProjectStatus),
      type: prismaProject.type as TemplateType,
      templateId: prismaProject.templateId ?? null,
      createdById: prismaProject.createdById,
      createdAt: prismaProject.createdAt,
      updatedAt: prismaProject.updatedAt,
    });
  }
}
