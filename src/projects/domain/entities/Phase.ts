export interface PhaseProps {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  order: number;
  startDate?: Date | null;
  endDate?: Date | null;
  isCompleted?: boolean;
  completedAt?: Date | null;
  createdAt: Date;
}

export class Phase {
  private readonly id: string;
  private projectId: string;
  private name: string;
  private description?: string | null;
  private order: number;
  private startDate?: Date | null;
  private endDate?: Date | null;
  private isCompleted: boolean;
  private completedAt?: Date | null;
  private createdAt: Date;

  constructor(props: PhaseProps) {
    this.id = props.id;
    this.projectId = props.projectId;
    this.name = props.name;
    this.description = props.description ?? null;
    this.order = props.order;
    this.startDate = props.startDate ?? null;
    this.endDate = props.endDate ?? null;
    this.isCompleted = props.isCompleted ?? false;
    this.completedAt = props.completedAt ?? null;
    this.createdAt = props.createdAt;
  }

  getId(): string {
    return this.id;
  }

  getProjectId(): string {
    return this.projectId;
  }

  getName(): string {
    return this.name;
  }

  isDone(): boolean {
    return this.isCompleted;
  }
}

export default Phase;
