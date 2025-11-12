// prisma/seed.ts
import { TemplateComplexity, TemplateCategory, TemplateIndustry, TemplateType } from '@prisma/client';
import { prisma } from '../src/auth/infrastructure/persistence/PrismaClient';

async function main() {
  const adminUser = await prisma.user.findFirst();
  
  if (!adminUser) {
    console.log('❌ NO se encontró ningún usuario en la BD');
    console.log('💡 Crea un usuario primero, luego ejecuta el seed nuevamente');
    return;
  }

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

  let rolesCreated = 0;
  let rolesUpdated = 0;

  for (const r of roles) {
    try {
      const result = await prisma.role.upsert({
        where: { name: r.name },
        update: { 
          description: r.description, 
          permissions: r.permissions,
          updatedAt: new Date()
        },
        create: { 
          name: r.name, 
          description: r.description, 
          permissions: r.permissions 
        },
      });

      // Determinar si fue creación o actualización
      const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime();
      
      if (wasCreated) {
        rolesCreated++;
      } else {
        rolesUpdated++;
      }
      
    } catch (err) {
      console.error(`💥 ERROR con rol ${r.name}:`, err);
    }
  }

  // ✅ CONTENIDO BÁSICO SIN generateTemplateContent (para evitar conflictos)
  const defaultTemplates = [
    {
      name: 'Scrum Framework',
      description: 'Plantilla para gestión ágil con Scrum',
      category: TemplateCategory.SOFTWARE,
      industry: TemplateIndustry.TECH,
      complexity: TemplateComplexity.MEDIUM,
      templateType: TemplateType.SCRUM,
      content: { 
        type: 'SCRUM', 
        version: '1.0',
        settings: { sprintDuration: 14, teamSize: 6, pointsPerSprint: 30 },
        workflows: {
          sprint: { phases: ['PLANNING', 'ACTIVE', 'REVIEW', 'RETROSPECTIVE'] },
          task: { statuses: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'], types: ['STORY', 'TASK', 'BUG', 'EPIC'] }
        }
      },
      isPublic: true,
      usageCount: 0,
      rating: null
    },
    {
      name: 'Kanban Board',
      description: 'Plantilla para flujo continuo con Kanban',
      category: TemplateCategory.OPERATIONS,
      industry: TemplateIndustry.TECH,
      complexity: TemplateComplexity.SIMPLE,
      templateType: TemplateType.KANBAN,
      content: { 
        type: 'KANBAN', 
        version: '1.0',
        settings: { wipLimits: true, columns: 4 },
        workflows: {
          columns: [
            { name: 'Backlog', status: 'BACKLOG' },
            { name: 'Por Hacer', status: 'TODO', wipLimit: 5 },
            { name: 'En Progreso', status: 'DOING', wipLimit: 3 },
            { name: 'Completado', status: 'DONE' }
          ]
        }
      },
      isPublic: true,
      usageCount: 0,
      rating: null
    },
    {
      name: 'Proyecto Simple',
      description: 'Plantilla básica para proyectos generales',
      category: TemplateCategory.OTHER,
      industry: TemplateIndustry.OTHER,
      complexity: TemplateComplexity.SIMPLE,
      templateType: TemplateType.SIMPLE,
      content: { 
        type: 'SIMPLE', 
        version: '1.0',
        tasks: {
          statuses: ['POR HACER', 'EN PROGRESO', 'COMPLETADO'],
          priorities: ['BAJA', 'MEDIA', 'ALTA']
        }
      },
      isPublic: true,
      usageCount: 0,
      rating: null
    }
  ];

  let templatesCreated = 0;
  let templatesUpdated = 0;
  let templatesWithErrors = 0;

  for (const templateData of defaultTemplates) {
    try {
      const template = await prisma.template.upsert({
        where: { name: templateData.name },
        update: {
          description: templateData.description,
          category: templateData.category,
          industry: templateData.industry,
          complexity: templateData.complexity,
          templateType: templateData.templateType,
          content: templateData.content,
          isPublic: templateData.isPublic,
          updatedAt: new Date()
        },
        create: {
          name: templateData.name,
          description: templateData.description,
          category: templateData.category,
          industry: templateData.industry,
          complexity: templateData.complexity,
          templateType: templateData.templateType,
          content: templateData.content,
          isPublic: templateData.isPublic,
          usageCount: templateData.usageCount,
          rating: templateData.rating,
          createdById: adminUser.id
        },
      });

      // Determinar si fue creación o actualización
      const wasCreated = template.createdAt.getTime() === template.updatedAt.getTime();
      
      if (wasCreated) {
        templatesCreated++;
        console.log(`✅ Template creado: ${templateData.name}`);
      } else {
        templatesUpdated++;
        console.log(`🔄 Template actualizado: ${templateData.name}`);
      }

      // ✅ COMENTAR TEMPORALMENTE las versiones (ya existen)
      // await prisma.templateVersion.create({
      //   data: {
      //     templateId: template.id,
      //     versionNumber: 1,
      //     content: templateData.content,
      //     notes: 'Versión inicial - Estructura nueva',
      //     createdById: adminUser.id
      //   }
      // });

    } catch (err) {
      console.error(`💥 ERROR CRÍTICO con template "${templateData.name}":`, err);
      templatesWithErrors++;
    }
  }

  // ✅ RESUMEN FINAL
  console.log('\n🎉 SEED COMPLETADO');
  console.log(`👥 Roles: ${rolesCreated} creados, ${rolesUpdated} actualizados`);
  console.log(`📋 Templates: ${templatesCreated} creados, ${templatesUpdated} actualizados, ${templatesWithErrors} errores`);
  console.log('\n📊 Templates disponibles:');
  defaultTemplates.forEach(t => {
    console.log(`   • ${t.name} (${t.templateType}) - ${t.category}/${t.industry}`);
  });
}

main()
  .catch((e) => {
    console.error('💥 ERROR NO MANEJADO EN SEED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Conexión a BD cerrada');
  });