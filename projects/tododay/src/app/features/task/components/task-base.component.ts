import { Component, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { User } from '@supabase/supabase-js';

import { Task, TaskStatus } from '@tododay/core/models/task';
import { AuthService } from '@tododay/core/services/auth.service';
import { NotificationService } from '@tododay/core/services/notification.service';
import { TaskService } from '@tododay/core/services/task.service';

/**
 * Base component for task-related functionality.
 * Provides common task operations and state management.
 */
export abstract class TaskBaseComponent {
  public activeTasks: Task[] = [];
  public completedTasks: Task[] = [];
  protected availableProjects: string[] = [];

  constructor(
    protected readonly router: Router,
    protected readonly destroyRef: DestroyRef,
    protected readonly taskService: TaskService,
    protected readonly notificationService: NotificationService,
    protected readonly authService: AuthService,
    protected readonly cdr: ChangeDetectorRef
  ) {
    this.setupAuthGuard();
    this.setupTaskSubscription();
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
   * Sets up subscription to task updates
   */
  private setupTaskSubscription(): void {
    this.taskService.tasks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tasks => {
      this.activeTasks = tasks.filter(task => !task.status || task.status !== TaskStatus.DONE);
      this.completedTasks = tasks.filter(task => task.status === TaskStatus.DONE);
      this.availableProjects = [
        ...new Set(
          tasks
            .filter((task): task is Task & { project: string } => task.project !== undefined)
            .map(task => task.project)
        ),
      ];
      this.cdr.markForCheck();
    });
  }

  /**
   * Creates a new task
   */
  protected createTask(task: Task): void {
    this.taskService
      .createTask(task)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: Error) => {
          console.error('Error creating task:', error);
          this.notificationService.error('Failed to create task');
        },
      });
  }

  /**
   * Updates task status
   */
  protected updateTaskStatus(taskId: string, status: TaskStatus): void {
    this.taskService
      .updateTask(taskId, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: Error) => {
          console.error('Error updating task:', error);
          this.notificationService.error('Failed to update task');
        },
      });
  }

  /**
   * Deletes a task
   */
  protected deleteTask(taskId: string): void {
    this.taskService
      .deleteTask(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: Error) => {
          console.error('Error deleting task:', error);
          this.notificationService.error('Failed to delete task');
        },
      });
  }
}
