import { Task } from '../entities/Task';

export interface TaskWithProject {
  task: Task;
  project: {
    id: string;
    name: string;
    code: string;
    status: string;
  };
}

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByProjectId(projectId: string): Promise<Task[]>;
  update(task: Task): Promise<Task>;
  delete(id: string): Promise<void>;
  findCalendarTasks(params: {
    userId: string;
    startDate: Date;
    endDate: Date;
    filterType: 'all' | 'creado' | 'asignado';
  }): Promise<TaskWithProject[]>;
}

export default ITaskRepository;
