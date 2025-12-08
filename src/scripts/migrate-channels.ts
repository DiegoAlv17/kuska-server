/**
 * Script to create channels for existing teams that don't have one
 * Run with: npx ts-node src/scripts/migrate-channels.ts
 */

import { prisma } from '../auth/infrastructure/persistence/PrismaClient';

async function migrateChannels() {
  try {
    console.log('🔍 Searching for teams without channels...');

    // Get all teams
    const teams = await prisma.team.findMany({
      include: {
        channels: true,
        members: true
      }
    });

    console.log(`📊 Found ${teams.length} teams`);

    let created = 0;
    let skipped = 0;

    for (const team of teams) {
      if (team.channels.length === 0) {
        console.log(`\n📝 Creating channel for team: ${team.name} (${team.id})`);

        // Create channel
        const channel = await prisma.channel.create({
          data: {
            name: `Chat de ${team.name}`,
            description: `Canal principal del equipo ${team.name}`,
            type: 'equipo',
            teamId: team.id,
            createdById: team.leaderId,
            isPrivate: false
          }
        });

        console.log(`✅ Channel created: ${channel.id}`);

        // Add all team members to the channel
        for (const member of team.members) {
          await prisma.channelMember.create({
            data: {
              channelId: channel.id,
              userId: member.userId,
              role: member.role === 'Administrador' ? 'admin' : 'miembro'
            }
          });
          console.log(`   👤 Added member: ${member.userId}`);
        }

        created++;
      } else {
        console.log(`⏭️  Team "${team.name}" already has ${team.channels.length} channel(s)`);
        skipped++;
      }
    }

    console.log('\n✨ Migration complete!');
    console.log(`   Created: ${created} channels`);
    console.log(`   Skipped: ${skipped} teams`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateChannels();
