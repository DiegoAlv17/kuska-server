export interface TaskProps {
  id: string;
  projectId: string;
  phaseId?: string | null;
  milestoneId?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assignedToId?: string | null;
  reportedById?: string | null;
  dueDate?: Date | null;
  estimatedHours?: number | null;
  spentHours?: number | null;
  order?: number | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  deletedAt?: Date | null;
}

export class Task {
  private readonly id: string;
  private projectId: string;
  private phaseId?: string | null;
  private milestoneId?: string | null;
  private title: string;
  private description?: string | null;
  private status: string;
  private priority: string;
  private assignedToId?: string | null;
  private reportedById?: string | null;
  private dueDate?: Date | null;
  private estimatedHours?: number | null;
  private spentHours?: number | null;
  private order?: number | null;
  private createdAt: Date;
  private updatedAt: Date;
  private completedAt?: Date | null;
  private deletedAt?: Date | null;

  constructor(props: TaskProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.phaseId = props.phaseId ?? null;
    this.milestoneId = props.milestoneId ?? null;
    this.title = props.title;
    this.description = props.description ?? null;
    this.status = props.status;
    this.priority = props.priority;
    this.assignedToId = props.assignedToId ?? null;
    this.reportedById = props.reportedById ?? null;
    this.dueDate = props.dueDate ?? null;
    this.estimatedHours = props.estimatedHours ?? null;
    this.spentHours = props.spentHours ?? null;
    this.order = props.order ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.completedAt = props.completedAt ?? null;
    this.deletedAt = props.deletedAt ?? null;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getPhaseId(): string | null | undefined {
    return this.phaseId;
  }

  getMilestoneId(): string | null | undefined {
    return this.milestoneId;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string | null | undefined {
    return this.description;
  }

  getStatus(): string {
    return this.status;
  }

  getPriority(): string {
    return this.priority;
  }

  getAssignedToId(): string | null | undefined {
    return this.assignedToId;
  }

  getReportedById(): string | null | undefined {
    return this.reportedById;
  }

  getDueDate(): Date | null | undefined {
    return this.dueDate;
  }

  getEstimatedHours(): number | null | undefined {
    return this.estimatedHours;
  }

  getSpentHours(): number | null | undefined {
    return this.spentHours;
  }

  getOrder(): number | null | undefined {
    return this.order;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getCompletedAt(): Date | null | undefined {
    return this.completedAt;
  }

  // Business methods
  updateTitle(title: string): void {
    if (!title || title.trim().length === 0) throw new Error('Title cannot be empty');
    this.title = title;
    this.touch();
  }

  updateStatus(status: string): void {
    this.status = status;
    if (status === 'hecho' || status === 'done' || status === 'completed') {
      this.completedAt = new Date();
    }
    this.touch();
  }

  assignTo(userId: string | null): void {
    this.assignedToId = userId;
    this.touch();
  }

  touch(): void {
    this.updatedAt = new Date();
  }
}

export default Task;
