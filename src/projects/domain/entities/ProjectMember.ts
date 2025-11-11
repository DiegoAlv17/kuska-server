import { ProjectRole } from '../value-objects/ProjectEnums';

export interface ProjectMemberProps {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  addedAt: Date;
}

export class ProjectMember {
  private readonly id: string;
  private readonly projectId: string;
  private readonly userId: string;
  private role: ProjectRole;
  private readonly addedAt: Date;

  constructor(props: ProjectMemberProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.userId = props.userId;
    this.role = props.role;
    this.addedAt = props.addedAt;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getUserId(): string {
    return this.userId;
  }

  getRole(): ProjectRole {
    return this.role;
  }

  getAddedAt(): Date {
    return this.addedAt;
  }

  // Business methods
  changeRole(newRole: ProjectRole): void {
    this.role = newRole;
  }

  isAdmin(): boolean {
    return this.role === ProjectRole.ADMIN;
  }

  isMember(): boolean {
    return this.role === ProjectRole.MEMBER;
  }

  isReader(): boolean {
    return this.role === ProjectRole.READER;
  }

  canEdit(): boolean {
    return this.role === ProjectRole.ADMIN || this.role === ProjectRole.MEMBER;
  }

  canDelete(): boolean {
    return this.role === ProjectRole.ADMIN;
  }
}
