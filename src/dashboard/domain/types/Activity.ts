export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_completed' | 'comment_added';
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}
