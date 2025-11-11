import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { ProjectMember } from '../../domain/entities/ProjectMember';
import { ProjectRole } from '../../domain/value-objects/ProjectEnums';

export class PrismaProjectMemberRepository implements IProjectMemberRepository {
  async create(member: ProjectMember): Promise<ProjectMember> {
    const prismaMember = await prisma.projectMember.create({
      data: {
        id: member.getId(),
        projectId: member.getProjectId(),
        userId: member.getUserId(),
        role: member.getRole(),
        addedAt: member.getAddedAt(),
      },
      include: {
        user: true,
        project: true,
      },
    });

    return this.toDomain(prismaMember);
  }

  async findById(id: string): Promise<ProjectMember | null> {
    const prismaMember = await prisma.projectMember.findUnique({
      where: { id },
      include: {
        user: true,
        project: true,
      },
    });

    return prismaMember ? this.toDomain(prismaMember) : null;
  }

  async findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null> {
    const prismaMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
      include: {
        user: true,
        project: true,
      },
    });

    return prismaMember ? this.toDomain(prismaMember) : null;
  }

  async findByProject(projectId: string): Promise<ProjectMember[]> {
    const prismaMembers = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: true,
      },
      orderBy: {
        addedAt: 'asc',
      },
    });

    return prismaMembers.map((m) => this.toDomain(m));
  }

  async findByUser(userId: string): Promise<ProjectMember[]> {
    const prismaMembers = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    return prismaMembers.map((m) => this.toDomain(m));
  }

  async update(member: ProjectMember): Promise<ProjectMember> {
    const prismaMember = await prisma.projectMember.update({
      where: { id: member.getId() },
      data: {
        role: member.getRole(),
      },
      include: {
        user: true,
        project: true,
      },
    });

    return this.toDomain(prismaMember);
  }

  async delete(id: string): Promise<void> {
    await prisma.projectMember.delete({
      where: { id },
    });
  }

  private toDomain(prismaMember: any): ProjectMember {
    return new ProjectMember({
      id: prismaMember.id,
      projectId: prismaMember.projectId,
      userId: prismaMember.userId,
      role: prismaMember.role as ProjectRole,
      addedAt: prismaMember.addedAt,
    });
  }
}
