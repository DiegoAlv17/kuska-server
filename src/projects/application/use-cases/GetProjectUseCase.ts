import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { ProjectNotFoundException, UserNotMemberException } from '../../domain/exceptions/ProjectExceptions';
import { ProjectResponseDto } from '../dtos/ProjectResponseDto';

export class GetProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository
  ) {}

  async execute(projectId: string, userId: string): Promise<ProjectResponseDto> {
    // Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    // Verificar que el usuario es miembro del proyecto o es el creador
    const isMember = await this.projectMemberRepository.findByProjectAndUser(projectId, userId);
    const isCreator = project.getCreatedById() === userId;

    if (!isMember && !isCreator) {
      throw new UserNotMemberException(userId, projectId);
    }

    // Obtener información completa con Prisma (incluye datos de usuarios)
    const prisma = require('../../../auth/infrastructure/persistence/PrismaClient').prisma;
    const projectData = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true,
          },
          orderBy: {
            addedAt: 'asc',
          },
        },
      },
    });

    return {
      id: project.getId(),
      name: project.getName(),
      description: project.getDescription(),
      code: project.getCode().getValue(),
      status: project.getStatus().getValue(),
      type: project.getType(),
      createdById: project.getCreatedById(),
      createdByEmail: projectData.createdBy.email,
      createdByName: projectData.createdBy.completeName,
      members: projectData.members.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        userEmail: m.user.email,
        userCompleteName: m.user.completeName,
        role: m.role,
        addedAt: m.addedAt,
      })),
      createdAt: project.getCreatedAt(),
      updatedAt: project.getUpdatedAt(),
    };
  }
}
