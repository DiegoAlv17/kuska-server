export class ProjectNotFoundException extends Error {
  constructor(projectId: string) {
    super(`Project with ID ${projectId} not found`);
    this.name = 'ProjectNotFoundException';
  }
}

export class ProjectCodeAlreadyExistsException extends Error {
  constructor(code: string) {
    super(`Project with code ${code} already exists`);
    this.name = 'ProjectCodeAlreadyExistsException';
  }
}

export class UserNotMemberException extends Error {
  constructor(userId: string, projectId: string) {
    super(`User ${userId} is not a member of project ${projectId}`);
    this.name = 'UserNotMemberException';
  }
}

export class InsufficientPermissionsException extends Error {
  constructor(action: string) {
    super(`Insufficient permissions to ${action}`);
    this.name = 'InsufficientPermissionsException';
  }
}

export class MemberAlreadyExistsException extends Error {
  constructor(email: string, projectId: string) {
    super(`User with email ${email} is already a member of project ${projectId}`);
    this.name = 'MemberAlreadyExistsException';
  }
}
