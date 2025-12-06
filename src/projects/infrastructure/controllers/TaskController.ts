import { Request, Response } from 'express';
import { PrismaTaskRepository } from '../repositories/PrismaTaskRepository';
import { PrismaProjectMemberRepository } from '../repositories/PrismaProjectMemberRepository';
import { PrismaProjectRepository } from '../repositories/PrismaProjectRepository';
import { Task } from '../../domain/entities/Task';
import { v4 as uuidv4 } from 'uuid';

const taskRepo = new PrismaTaskRepository();
const memberRepo = new PrismaProjectMemberRepository();
const projectRepo = new PrismaProjectRepository();

export class TaskController {
  // List tasks by projectId (query param) or return error
  getTasks = async (req: Request, res: Response): Promise<Response | void> => {
    const { projectId } = req.query;
    try {
      if (projectId && typeof projectId === 'string') {
        const tasks = await taskRepo.findByProjectId(projectId);
        return res.status(200).json({ success: true, data: { tasks } });
      }

      return res.status(400).json({ success: false, message: 'projectId is required' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  // Get task by id
  getTaskById = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    try {
      const task = await taskRepo.findById(id);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      return res.status(200).json({ success: true, data: { task } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  // Create task
  createTask = async (req: Request, res: Response): Promise<Response | void> => {
    const body = req.body;
    const userId = (req as any).user?.userId;
    try {
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const { projectId, title } = body;
      if (!projectId || !title) return res.status(400).json({ success: false, message: 'projectId and title are required' });

      // Check project exists
      const project = await projectRepo.findById(projectId);
      if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

      // Check membership
      const member = await memberRepo.findByProjectAndUser(projectId, userId);
      if (!member && project.getCreatedById() !== userId) {
        return res.status(403).json({ success: false, message: 'User is not a member of the project' });
      }

      // Validar que assignedToId sea miembro del proyecto (si se proporciona)
      if (body.assignedToId) {
        const assignedMember = await memberRepo.findByProjectAndUser(projectId, body.assignedToId);
        const isCreator = project.getCreatedById() === body.assignedToId;
        
        if (!assignedMember && !isCreator) {
          return res.status(400).json({ 
            success: false, 
            message: 'The assigned user is not a member of this project' 
          });
        }
      }

      const id = uuidv4();
      const now = new Date();
      const taskEntity = new Task({
        id,
        projectId,
        phaseId: body.phaseId ?? null,
        milestoneId: body.milestoneId ?? null,
        title: body.title,
        description: body.description ?? null,
        status: body.status ?? 'backlog',
        priority: body.priority ?? 'media',
        assignedToId: body.assignedToId ?? null,
        reportedById: body.reportedById ?? userId,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours ?? null,
        spentHours: body.spentHours ?? null,
        order: body.order ?? null,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
        deletedAt: null,
      });

      const created = await taskRepo.create(taskEntity);
      return res.status(201).json({ success: true, data: { task: created } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  // Update task
  updateTask = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    const body = req.body;
    const userId = (req as any).user?.userId;
    try {
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const existing = await taskRepo.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });

      // Check membership on project
      const member = await memberRepo.findByProjectAndUser(existing.getProjectId(), userId);
      const project = await projectRepo.findById(existing.getProjectId());
      if (!member && project?.getCreatedById() !== userId) {
        return res.status(403).json({ success: false, message: 'User is not allowed to modify this task' });
      }

      // Merge fields
      const updatedProps = {
        id: existing.getId(),
        projectId: existing.getProjectId(),
        phaseId: body.phaseId ?? existing.getPhaseId() ?? null,
        milestoneId: body.milestoneId ?? existing.getMilestoneId() ?? null,
        title: body.title ?? existing.getTitle(),
        description: body.description ?? existing.getDescription() ?? null,
        status: body.status ?? existing.getStatus(),
        priority: body.priority ?? existing.getPriority(),
        assignedToId: body.assignedToId ?? existing.getAssignedToId() ?? null,
        reportedById: body.reportedById ?? existing.getReportedById() ?? null,
        dueDate: body.dueDate ? new Date(body.dueDate) : existing.getDueDate() ?? null,
        estimatedHours: body.estimatedHours ?? existing.getEstimatedHours() ?? null,
        spentHours: body.spentHours ?? existing.getSpentHours() ?? null,
        order: body.order ?? existing.getOrder() ?? null,
        createdAt: existing.getCreatedAt(),
        updatedAt: new Date(),
        completedAt: body.completedAt ? new Date(body.completedAt) : existing.getCompletedAt() ?? null,
        deletedAt: (existing as any)['deletedAt'] ?? null,
      } as any;

      const taskEntity = new Task(updatedProps);
      const updated = await taskRepo.update(taskEntity);
      return res.status(200).json({ success: true, data: { task: updated } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  // Delete (soft delete)
  deleteTask = async (req: Request, res: Response): Promise<Response | void> => {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    try {
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      const existing = await taskRepo.findById(id);
      if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });

      const member = await memberRepo.findByProjectAndUser(existing.getProjectId(), userId);
      const project = await projectRepo.findById(existing.getProjectId());
      if (!member && project?.getCreatedById() !== userId) {
        return res.status(403).json({ success: false, message: 'User is not allowed to delete this task' });
      }

      await taskRepo.delete(id);
      return res.status(200).json({ success: true, message: 'Task deleted' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  // Get calendar tasks across all user projects
  getCalendarTasks = async (req: Request, res: Response): Promise<Response | void> => {
    const userId = (req as any).user?.userId;
    const { startDate, endDate, filter = 'all' } = req.query;

    try {
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Parse dates with defaults
      const now = new Date();
      const parsedStartDate = startDate
        ? new Date(startDate as string)
        : new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month

      const parsedEndDate = endDate
        ? new Date(endDate as string)
        : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // End of current month

      // Validate dates
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid startDate format. Use ISO 8601 format.' });
      }
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid endDate format. Use ISO 8601 format.' });
      }
      if (parsedEndDate < parsedStartDate) {
        return res.status(400).json({ success: false, message: 'endDate must be after startDate' });
      }

      // Validate filter type
      if (!['all', 'creado', 'asignado'].includes(filter as string)) {
        return res.status(400).json({
          success: false,
          message: 'filter must be one of: all, creado, asignado'
        });
      }

      const results = await taskRepo.findCalendarTasks({
        userId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        filterType: filter as 'all' | 'creado' | 'asignado'
      });

      return res.status(200).json({
        success: true,
        data: {
          tasks: results,
          meta: {
            startDate: parsedStartDate.toISOString(),
            endDate: parsedEndDate.toISOString(),
            filter,
            count: results.length
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  };
}

export default TaskController;
