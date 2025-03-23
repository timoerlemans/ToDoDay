import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { Task, TaskStatus } from '../../../../core/models/task';
import { TaskService } from '../../../../core/services/task.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthService } from '../../../../core/services/auth.service';
import { TaskBaseComponent } from '../task-base.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    this.taskService.createTask(task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task created successfully');
          this.loadTasks();
        },
        error: (error: Error) => {
          this.notificationService.error('Failed to create task');
        }
      });
  }

  /**
   * Handles task status changes
   */
  onStatusChange(taskId: string, event: { status: TaskStatus }): void {
    this.taskService.updateTask(taskId, { status: event.status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task status updated successfully');
          this.loadTasks();
        },
        error: (error: Error) => {
          this.notificationService.error('Failed to update task status');
        }
      });
  }

  /**
   * Handles task deletion
   */
  onDeleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task deleted successfully');
          this.loadTasks();
        },
        error: (error: Error) => {
          this.notificationService.error('Failed to delete task');
        }
      });
  }

  protected override loadTasks(): void {
    this.taskService.getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tasks: Task[]) => {
          this.activeTasks = tasks.filter((task) => task.status !== TaskStatus.DONE);
          this.completedTasks = tasks.filter((task) => task.status === TaskStatus.DONE);
        },
        error: (error: Error) => {
          this.notificationService.error('Failed to load tasks');
        }
      });
  }
}
