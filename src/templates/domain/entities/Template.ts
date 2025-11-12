// src/templates/domain/entities/Template.ts
import { TemplateComplexity, TemplateCategory, TemplateIndustry } from '../value-objects/TemplateEnums';
import { TemplateType, TemplateContent } from '../value-objects/TemplateTypes';

export interface TemplateProps {
  id: string;
  name: string;
  description?: string;
  category?: TemplateCategory;
  industry?: TemplateIndustry;
  complexity: TemplateComplexity;
  templateType: TemplateType; // ← NUEVO CAMPO
  content: TemplateContent;   // ← ACTUALIZADO a TemplateContent
  isPublic: boolean;
  usageCount: number;
  rating?: number;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Template {
  private readonly id: string;
  private name: string;
  private description?: string;
  private category?: TemplateCategory;
  private industry?: TemplateIndustry;
  private complexity: TemplateComplexity;
  private templateType: TemplateType; // ← NUEVO CAMPO
  private content: TemplateContent;   // ← ACTUALIZADO
  private isPublic: boolean;
  private usageCount: number;
  private rating?: number;
  private readonly createdById: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: TemplateProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.industry = props.industry;
    this.complexity = props.complexity;
    this.templateType = props.templateType; // ← INICIALIZADO
    this.content = props.content;
    this.isPublic = props.isPublic;
    this.usageCount = props.usageCount;
    this.rating = props.rating;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    
    this.validateContent(); // ← VALIDACIÓN AUTOMÁTICA
  }

  // Getters
  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getDescription(): string | undefined { return this.description; }
  getCategory(): TemplateCategory | undefined { return this.category; }
  getIndustry(): TemplateIndustry | undefined { return this.industry; }
  getComplexity(): TemplateComplexity { return this.complexity; }
  getTemplateType(): TemplateType { return this.templateType; } // ← NUEVO GETTER
  getContent(): TemplateContent { return { ...this.content }; } // ← TIPADO
  isPublicTemplate(): boolean { return this.isPublic; }
  getUsageCount(): number { return this.usageCount; }
  getRating(): number | undefined { return this.rating; }
  getCreatedById(): string { return this.createdById; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Business methods
  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Template name cannot be empty');
    }
    if (name.length > 255) {
      throw new Error('Template name is too long');
    }
    this.name = name;
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    if (description.length > 1000) {
      throw new Error('Description is too long');
    }
    this.description = description;
    this.updatedAt = new Date();
  }

  updateContent(content: TemplateContent): void { // ← TIPADO ACTUALIZADO
    this.content = content;
    this.validateContent(); // ← VALIDAR NUEVO CONTENIDO
    this.updatedAt = new Date();
  }

  updateTemplateType(templateType: TemplateType): void { // ← NUEVO MÉTODO
    this.templateType = templateType;
    this.updatedAt = new Date();
  }

  makePublic(): void {
    this.isPublic = true;
    this.updatedAt = new Date();
  }

  makePrivate(): void {
    this.isPublic = false;
    this.updatedAt = new Date();
  }

  incrementUsage(): void {
    this.usageCount++;
    this.updatedAt = new Date();
  }

  updateRating(rating: number): void {
    if (rating < 0 || rating > 5) {
      throw new Error('Rating must be between 0 and 5');
    }
    this.rating = rating;
    this.updatedAt = new Date();
  }

  changeComplexity(complexity: TemplateComplexity): void {
    this.complexity = complexity;
    this.updatedAt = new Date();
  }

  isCreator(userId: string): boolean {
    return this.createdById === userId;
  }

  canBeUsedBy(userId: string): boolean {
    return this.isPublic || this.isCreator(userId);
  }

  // ← NUEVO: Validación de contenido según tipo
  private validateContent(): void {
    if (this.content.type !== this.templateType) {
      throw new Error(`Content type ${this.content.type} does not match template type ${this.templateType}`);
    }

    switch (this.templateType) {
      case TemplateType.SCRUM:
        this.validateScrumContent();
        break;
      case TemplateType.KANBAN:
        this.validateKanbanContent();
        break;
      case TemplateType.SIMPLE:
        this.validateSimpleContent();
        break;
      default:
        throw new Error(`Unsupported template type: ${this.templateType}`);
    }
  }

  private validateScrumContent(): void {
    const content = this.content as any;
    if (!content.settings?.sprintDuration || content.settings.sprintDuration <= 0) {
      throw new Error("Scrum template must have positive sprint duration");
    }
    if (!content.workflows?.sprint?.phases || content.workflows.sprint.phases.length === 0) {
      throw new Error("Scrum template must have sprint phases");
    }
    if (!content.ceremonies?.dailyScrum) {
      throw new Error("Scrum template must have daily scrum ceremony defined");
    }
  }

  private validateKanbanContent(): void {
    const content = this.content as any;
    if (!content.workflows?.columns || content.workflows.columns.length === 0) {
      throw new Error("Kanban template must have columns defined");
    }
  }

  private validateSimpleContent(): void {
    const content = this.content as any;
    if (!content.tasks?.statuses || content.tasks.statuses.length === 0) {
      throw new Error("Simple template must have task statuses defined");
    }
  }
}