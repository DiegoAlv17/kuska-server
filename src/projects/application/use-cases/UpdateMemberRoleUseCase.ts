import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { ProjectRole } from '../../domain/value-objects/ProjectEnums';
import {
  ProjectNotFoundException,
  InsufficientPermissionsException,
  UserNotMemberException,
} from '../../domain/exceptions/ProjectExceptions';
import { UpdateMemberRoleDto } from '../dtos/UpdateMemberRoleDto';
import { ProjectMemberResponseDto } from '../dtos/ProjectResponseDto';

export class UpdateMemberRoleUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository
  ) {}

  async execute(
    projectId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
    requestUserId: string
  ): Promise<ProjectMemberResponseDto> {
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
      throw new InsufficientPermissionsException('change member roles in this project');
    }

    // Verificar que el miembro a actualizar existe
    const memberToUpdate = await this.projectMemberRepository.findById(memberId);
    if (!memberToUpdate || memberToUpdate.getProjectId() !== projectId) {
      throw new UserNotMemberException(memberId, projectId);
    }

    // No permitir que un admin se quite a sí mismo el rol de admin si es el único admin
    if (
      memberToUpdate.getUserId() === requestUserId &&
      memberToUpdate.isAdmin() &&
      dto.role !== 'ADMIN'
    ) {
      const allMembers = await this.projectMemberRepository.findByProject(projectId);
      const adminCount = allMembers.filter((m) => m.isAdmin()).length;

      if (adminCount === 1) {
        throw new Error('Cannot remove the last admin from the project');
      }
    }

    // Cambiar rol
    memberToUpdate.changeRole(dto.role as ProjectRole);
    await this.projectMemberRepository.update(memberToUpdate);

    // Obtener información completa del miembro
    const prisma = require('../../../auth/infrastructure/persistence/PrismaClient').prisma;
    const memberData = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: {
        user: true,
      },
    });

    return {
      id: memberToUpdate.getId(),
      userId: memberToUpdate.getUserId(),
      userEmail: memberData.user.email,
      userCompleteName: memberData.user.completeName,
      role: memberToUpdate.getRole(),
      addedAt: memberToUpdate.getAddedAt(),
    };
  }
}
