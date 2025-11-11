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
