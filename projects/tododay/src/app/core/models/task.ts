export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  project?: string;
  labels?: string[];
  dueDate?: string;
  startDate?: string;
}

export interface Task extends TaskFormData {
  id: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatusChange {
  taskId: string;
  newStatus: TaskStatus;
}

export interface TaskEnrichment {
  project: string | null;
  labels: string[];
  priority: TaskPriority;
  dueDate: string | null;
  startDate: string | null;
}
