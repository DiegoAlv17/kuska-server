import { prisma } from '../../../auth/infrastructure/persistence/PrismaClient';
import { Task } from '../../domain/entities/Task';
import { ITaskRepository } from '../../domain/repositories/ITaskRepository';

export class PrismaTaskRepository implements ITaskRepository {
  async create(task: Task): Promise<Task> {
    const db: any = prisma as any;
    const prismaTask = await db.task.create({
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
      },
    });

    return this.toDomain(prismaTask);
  }

  async findById(id: string): Promise<Task | null> {
    const db: any = prisma as any;
    const prismaTask = await db.task.findUnique({ where: { id } });
    return prismaTask ? this.toDomain(prismaTask) : null;
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const db: any = prisma as any;
    const prismaTasks = await db.task.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
    return prismaTasks.map((t) => this.toDomain(t));
  }

  async update(task: Task): Promise<Task> {
    const db: any = prisma as any;
    const prismaTask = await db.task.update({
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
    const db: any = prisma as any;
    // Soft delete: set deletedAt timestamp to preserve history (schema supports fecha_eliminacion)
    await db.task.update({ where: { id }, data: { deletedAt: new Date() } });
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
