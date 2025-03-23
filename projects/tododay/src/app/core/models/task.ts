export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  project?: string;
  labels?: string[];
  due_date?: string;
  start_date?: string;
  notify_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  project?: string;
  labels?: string[];
  priority?: TaskPriority;
  due_date?: Date;
  start_date?: Date;
  status?: TaskStatus;
  notify_at?: Date;
  created_at: Date;
  updated_at: Date;
  user_id: string;
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

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  project?: string;
  labels?: string[];
  due_date?: Date;
  start_date?: Date;
  notify_at?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  project?: string;
  labels?: string[];
  due_date?: Date;
  start_date?: Date;
  notify_at?: Date;
}
