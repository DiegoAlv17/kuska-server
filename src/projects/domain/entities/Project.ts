import { ProjectCode } from '../value-objects/ProjectCode';
import { ProjectStatus, ProjectStatusVO } from '../value-objects/ProjectStatus';
import { TemplateType } from '../value-objects/ProjectEnums';

export interface ProjectProps {
  id: string;
  name: string;
  description?: string;
  code: ProjectCode;
  status: ProjectStatusVO;
  type: TemplateType;
  templateId?: string | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Project {
  private readonly id: string;
  private name: string;
  private description?: string;
  private code: ProjectCode;
  private status: ProjectStatusVO;
  private type: TemplateType;
  private templateId?: string | null;
  private readonly createdById: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: ProjectProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.code = props.code;
    this.status = props.status;
    this.type = props.type;
    this.templateId = props.templateId;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | undefined {
    return this.description;
  }

  getCode(): ProjectCode {
    return this.code;
  }

  getStatus(): ProjectStatusVO {
    return this.status;
  }

  getType(): TemplateType {
    return this.type;
  }

  getTemplateId(): string | null | undefined {
    return this.templateId;
  }

  getCreatedById(): string {
    return this.createdById;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Project name cannot be empty');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  changeStatus(status: ProjectStatus): void {
    this.status = new ProjectStatusVO(status);
    this.updatedAt = new Date();
  }

  complete(): void {
    this.changeStatus(ProjectStatus.COMPLETED);
  }

  archive(): void {
    this.changeStatus(ProjectStatus.ARCHIVED);
  }

  isActive(): boolean {
    return this.status.isActive();
  }

  isCreator(userId: string): boolean {
    return this.createdById === userId;
  }
}
