import { Request, Response, NextFunction } from 'express';
import { CreateProjectSchema } from '../../application/dtos/CreateProjectDto';
import { AddProjectMemberSchema } from '../../application/dtos/AddProjectMemberDto';
import { UpdateProjectSchema } from '../../application/dtos/UpdateProjectDto';
import { UpdateMemberRoleSchema } from '../../application/dtos/UpdateMemberRoleDto';
import { CreateProjectUseCase } from '../../application/use-cases/CreateProjectUseCase';
import { CreateProjectFromTemplateUseCase } from '../../application/use-cases/CreateProjectFromTemplateUseCase'; // ✅ NUEVO
import { AddProjectMemberUseCase } from '../../application/use-cases/AddProjectMemberUseCase';
import { GetProjectUseCase } from '../../application/use-cases/GetProjectUseCase';
import { ListUserProjectsUseCase } from '../../application/use-cases/ListUserProjectsUseCase';
import { UpdateProjectUseCase } from '../../application/use-cases/UpdateProjectUseCase';
import { DeleteProjectUseCase } from '../../application/use-cases/DeleteProjectUseCase';
import { UpdateMemberRoleUseCase } from '../../application/use-cases/UpdateMemberRoleUseCase';
import { RemoveMemberUseCase } from '../../application/use-cases/RemoveMemberUseCase';
import { PrismaProjectRepository } from '../repositories/PrismaProjectRepository';
import { PrismaProjectMemberRepository } from '../repositories/PrismaProjectMemberRepository';
import { PrismaUserRepository } from '../../../auth/infrastructure/repositories/PrismaUserRepository';
import { PrismaTemplateRepository } from '../../../templates/infrastructure/repositories/PrismaTemplateRepository'; // ✅ NUEVO

export class ProjectController {
  private createProjectUseCase: CreateProjectUseCase;
  private createProjectFromTemplateUseCase: CreateProjectFromTemplateUseCase; // ✅ NUEVO
  private addProjectMemberUseCase: AddProjectMemberUseCase;
  private getProjectUseCase: GetProjectUseCase;
  private listUserProjectsUseCase: ListUserProjectsUseCase;
  private updateProjectUseCase: UpdateProjectUseCase;
  private deleteProjectUseCase: DeleteProjectUseCase;
  private updateMemberRoleUseCase: UpdateMemberRoleUseCase;
  private removeMemberUseCase: RemoveMemberUseCase;

  constructor() {
    const projectRepository = new PrismaProjectRepository();
    const projectMemberRepository = new PrismaProjectMemberRepository();
    const userRepository = new PrismaUserRepository();
  const templateRepository = new PrismaTemplateRepository(); // ✅ NUEVO

    this.createProjectUseCase = new CreateProjectUseCase(
      projectRepository,
      projectMemberRepository
    );

    // ✅ NUEVO: Use Case para crear proyecto desde template
    this.createProjectFromTemplateUseCase = new CreateProjectFromTemplateUseCase(
      projectRepository,
      projectMemberRepository,
      templateRepository
    );

    this.addProjectMemberUseCase = new AddProjectMemberUseCase(
      projectRepository,
      projectMemberRepository,
      userRepository
    );

    this.getProjectUseCase = new GetProjectUseCase(projectRepository, projectMemberRepository);

    this.listUserProjectsUseCase = new ListUserProjectsUseCase(projectRepository);

    this.updateProjectUseCase = new UpdateProjectUseCase(
      projectRepository,
      projectMemberRepository
    );

    this.deleteProjectUseCase = new DeleteProjectUseCase(
      projectRepository,
      projectMemberRepository
    );

    this.updateMemberRoleUseCase = new UpdateMemberRoleUseCase(
      projectRepository,
      projectMemberRepository
    );

    this.removeMemberUseCase = new RemoveMemberUseCase(
      projectRepository,
      projectMemberRepository
    );

    this.projectMemberRepository = projectMemberRepository;
    this.projectRepository = projectRepository;
  }

  private projectMemberRepository: PrismaProjectMemberRepository;
  private projectRepository: PrismaProjectRepository;

  createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const validatedData = CreateProjectSchema.parse(req.body);
      const result = await this.createProjectUseCase.execute(validatedData, req.user.userId);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // ✅ NUEVO MÉTODO: Crear proyecto desde template
  createFromTemplate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { templateId } = req.params;
      const { name } = req.body;

      if (!name || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'Project name is required',
        });
        return;
      }

      const project = await this.createProjectFromTemplateUseCase.execute(
        templateId,
        name.trim(),
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Project created successfully from template',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { projectId } = req.params;
      const validatedData = AddProjectMemberSchema.parse(req.body);

      const result = await this.addProjectMemberUseCase.execute(
        projectId,
        validatedData,
        req.user.userId
      );

      res.status(201).json({
        success: true,
        message: 'Member added successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { projectId } = req.params;
      const result = await this.getProjectUseCase.execute(projectId, req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  listProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const result = await this.listUserProjectsUseCase.execute(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { projectId } = req.params;
      const validatedData = UpdateProjectSchema.parse(req.body);

      const result = await this.updateProjectUseCase.execute(
        projectId,
        validatedData,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { projectId } = req.params;
      await this.deleteProjectUseCase.execute(projectId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { projectId, memberId } = req.params;
      const validatedData = UpdateMemberRoleSchema.parse(req.body);

      const result = await this.updateMemberRoleUseCase.execute(
        projectId,
        memberId,
        validatedData,
        req.user.userId
      );

      res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { projectId, memberId } = req.params;
      await this.removeMemberUseCase.execute(projectId, memberId, req.user.userId);

      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getProjectMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const { projectId } = req.params;

      // Verificar que el proyecto existe
      const project = await this.projectRepository.findById(projectId);
      if (!project) {
        res.status(404).json({
          success: false,
          message: 'Project not found',
        });
        return;
      }

      // Verificar que el usuario es miembro del proyecto
      const isMember = await this.projectMemberRepository.findByProjectAndUser(projectId, req.user.userId);
      const isCreator = project.getCreatedById() === req.user.userId;

      if (!isMember && !isCreator) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this project',
        });
        return;
      }

      // Obtener todos los miembros del proyecto
      const members = await this.projectMemberRepository.findByProject(projectId);

      res.status(200).json({
        success: true,
        data: members,
      });
    } catch (error) {
      next(error);
    }
  };
}
