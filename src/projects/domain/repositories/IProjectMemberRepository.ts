import { ProjectMember } from '../entities/ProjectMember';

export interface IProjectMemberRepository {
  create(member: ProjectMember): Promise<ProjectMember>;
  findById(id: string): Promise<ProjectMember | null>;
  findByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null>;
  findByProject(projectId: string): Promise<ProjectMember[]>;
  findByUser(userId: string): Promise<ProjectMember[]>;
  update(member: ProjectMember): Promise<ProjectMember>;
  delete(id: string): Promise<void>;
}
