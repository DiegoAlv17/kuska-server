export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  ON_HOLD = 'ON_HOLD',
}

export class ProjectStatusVO {
  private readonly value: ProjectStatus;

  constructor(value: ProjectStatus) {
    this.value = value;
  }

  getValue(): ProjectStatus {
    return this.value;
  }

  isActive(): boolean {
    return this.value === ProjectStatus.ACTIVE;
  }

  isCompleted(): boolean {
    return this.value === ProjectStatus.COMPLETED;
  }

  toString(): string {
    return this.value;
  }
}
