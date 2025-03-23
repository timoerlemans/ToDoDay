import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { Task, TaskStatus } from '../../../core/models/task';
import { TaskService } from '../../../core/services/task.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskBaseComponent } from '../task-base.component';

/**
 * Task list component that displays and manages tasks.
 * Provides functionality to create, update, and delete tasks.
 */
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent extends TaskBaseComponent {
  constructor(
    router: Router,
    destroyRef: DestroyRef,
    taskService: TaskService,
    notificationService: NotificationService,
    authService: AuthService
  ) {
    super(router, destroyRef, taskService, notificationService, authService);
    this.loadTasks();
  }

  /**
   * Handles task submission from the task form
   */
  onTaskSubmit(task: Task): void {
    this.createTask(task);
  }

  /**
   * Handles task status changes
   */
  onStatusChange(taskId: string, event: { status: TaskStatus }): void {
    this.updateTaskStatus(taskId, event.status);
  }

  /**
   * Handles task deletion
   */
  onDeleteTask(taskId: string): void {
    this.deleteTask(taskId);
  }
}
