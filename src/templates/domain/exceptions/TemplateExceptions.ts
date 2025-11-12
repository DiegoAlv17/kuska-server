// src/templates/domain/exceptions/TemplateExceptions.ts

export class TemplateNotFoundException extends Error {
  constructor(templateId: string) {
    super(`Template with ID ${templateId} not found`);
    this.name = 'TemplateNotFoundException';
  }
}

export class TemplateAccessDeniedException extends Error {
  constructor(userId: string, templateId: string) {
    super(`User ${userId} does not have access to template ${templateId}`);
    this.name = 'TemplateAccessDeniedException';
  }
}

export class InsufficientPermissionsException extends Error {
  constructor(action: string) {
    super(`Insufficient permissions to ${action}`);
    this.name = 'InsufficientPermissionsException';
  }
}

export class InvalidTemplateContentException extends Error {
  constructor(reason: string) {
    super(`Invalid template content: ${reason}`);
    this.name = 'InvalidTemplateContentException';
  }
}