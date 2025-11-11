import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { ProjectResponseDto } from '../dtos/ProjectResponseDto';

export class ListUserProjectsUseCase {
  constructor(private readonly projectRepository: IProjectRepository) {}

  async execute(userId: string): Promise<ProjectResponseDto[]> {
    // Obtener proyectos donde el usuario es creador O miembro
    const projects = await this.projectRepository.findByUserId(userId);

    // Obtener información completa de cada proyecto con Prisma
    const prisma = require('../../../auth/infrastructure/persistence/PrismaClient').prisma;

    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        const projectData = await prisma.project.findUnique({
          where: { id: project.getId() },
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
      })
    );

    return projectsWithDetails;
  }
}
