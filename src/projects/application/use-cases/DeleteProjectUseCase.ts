import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import {
  ProjectNotFoundException,
  InsufficientPermissionsException,
} from '../../domain/exceptions/ProjectExceptions';

export class DeleteProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository
  ) {}

  async execute(projectId: string, userId: string): Promise<void> {
    // Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    // Verificar que el usuario tiene permisos (debe ser ADMIN del proyecto)
    const member = await this.projectMemberRepository.findByProjectAndUser(projectId, userId);
    if (!member || !member.isAdmin()) {
      throw new InsufficientPermissionsException('delete this project');
    }

    // Eliminar proyecto (Prisma eliminará automáticamente los miembros por CASCADE)
    await this.projectRepository.delete(projectId);
  }
}
