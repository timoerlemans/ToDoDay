import { Component, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { Task, TaskStatus } from '../../../core/models/task';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskService } from '../../../core/services/task.service';

/**
 * Base component for task-related functionality.
 * Provides common task operations and state management.
 */
@Component({
  template: '',
})
export abstract class TaskBaseComponent {
  protected activeTasks: Task[] = [];
  protected completedTasks: Task[] = [];
  protected availableProjects: string[] = [];

  constructor(
    protected readonly router: Router,
    protected readonly destroyRef: DestroyRef,
    protected readonly taskService: TaskService,
    protected readonly notificationService: NotificationService,
    protected readonly authService: AuthService
  ) {
    this.setupAuthGuard();
  }

  /**
   * Sets up authentication guard to redirect to login if user is not authenticated
   */
  private setupAuthGuard(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  /**
   * Loads tasks and separates them into active and completed tasks
   */
  protected loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks: Task[]) => {
        this.activeTasks = tasks.filter((task) => {
          return task.status !== TaskStatus.DONE;
        });
        this.completedTasks = tasks.filter((task) => {
          return task.status === TaskStatus.DONE;
        });
        this.availableProjects = [...new Set(tasks
          .map((task) => task.project)
          .filter((project): project is string => {
            return project !== undefined;
          })
        )];
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to load tasks');
        console.error('Error loading tasks:', error);
      },
    });
  }

  /**
   * Creates a new task
   */
  protected createTask(task: Task): void {
    this.taskService.createTask(task).subscribe({
      next: () => {
        this.notificationService.success('Task created successfully');
        this.loadTasks();
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to create task');
        console.error('Error creating task:', error);
      },
    });
  }

  /**
   * Updates task status
   */
  protected updateTaskStatus(taskId: string, status: TaskStatus): void {
    this.taskService.updateTask(taskId, { status }).subscribe({
      next: () => {
        this.notificationService.success('Task status updated');
        this.loadTasks();
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to update task status');
        console.error('Error updating task status:', error);
      },
    });
  }

  /**
   * Deletes a task
   */
  protected deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId).subscribe({
      next: () => {
        this.notificationService.success('Task deleted');
        this.loadTasks();
      },
      error: (error: Error) => {
        this.notificationService.error('Failed to delete task');
        console.error('Error deleting task:', error);
      },
    });
  }
}
