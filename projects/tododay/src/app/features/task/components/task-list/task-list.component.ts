import { ChangeDetectionStrategy, Component, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Task, TaskStatus } from '@tododay/core/models/task';
import { TaskService } from '@tododay/core/services/task.service';
import { NotificationService } from '@tododay/core/services/notification.service';
import { AuthService } from '@tododay/core/services/auth.service';
import { TaskBaseComponent } from '@tododay/features/task/components/task-base.component';

/**
 * Task list component that displays and manages tasks.
 * Provides functionality to create, update, and delete tasks.
 */
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskListComponent extends TaskBaseComponent {
  constructor(
    router: Router,
    destroyRef: DestroyRef,
    taskService: TaskService,
    notificationService: NotificationService,
    authService: AuthService,
    cdr: ChangeDetectorRef
  ) {
    super(router, destroyRef, taskService, notificationService, authService, cdr);
  }

  /**
   * Handles task submission from the task form
   */
  onTaskSubmit(task: Task): void {
    this.taskService
      .createTask(task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task created successfully');
        },
        error: (error: Error) => {
          this.notificationService.error('Failed to create task');
        },
      });
  }

  /**
   * Handles task status changes
   */
  onStatusChange(taskId: string, event: { status: TaskStatus }): void {
    this.taskService
      .updateTask(taskId, { status: event.status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task status updated successfully');
        },
        error: (error: Error) => {
          this.notificationService.error('Failed to update task status');
        },
      });
  }

  /**
   * Handles task deletion
   */
  onDeleteTask(taskId: string): void {
    this.taskService
      .deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task deleted successfully');
        },
        error: (error: Error) => {
          this.notificationService.error('Failed to delete task');
        },
      });
  }
}
