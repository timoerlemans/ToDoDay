import { Component, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { Task, TaskStatus } from '../../../core/models/task';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaskService } from '../../../core/services/task.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '@supabase/supabase-js';

/**
 * Base component for task-related functionality.
 * Provides common task operations and state management.
 */
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
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user: User | null) => {
        if (!user) {
          void this.router.navigate(['/login']);
        }
      });
  }

  /**
   * Loads tasks and separates them into active and completed tasks
   */
  protected loadTasks(): void {
    this.taskService.getTasks()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tasks: Task[]) => {
        this.activeTasks = tasks.filter((task) => task.status !== TaskStatus.DONE);
        this.completedTasks = tasks.filter((task) => task.status === TaskStatus.DONE);
        this.availableProjects = [...new Set(tasks
          .filter((task): task is Task & { project: string } => task.project !== undefined)
          .map(task => task.project)
        )];
      });
  }

  /**
   * Creates a new task
   */
  protected createTask(task: Task): void {
    this.taskService.createTask(task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadTasks();
      });
  }

  /**
   * Updates task status
   */
  protected updateTaskStatus(taskId: string, status: TaskStatus): void {
    this.taskService.updateTask(taskId, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadTasks();
      });
  }

  /**
   * Deletes a task
   */
  protected deleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.loadTasks();
      });
  }
}
