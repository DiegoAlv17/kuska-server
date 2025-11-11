import { Project } from '../entities/Project';

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByCode(code: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  findAll(): Promise<Project[]>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
}
