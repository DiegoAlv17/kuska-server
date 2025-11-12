export interface MilestoneProps {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  dueDate: Date;
  status?: string;
  progress?: number;
  createdById?: string | null;
  completedAt?: Date | null;
  createdAt: Date;
}

export class Milestone {
  private readonly id: string;
  private projectId: string;
  private name: string;
  private description?: string | null;
  private dueDate: Date;
  private status: string;
  private progress: number;
  private createdById?: string | null;
  private completedAt?: Date | null;
  private createdAt: Date;

  constructor(props: MilestoneProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.dueDate = props.dueDate;
    this.status = props.status ?? 'pendiente';
    this.progress = props.progress ?? 0;
    this.createdById = props.createdById ?? null;
    this.completedAt = props.completedAt ?? null;
    this.createdAt = props.createdAt;
  }

  getId(): string {
    return this.id;
  }
}

export default Milestone;
