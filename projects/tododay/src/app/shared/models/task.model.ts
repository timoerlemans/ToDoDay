export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  project?: string;
  dueDate?: Date;
}

export interface Task extends TaskFormData {
  id: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
} 