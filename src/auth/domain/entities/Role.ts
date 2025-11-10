export interface IRole {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class Role {
  private readonly id: string;
  private name: string;
  private description?: string;
  private permissions: Record<string, any>;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: IRole) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.permissions = props.permissions;
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

  getPermissions(): Record<string, any> {
    return { ...this.permissions };
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business methods
  hasPermission(permission: string): boolean {
    return this.permissions[permission] === true;
  }

  addPermission(permission: string): void {
    this.permissions[permission] = true;
    this.updatedAt = new Date();
  }

  removePermission(permission: string): void {
    delete this.permissions[permission];
    this.updatedAt = new Date();
  }

  updateDescription(description: string): void {
    this.description = description;
    this.updatedAt = new Date();
  }
}
