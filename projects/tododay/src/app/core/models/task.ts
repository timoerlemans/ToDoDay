export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project?: string;
  dueDate?: Date;
  userId: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriority;
  project?: string;
  dueDate?: Date;
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
