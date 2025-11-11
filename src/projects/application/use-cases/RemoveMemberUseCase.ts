import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import {
  ProjectNotFoundException,
  InsufficientPermissionsException,
  UserNotMemberException,
} from '../../domain/exceptions/ProjectExceptions';

export class RemoveMemberUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository
  ) {}

  async execute(projectId: string, memberId: string, requestUserId: string): Promise<void> {
    // Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    // Verificar que el usuario que hace la petición es ADMIN
    const requesterMember = await this.projectMemberRepository.findByProjectAndUser(
      projectId,
      requestUserId
    );

    if (!requesterMember || !requesterMember.isAdmin()) {
      throw new InsufficientPermissionsException('remove members from this project');
    }

    // Verificar que el miembro a eliminar existe
    const memberToRemove = await this.projectMemberRepository.findById(memberId);
    if (!memberToRemove || memberToRemove.getProjectId() !== projectId) {
      throw new UserNotMemberException(memberId, projectId);
    }

    // No permitir que un admin se elimine a sí mismo si es el único admin
    if (memberToRemove.getUserId() === requestUserId && memberToRemove.isAdmin()) {
      const allMembers = await this.projectMemberRepository.findByProject(projectId);
      const adminCount = allMembers.filter((m) => m.isAdmin()).length;

      if (adminCount === 1) {
        throw new Error('Cannot remove the last admin from the project. Delete the project instead.');
      }
    }

    // Eliminar miembro
    await this.projectMemberRepository.delete(memberId);
  }
}
