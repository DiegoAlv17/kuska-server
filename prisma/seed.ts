import { prisma } from '../src/auth/infrastructure/persistence/PrismaClient';

async function main() {
  console.log('Seeding project-scoped roles...');

  const roles = [
    {
      name: 'PROJECT:ADMIN',
      description: 'Project administrator with full project privileges',
      permissions: {
        manageMembers: true,
        editProject: true,
        deleteProject: true,
        viewProject: true,
      },
    },
    {
      name: 'PROJECT:MEMBER',
      description: 'Project member with ability to contribute and edit content',
      permissions: {
        manageMembers: false,
        editProject: true,
        deleteProject: false,
        viewProject: true,
      },
    },
    {
      name: 'PROJECT:READER',
      description: 'Read-only project role',
      permissions: {
        manageMembers: false,
        editProject: false,
        deleteProject: false,
        viewProject: true,
      },
    },
  ];

  for (const r of roles) {
    try {
      await prisma.role.upsert({
        where: { name: r.name },
        update: { description: r.description, permissions: r.permissions },
        create: { name: r.name, description: r.description, permissions: r.permissions },
      });
      console.log(`Upserted role ${r.name}`);
    } catch (err) {
      console.error(`Failed to upsert role ${r.name}:`, err);
    }
  }

  console.log('Seeding default templates...');

  // NECESITAS: Un usuario admin para createdById - ajusta este ID según tu BD
  const adminUser = await prisma.user.findFirst();
  if (!adminUser) {
    console.log('⚠️  No users found in database. Skipping template seeding.');
    console.log('💡 Create a user first, then run seed again.');
    return;
  }


  const defaultTemplates = [
    {
      name: 'Scrum Framework',
      description: 'Plantilla para proyectos usando metodología Scrum con sprints',
      category: 'SOFTWARE',
      industry: 'TECH',
      complexity: 'MEDIUM',
      content: {
        phases: [
          {
            name: 'Sprint Planning',
            order: 1,
            defaultTasks: [
              'Definir Sprint Goal',
              'Seleccionar items del Product Backlog',
              'Estimar tareas del Sprint'
            ]
          },
          {
            name: 'Sprint Execution',
            order: 2,
            defaultTasks: [
              'Daily Standup Meeting',
              'Desarrollo de features',
              'Code review'
            ]
          },
          {
            name: 'Sprint Review',
            order: 3,
            defaultTasks: [
              'Demo con stakeholders',
              'Revisión de métricas',
              'Actualizar Product Backlog'
            ]
          },
          {
            name: 'Sprint Retrospective',
            order: 4,
            defaultTasks: [
              'Identificar mejoras',
              'Definir action items',
              'Compartir aprendizajes'
            ]
          }
        ],
        config: {
          hasSprints: true,
          sprintDurationDays: 14,
          roles: ['Scrum Master', 'Product Owner', 'Development Team'],
          ceremonies: ['Sprint Planning', 'Daily Standup', 'Sprint Review', 'Retrospective']
        }
      },
      isPublic: true,
      usageCount: 0,
      rating: null
    },
    {
      name: 'Kanban Board',
      description: 'Sistema visual de flujo de trabajo continuo',
      category: 'OPERATIONS',
      industry: 'OTHER',
      complexity: 'SIMPLE',
      content: {
        columns: [
          { name: 'Backlog', order: 1, wipLimit: null },
          { name: 'Ready', order: 2, wipLimit: null },
          { name: 'In Progress', order: 3, wipLimit: 5 },
          { name: 'Review', order: 4, wipLimit: 3 },
          { name: 'Done', order: 5, wipLimit: null }
        ],
        config: {
          hasSprints: false,
          wipEnabled: true,
          flowMetrics: true,
          classesOfService: ['Standard', 'Expedite', 'Fixed Date']
        }
      },
      isPublic: true,
      usageCount: 0,
      rating: null
    },
    {
      name: 'Proyecto Simple',
      description: 'Estructura básica para cualquier tipo de proyecto',
      category: 'OTHER',
      industry: 'OTHER',
      complexity: 'SIMPLE',
      content: {
        phases: [
          {
            name: 'Planificación',
            order: 1,
            defaultTasks: [
              'Definir objetivos',
              'Identificar recursos',
              'Establecer timeline'
            ]
          },
          {
            name: 'Ejecución',
            order: 2,
            defaultTasks: [
              'Seguimiento de progreso',
              'Coordinación del equipo',
              'Resolución de problemas'
            ]
          },
          {
            name: 'Finalización',
            order: 3,
            defaultTasks: [
              'Entrega final',
              'Documentación',
              'Lecciones aprendidas'
            ]
          }
        ],
        config: {
          hasSprints: false,
          simpleLayout: true,
          flexibleStructure: true
        }
      },
      isPublic: true,
      usageCount: 0,
      rating: null
    }
  ];

  for (const templateData of defaultTemplates) {
    try {
      const template = await prisma.template.upsert({
        where: { name: templateData.name },
        update: {
          description: templateData.description,
          content: templateData.content,
          isPublic: templateData.isPublic
        },
        create: {
          ...templateData,
          createdById: adminUser.id
        },
      });

      // Crear versión inicial del template
      await prisma.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber: 1,
          content: templateData.content,
          notes: 'Versión inicial',
          createdById: adminUser.id
        }
      });

      console.log(`Upserted template ${templateData.name}`);
    } catch (err) {
      console.error(`Failed to upsert template ${templateData.name}:`, err);
    }
  }

  console.log('Seeding complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });