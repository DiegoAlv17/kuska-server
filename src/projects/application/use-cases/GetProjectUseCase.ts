import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { ITemplateRepository } from '../../../templates/domain/repositories/ITemplateRepository';
import { ProjectNotFoundException, UserNotMemberException } from '../../domain/exceptions/ProjectExceptions';
import { ProjectResponseDto } from '../dtos/ProjectResponseDto';

export class GetProjectUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly templateRepository?: ITemplateRepository
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

    // Obtener información completa con Prisma (incluye datos de usuarios y template)
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
        template: true, // ✅ Incluir template
      },
    });

    // Obtener template por defecto si no hay template asociado
    let templateData = projectData.template;
    if (!templateData && this.templateRepository) {
      // Buscar template por defecto (primera plantilla pública del tipo correspondiente)
      const publicTemplates = await this.templateRepository.findPublicTemplates();
      const defaultTemplate = publicTemplates.find(t => t.getTemplateType() === project.getType());
      if (defaultTemplate) {
        templateData = {
          id: defaultTemplate.getId(),
          name: defaultTemplate.getName(),
          description: defaultTemplate.getDescription(),
          category: defaultTemplate.getCategory(),
          industry: defaultTemplate.getIndustry(),
          complexity: defaultTemplate.getComplexity(),
          content: defaultTemplate.getContent(),
          templateType: defaultTemplate.getTemplateType(),
          isPublic: defaultTemplate.isPublicTemplate(),
          usageCount: defaultTemplate.getUsageCount(),
          createdAt: defaultTemplate.getCreatedAt(),
          updatedAt: defaultTemplate.getUpdatedAt(),
        };
      }
    }

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
      template: templateData ? {
        id: templateData.id,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        industry: templateData.industry,
        complexity: templateData.complexity,
        content: templateData.content,
        templateType: templateData.templateType || templateData.type,
        isPublic: templateData.isPublic,
        usageCount: templateData.usageCount,
        createdAt: templateData.createdAt,
        updatedAt: templateData.updatedAt,
      } : undefined,
      createdAt: project.getCreatedAt(),
      updatedAt: project.getUpdatedAt(),
    };
  }
}
