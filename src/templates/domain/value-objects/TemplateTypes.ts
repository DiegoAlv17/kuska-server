// src/templates/domain/value-objects/TemplateTypes.ts
export enum TemplateType {
  SIMPLE = 'SIMPLE',
  SCRUM = 'SCRUM', 
  KANBAN = 'KANBAN',
  WATERFALL = 'WATERFALL'
}

// Estructuras base para cada tipo
export interface BaseTemplateContent {
  type: TemplateType;
  version: string;
  description?: string;
}

export interface SimpleTemplateContent extends BaseTemplateContent {
  type: TemplateType.SIMPLE;
  tasks: {
    statuses: string[];
    priorities: string[];
  };
}

export interface ScrumTemplateContent extends BaseTemplateContent {
  type: TemplateType.SCRUM;
  settings: {
    sprintDuration: number;
    teamSize: number;
    pointsPerSprint: number;
  };
  workflows: {
    sprint: {
      phases: string[];
    };
    task: {
      statuses: string[];
      types: string[];
    };
  };
  ceremonies: {
    dailyScrum: { duration: number; questions: string[] };
    sprintPlanning: { duration: number; agenda: string[] };
    sprintReview: { duration: number; agenda: string[] };
    retrospective: { duration: number; format: string };
  };
  roles: Array<{
    name: string;
    responsibilities: string[];
  }>;
}

export interface KanbanTemplateContent extends BaseTemplateContent {
  type: TemplateType.KANBAN;
  settings: {
    wipLimits: boolean;
    columns: number;
  };
  workflows: {
    columns: Array<{
      name: string;
      wipLimit?: number;
      status: string;
    }>;
    task: {
      types: string[];
      priorities: string[];
    };
  };
  metrics: {
    cycleTime: boolean;
    leadTime: boolean;
    throughput: boolean;
  };
}

export type TemplateContent = 
  | SimpleTemplateContent 
  | ScrumTemplateContent 
  | KanbanTemplateContent;