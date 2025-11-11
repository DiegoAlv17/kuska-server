import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { ProjectStatus } from '../../domain/value-objects/ProjectStatus';
import {
  ProjectNotFoundException,
  InsufficientPermissionsException,
} from '../../domain/exceptions/ProjectExceptions';
import { UpdateProjectDto } from '../dtos/UpdateProjectDto';
import { ProjectResponseDto } from '../dtos/ProjectResponseDto';

export class UpdateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository
  ) {}

  async execute(
    projectId: string,
    dto: UpdateProjectDto,
    userId: string
  ): Promise<ProjectResponseDto> {
    // Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    // Verificar que el usuario tiene permisos (debe ser ADMIN del proyecto)
    const member = await this.projectMemberRepository.findByProjectAndUser(projectId, userId);
    if (!member || !member.isAdmin()) {
      throw new InsufficientPermissionsException('update this project');
    }

    // Actualizar campos
    if (dto.name) {
      project.updateName(dto.name);
    }

    if (dto.description !== undefined) {
      project.updateDescription(dto.description);
    }

    if (dto.status) {
      project.changeStatus(dto.status as ProjectStatus);
    }

    // Guardar cambios
    await this.projectRepository.update(project);

    // Obtener proyecto actualizado con toda la información
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
