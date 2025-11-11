import { v4 as uuidv4 } from 'uuid';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { IUserRepository } from '../../../auth/domain/repositories/IUserRepository';
import { ProjectMember } from '../../domain/entities/ProjectMember';
import { ProjectRole } from '../../domain/value-objects/ProjectEnums';
import {
  ProjectNotFoundException,
  MemberAlreadyExistsException,
  InsufficientPermissionsException,
} from '../../domain/exceptions/ProjectExceptions';
import { UserAlreadyExistsException } from '../../../auth/domain/exceptions/UserAlreadyExistsException';
import { AddProjectMemberDto } from '../dtos/AddProjectMemberDto';
import { ProjectMemberResponseDto } from '../dtos/ProjectResponseDto';

export class AddProjectMemberUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(
    projectId: string,
    dto: AddProjectMemberDto,
    requestUserId: string
  ): Promise<ProjectMemberResponseDto> {
    // Verificar que el proyecto existe
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundException(projectId);
    }

    // Verificar que el usuario que hace la petición es miembro con permisos de ADMIN
    const requesterMember = await this.projectMemberRepository.findByProjectAndUser(
      projectId,
      requestUserId
    );

    if (!requesterMember || !requesterMember.isAdmin()) {
      throw new InsufficientPermissionsException('add members to this project');
    }

    // Buscar el usuario a agregar por email
    const userToAdd = await this.userRepository.findByEmail(dto.email);
    if (!userToAdd) {
      throw new Error(`User with email ${dto.email} not found`);
    }

    // Verificar que el usuario no sea ya miembro
    const existingMember = await this.projectMemberRepository.findByProjectAndUser(
      projectId,
      userToAdd.getId()
    );

    if (existingMember) {
      throw new MemberAlreadyExistsException(dto.email, projectId);
    }

    // Crear el miembro
    const member = new ProjectMember({
      id: uuidv4(),
      projectId: projectId,
      userId: userToAdd.getId(),
      role: dto.role as ProjectRole,
      addedAt: new Date(),
    });

    await this.projectMemberRepository.create(member);

    // Retornar respuesta con información del usuario
    return {
      id: member.getId(),
      userId: member.getUserId(),
      userEmail: userToAdd.getEmail().getValue(),
      userCompleteName: userToAdd.getCompleteName(),
      role: member.getRole(),
      addedAt: member.getAddedAt(),
    };
  }
}
