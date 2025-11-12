import { v4 as uuidv4 } from 'uuid';
import { IProjectRepository } from '../../domain/repositories/IProjectRepository';
import { IProjectMemberRepository } from '../../domain/repositories/IProjectMemberRepository';
import { ITemplateRepository } from '../../../templates/domain/repositories/ITemplateRepository';
import { Project } from '../../domain/entities/Project';
import { ProjectMember } from '../../domain/entities/ProjectMember';
import { ProjectCode } from '../../domain/value-objects/ProjectCode';
import { ProjectStatus, ProjectStatusVO } from '../../domain/value-objects/ProjectStatus';
import { ProjectRole, TemplateType } from '../../domain/value-objects/ProjectEnums';
import { TemplateNotFoundException, TemplateAccessDeniedException } from '../../../templates/domain/exceptions/TemplateExceptions';
import { ProjectCodeAlreadyExistsException } from '../../domain/exceptions/ProjectExceptions';

export class CreateProjectFromTemplateUseCase {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly projectMemberRepository: IProjectMemberRepository,
    private readonly templateRepository: ITemplateRepository
  ) {}

  async execute(templateId: string, projectName: string, userId: string): Promise<any> {
    // 1. Obtener el template
    const template = await this.templateRepository.findById(templateId);
    
    if (!template) {
      throw new TemplateNotFoundException(templateId);
    }

    // 2. Verificar que el usuario puede usar este template
    if (!template.canBeUsedBy(userId)) {
      throw new TemplateAccessDeniedException(userId, templateId);
    }

    // 3. Generar código único para el proyecto
    const projectCode = await this.generateUniqueProjectCode(projectName);

    // 4. Determinar el tipo de proyecto basado en el template
    const projectType = this.mapTemplateTypeToProjectType(template.getTemplateType());

    // 5. Crear el proyecto basado en el template
    const project = new Project({
      id: uuidv4(),
      name: projectName,
      description: `Proyecto creado desde template: ${template.getName()}`,
      code: new ProjectCode(projectCode),
      status: new ProjectStatusVO(ProjectStatus.ACTIVE),
      type: projectType,
      templateId: templateId,
      createdById: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 6. Guardar el proyecto
    const savedProject = await this.projectRepository.create(project);

    // 7. Agregar al creador como ADMIN del proyecto
    const adminMember = new ProjectMember({
      id: uuidv4(),
      projectId: savedProject.getId(),
      userId: userId,
      role: ProjectRole.ADMIN,
      addedAt: new Date(),
    });

    await this.projectMemberRepository.create(adminMember);

    // 8. Incrementar el contador de uso del template
    await this.templateRepository.incrementUsageCount(templateId);

    // 9. Retornar el proyecto creado
    return {
      id: savedProject.getId(),
      name: savedProject.getName(),
      description: savedProject.getDescription(),
      code: savedProject.getCode().getValue(),
      status: savedProject.getStatus().getValue(),
      type: savedProject.getType(),
      templateId: templateId,
      createdById: savedProject.getCreatedById(),
      createdAt: savedProject.getCreatedAt(),
      updatedAt: savedProject.getUpdatedAt(),
    };
  }

  private async generateUniqueProjectCode(projectName: string): Promise<string> {
    // Generar código base desde el nombre del proyecto
    const baseCode = projectName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6);

    let code = baseCode;
    let counter = 1;

    // Verificar si el código ya existe y generar uno único
    while (await this.projectRepository.findByCode(code)) {
      code = `${baseCode}${counter}`;
      counter++;
      
      if (counter > 100) {
        throw new Error('Could not generate unique project code');
      }
    }

    return code;
  }

  private mapTemplateTypeToProjectType(templateType: string): TemplateType {
    const typeMap: { [key: string]: TemplateType } = {
      'SCRUM': TemplateType.SCRUM,
      'KANBAN': TemplateType.KANBAN,
      'SIMPLE': TemplateType.SIMPLE,
      'WATERFALL': TemplateType.SIMPLE, // Mapear WATERFALL a SIMPLE por ahora
    };

    return typeMap[templateType] || TemplateType.SIMPLE;
  }
}
