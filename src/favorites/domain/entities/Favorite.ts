export class Favorite {
  private id: string;
  private projectId: string;
  private userId: string;
  private createdAt: Date;
  private lastAccessed: Date;

  constructor(props: {
    id: string;
    projectId: string;
    userId: string;
    createdAt: Date;
    lastAccessed: Date;
  }) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.userId = props.userId;
    this.createdAt = props.createdAt;
    this.lastAccessed = props.lastAccessed;
  }

  getId(): string {
    return this.id;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getUserId(): string {
    return this.userId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getLastAccessed(): Date {
    return this.lastAccessed;
  }

  updateLastAccessed(date: Date): void {
    this.lastAccessed = date;
  }
}
