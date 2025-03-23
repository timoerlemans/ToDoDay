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

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
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
  dueDate?: Date;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
}
