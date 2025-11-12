// src/templates/application/helpers/templateContentHelper.ts
import { TemplateType, TemplateContent, ScrumTemplateContent, KanbanTemplateContent, SimpleTemplateContent } from '../../domain/value-objects/TemplateTypes';

export const generateTemplateContent = (type: TemplateType, customData?: any): TemplateContent => {
  const baseContent = {
    version: "1.0",
    description: customData?.description || ""
  };

  switch (type) {
    case TemplateType.SIMPLE:
      return {
        ...baseContent,
        type: TemplateType.SIMPLE,
        tasks: {
          statuses: ["POR HACER", "EN PROGRESO", "COMPLETADO"],
          priorities: ["BAJA", "MEDIA", "ALTA"]
        }
      } as SimpleTemplateContent;

    case TemplateType.SCRUM:
      return {
        ...baseContent,
        type: TemplateType.SCRUM,
        settings: {
          sprintDuration: 14,
          teamSize: 6,
          pointsPerSprint: 30,
          ...customData?.settings
        },
        workflows: {
          sprint: {
            phases: ["PLANNING", "ACTIVE", "REVIEW", "RETROSPECTIVE"]
          },
          task: {
            statuses: ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
            types: ["STORY", "TASK", "BUG", "EPIC"]
          }
        },
        ceremonies: {
          dailyScrum: {
            duration: 15,
            questions: [
              "¿Qué hice ayer?",
              "¿Qué haré hoy?", 
              "¿Hay impedimentos?"
            ]
          },
          sprintPlanning: {
            duration: 60,
            agenda: ["Definir objetivo", "Seleccionar historias", "Crear tareas"]
          },
          sprintReview: {
            duration: 60,
            agenda: ["Demo", "Feedback", "Ajustes"]
          },
          retrospective: {
            duration: 45,
            format: "START_STOP_CONTINUE"
          }
        },
        roles: [
          {
            name: "Product Owner",
            responsibilities: [
              "Definir backlog",
              "Priorizar historias", 
              "Aceptar criterios"
            ]
          },
          {
            name: "Scrum Master",
            responsibilities: [
              "Facilitar ceremonias",
              "Remover impedimentos",
              "Garantizar proceso"
            ]
          },
          {
            name: "Development Team",
            responsibilities: [
              "Desarrollar funcionalidades",
              "Estimar tareas",
              "Auto-organizarse"
            ]
          }
        ]
      } as ScrumTemplateContent;

    case TemplateType.KANBAN:
      return {
        ...baseContent,
        type: TemplateType.KANBAN,
        settings: {
          wipLimits: true,
          columns: 4,
          ...customData?.settings
        },
        workflows: {
          columns: [
            { name: "Backlog", status: "BACKLOG" },
            { name: "Por Hacer", status: "TODO", wipLimit: 5 },
            { name: "En Progreso", status: "DOING", wipLimit: 3 },
            { name: "Completado", status: "DONE" }
          ],
          task: {
            types: ["TAREA", "BUG", "MEJORA"],
            priorities: ["BAJA", "MEDIA", "ALTA", "CRÍTICA"]
          }
        },
        metrics: {
          cycleTime: true,
          leadTime: true, 
          throughput: true
        }
      } as KanbanTemplateContent;

    default:
      return generateTemplateContent(TemplateType.SIMPLE);
  }
};