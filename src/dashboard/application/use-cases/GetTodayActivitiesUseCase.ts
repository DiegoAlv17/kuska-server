import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { Activity } from '../../domain/types/Activity';

export class GetTodayActivitiesUseCase {
  async execute(userId: string, date?: Date): Promise<Activity[]> {
    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Filter for projects where user is member or creator
    const projectFilter = {
      OR: [
        { createdById: userId },
        { members: { some: { userId } } }
      ]
    };

    const [tasksCreated, tasksCompleted, comments] = await Promise.all([
      // Tasks created today
      prisma.tareas.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
          projects: projectFilter
        },
        include: {
          projects: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Tasks completed today
      prisma.tareas.findMany({
        where: {
          completedAt: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
          projects: projectFilter
        },
        include: {
          projects: { select: { id: true, name: true } }
        },
        orderBy: { completedAt: 'desc' }
      }),

      // Comments added today
      prisma.comentarios_tarea.findMany({
        where: {
          createdAt: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
          tareas: {
            deletedAt: null,
            projects: projectFilter
          }
        },
        include: {
          tareas: {
            include: {
              projects: { select: { id: true, name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    // Get user data for activities
    const userIds = new Set<string>();
    tasksCreated.forEach(t => t.reportedById && userIds.add(t.reportedById));
    tasksCompleted.forEach(t => t.reportedById && userIds.add(t.reportedById));
    comments.forEach(c => c.userId && userIds.add(c.userId));

    const users = await prisma.user.findMany({
      where: { id: { in: Array.from(userIds) } },
      select: { id: true, completeName: true, email: true }
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    const activities: Activity[] = [];

    // Add task created activities
    tasksCreated.forEach(task => {
      const user = task.reportedById ? userMap.get(task.reportedById) : null;
      if (user) {
        activities.push({
          id: `task_created_${task.id}`,
          type: 'task_created',
          title: task.title,
          description: 'Nueva tarea creada',
          projectId: task.projects.id,
          projectName: task.projects.name,
          taskId: task.id,
          createdBy: {
            id: user.id,
            name: user.completeName,
            email: user.email
          },
          createdAt: task.createdAt
        });
      }
    });

    // Add task completed activities
    tasksCompleted.forEach(task => {
      const user = task.reportedById ? userMap.get(task.reportedById) : null;
      if (user && task.completedAt) {
        activities.push({
          id: `task_completed_${task.id}`,
          type: 'task_completed',
          title: task.title,
          description: 'Tarea completada',
          projectId: task.projects.id,
          projectName: task.projects.name,
          taskId: task.id,
          createdBy: {
            id: user.id,
            name: user.completeName,
            email: user.email
          },
          createdAt: task.completedAt
        });
      }
    });

    // Add comment activities
    comments.forEach(comment => {
      const user = comment.userId ? userMap.get(comment.userId) : null;
      if (user) {
        activities.push({
          id: `comment_${comment.id}`,
          type: 'comment_added',
          title: `Comentario en: ${comment.tareas.title}`,
          description: comment.content.substring(0, 100),
          projectId: comment.tareas.projects.id,
          projectName: comment.tareas.projects.name,
          taskId: comment.taskId,
          createdBy: {
            id: user.id,
            name: user.completeName,
            email: user.email
          },
          createdAt: comment.createdAt
        });
      }
    });

    // Sort by createdAt descending
    activities.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return activities;
  }
}
