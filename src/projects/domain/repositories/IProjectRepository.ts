import { Project } from '../entities/Project';

export interface ProjectWithStats {
  project: Project;
  taskStats: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
  };
  progress: number;
  memberCount: number;
  lastActivity: Date | null;
}

export interface IProjectRepository {
  create(project: Project): Promise<Project>;
  findById(id: string): Promise<Project | null>;
  findByCode(code: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  findAll(): Promise<Project[]>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  findRecentWithStats(userId: string, limit: number, offset: number): Promise<{
    projects: ProjectWithStats[];
    total: number;
  }>;
}
