import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { Task } from '../../domain/entities/Task';
import { ITaskRepository, TaskWithProject } from '../../domain/repositories/ITaskRepository';

export class PrismaTaskRepository implements ITaskRepository {
  async create(task: Task): Promise<Task> {
    const prismaTask = await prisma.tareas.create({
      data: {
        id: task.getId(),
        projectId: task.getProjectId(),
        phaseId: task.getPhaseId() ?? undefined,
        milestoneId: task.getMilestoneId() ?? undefined,
        title: task.getTitle(),
        description: task.getDescription() ?? undefined,
        status: task.getStatus(),
        priority: task.getPriority(),
        assignedToId: task.getAssignedToId() ?? undefined,
        reportedById: task.getReportedById() ?? undefined,
        dueDate: task.getDueDate() ?? undefined,
        estimatedHours: task.getEstimatedHours() ?? undefined,
        spentHours: task.getSpentHours() ?? undefined,
        order: task.getOrder() ?? undefined,
        updatedAt: task.getUpdatedAt(),
      },
    });

    return this.toDomain(prismaTask);
  }

  async findById(id: string): Promise<Task | null> {
    const prismaTask = await prisma.tareas.findUnique({ where: { id } });
    return prismaTask ? this.toDomain(prismaTask) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const prismaTasks = await prisma.tareas.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
    return prismaTasks.map((t) => this.toDomain(t));
  }

  async update(task: Task): Promise<Task> {
    const prismaTask = await prisma.tareas.update({
      where: { id: task.getId() },
      data: {
        title: task.getTitle(),
        description: task.getDescription() ?? undefined,
        status: task.getStatus(),
        priority: task.getPriority(),
        assignedToId: task.getAssignedToId() ?? undefined,
        reportedById: task.getReportedById() ?? undefined,
        dueDate: task.getDueDate() ?? undefined,
        estimatedHours: task.getEstimatedHours() ?? undefined,
        spentHours: task.getSpentHours() ?? undefined,
        order: task.getOrder() ?? undefined,
        updatedAt: task.getUpdatedAt(),
        completedAt: task.getCompletedAt() ?? undefined,
        deletedAt: task['deletedAt'] ?? undefined,
      },
    });

    return this.toDomain(prismaTask);
  }

  async delete(id: string): Promise<void> {
    // Soft delete: set deletedAt timestamp to preserve history
    await prisma.tareas.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async findCalendarTasks(params: {
    userId: string;
    startDate: Date;
    endDate: Date;
    filterType: 'all' | 'creado' | 'asignado';
  }): Promise<TaskWithProject[]> {
    const { userId, startDate, endDate, filterType } = params;

    // Build user-specific filter based on filterType
    const userFilter = filterType === 'creado'
      ? { reportedById: userId }
      : filterType === 'asignado'
      ? { assignedToId: userId }
      : {};

    const tasks = await prisma.tareas.findMany({
      where: {
        // Date range filter
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
        // Exclude soft-deleted tasks
        deletedAt: null,
        // User-specific filter
        ...userFilter,
        // Project access filter: user is member OR creator
        projects: {
          OR: [
            { createdById: userId },
            {
              members: {
                some: { userId: userId }
              }
            }
          ]
        }
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            code: true,
            status: true,
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });

    return tasks.map((task) => ({
      task: this.toDomain(task),
      project: {
        id: task.projects.id,
        name: task.projects.name,
        code: task.projects.code,
        status: task.projects.status,
      }
    }));
  }

  private toDomain(prismaTask: any): Task {
    return new Task({
      id: prismaTask.id,
      projectId: prismaTask.projectId,
      phaseId: prismaTask.phaseId,
      milestoneId: prismaTask.milestoneId,
      title: prismaTask.title,
      description: prismaTask.description,
      status: prismaTask.status,
      priority: prismaTask.priority,
      assignedToId: prismaTask.assignedToId,
      reportedById: prismaTask.reportedById,
      dueDate: prismaTask.dueDate,
      estimatedHours: prismaTask.estimatedHours ? Number(prismaTask.estimatedHours) : undefined,
      spentHours: prismaTask.spentHours ? Number(prismaTask.spentHours) : undefined,
      order: prismaTask.order,
      createdAt: prismaTask.createdAt,
      updatedAt: prismaTask.updatedAt,
      completedAt: prismaTask.completedAt,
      deletedAt: prismaTask.deletedAt,
    });
  }
}

export default PrismaTaskRepository;
