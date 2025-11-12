// src/templates/domain/entities/Template.ts

import { TemplateComplexity } from '../value-objects/TemplateEnums';

export interface TemplateProps {
  id: string;
  name: string;
  description?: string;
  category?: string;
  industry?: string;
  complexity: TemplateComplexity;
  content: Record<string, any>; // Estructura JSON de fases/tareas
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
  private category?: string;
  private industry?: string;
  private complexity: TemplateComplexity;
  private content: Record<string, any>;
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
    this.content = props.content;
    this.isPublic = props.isPublic;
    this.usageCount = props.usageCount;
    this.rating = props.rating;
    this.createdById = props.createdById;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  // Getters
  getId(): string { return this.id; }
  getName(): string { return this.name; }
  getDescription(): string | undefined { return this.description; }
  getCategory(): string | undefined { return this.category; }
  getIndustry(): string | undefined { return this.industry; }
  getComplexity(): TemplateComplexity { return this.complexity; }
  getContent(): Record<string, any> { return { ...this.content }; }
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

  updateContent(content: Record<string, any>): void {
    this.content = content;
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
}