import { v4 as uuidv4 } from 'uuid';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { Project } from '../../domain/entities/Project';
import { ProjectMember } from '../../domain/entities/ProjectMember';
import { ProjectCode } from '../../domain/value-objects/ProjectCode';
import { ProjectStatus, ProjectStatusVO } from '../../domain/value-objects/ProjectStatus';
import { ProjectRole, TemplateType } from '../../domain/value-objects/ProjectEnums';
import { ProjectCodeAlreadyExistsException } from '../../domain/exceptions/ProjectExceptions';
import { CreateProjectDto } from '../dtos/CreateProjectDto';
import { ProjectResponseDto } from '../dtos/ProjectResponseDto';

export class CreateProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository
  ) {}

  async execute(dto: CreateProjectDto, userId: string): Promise<ProjectResponseDto> {
    // Verificar que el código no exista
    const existingProject = await this.projectRepository.findByCode(dto.code);
    if (existingProject) {
      throw new ProjectCodeAlreadyExistsException(dto.code);
    }

    // Crear el proyecto
    const projectId = uuidv4();
    const project = new Project({
      id: projectId,
      name: dto.name,
      description: dto.description,
      code: new ProjectCode(dto.code),
      status: new ProjectStatusVO(ProjectStatus.ACTIVE),
      type: dto.type as TemplateType,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedProject = await this.projectRepository.create(project);

    // Agregar al creador como ADMIN del proyecto automáticamente
    const adminMember = new ProjectMember({
      id: uuidv4(),
      projectId: savedProject.getId(),
      userId: userId,
      role: ProjectRole.ADMIN,
      addedAt: new Date(),
    });

    await this.projectMemberRepository.create(adminMember);

    // Obtener el proyecto completo con miembros para respuesta
    const projectWithMembers = await this.getProjectWithMembers(savedProject.getId());

    return projectWithMembers;
  }

  private async getProjectWithMembers(projectId: string): Promise<ProjectResponseDto> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error('Project not found after creation');
    }

    const members = await this.projectMemberRepository.findByProject(projectId);

    // Obtener información de usuarios (esto se debe hacer con el userRepository, simplificado aquí)
    const prisma = require('../../../auth/infrastructure/persistence/PrismaClient').prisma;
    const projectData = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        createdBy: true,
        members: {
          include: {
            user: true,
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
