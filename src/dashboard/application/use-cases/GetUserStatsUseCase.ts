import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { UserStats } from '../../domain/types/UserStats';

export class GetUserStatsUseCase {
  async execute(userId: string): Promise<UserStats> {
    const [
      projectsCompleted,
      projectsInProgress,
      tasksCompleted,
      overdueTasks,
      teamMembersData
    ] = await Promise.all([
      // Projects completed
      prisma.project.count({
        where: {
          status: 'COMPLETED',
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        }
      }),

      // Projects in progress
      prisma.project.count({
        where: {
          status: 'ACTIVE',
          OR: [
            { createdById: userId },
            { members: { some: { userId } } }
          ]
        }
      }),

      // Tasks completed
      prisma.tareas.count({
        where: {
          assignedToId: userId,
          completedAt: { not: null },
          deletedAt: null
        }
      }),

      // Overdue tasks
      prisma.tareas.count({
        where: {
          assignedToId: userId,
          dueDate: { lt: new Date() },
          status: { not: 'done' },
          deletedAt: null
        }
      }),

      // Team members (distinct users from projects where current user is member)
      prisma.projectMember.findMany({
        where: {
          project: {
            OR: [
              { createdById: userId },
              { members: { some: { userId } } }
            ]
          }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      })
    ]);

    return {
      projectsCompleted,
      projectsInProgress,
      tasksCompleted,
      overdueTasks,
      teamMembers: teamMembersData.length
    };
  }
}
