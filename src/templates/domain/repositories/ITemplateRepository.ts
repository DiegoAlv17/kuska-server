// src/templates/domain/repositories/ITemplateRepository.ts

import { Template } from '../entities/Template';

export interface ITemplateRepository {
  create(template: Template): Promise<Template>;
  findById(id: string): Promise<Template | null>;
  findByUserId(userId: string): Promise<Template[]>;
  findPublicTemplates(): Promise<Template[]>;
  findByCategory(category: string): Promise<Template[]>;
  findAll(): Promise<Template[]>;
  update(template: Template): Promise<Template>;
  delete(id: string): Promise<void>;
  incrementUsageCount(id: string): Promise<void>;
}