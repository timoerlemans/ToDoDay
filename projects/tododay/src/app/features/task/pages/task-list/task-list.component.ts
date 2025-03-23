import { ChangeDetectionStrategy, Component, inject, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Task, TaskStatus, TaskFormData } from '@tododay/app/core/models/task';
import { TaskService } from '@tododay/app/core/services/task.service';
import { NotificationService } from '@tododay/app/core/services/notification.service';
import { AuthService } from '@tododay/app/core/services/auth.service';
import { TaskFormComponent } from '@tododay/app/shared/components/task-form/task-form.component';
import { TaskItemComponent } from '@tododay/app/shared/components/task-item/task-item.component';
import { ThemeToggleComponent } from '@tododay/app/shared/components/theme-toggle/theme-toggle.component';

@Component({
    selector: 'app-task-list',
    templateUrl: './task-list.component.html',
    styleUrls: ['./task-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent {
  protected activeTasks: Task[] = [];
  protected completedTasks: Task[] = [];
  protected availableProjects: string[] = [];

  private readonly taskService = inject(TaskService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe(user => {
        if (!user) {
          this.router.navigate(['/login']);
        }
      });
  }

  private loadTasks(): void {
    this.taskService.getTasks()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (tasks) => {
          this.activeTasks = tasks.filter(task => task.status !== TaskStatus.DONE);
          this.completedTasks = tasks.filter(task => task.status === TaskStatus.DONE);
          this.availableProjects = [...new Set(tasks
            .map(task => task.project)
            .filter((project): project is string => project !== undefined)
          )];
        },
        error: (err) => {
          this.notificationService.show('Er is een fout opgetreden bij het laden van de taken', 'error');
          if (isDevMode()) {
            console.error('Error loading tasks:', err);
          }
        }
      });
  }

  onTaskSubmit(taskData: TaskFormData): void {
    this.taskService.createTask(taskData)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.notificationService.show('Taak succesvol toegevoegd', 'success');
          this.loadTasks();
        },
        error: (err) => {
          this.notificationService.show('Er is een fout opgetreden bij het toevoegen van de taak', 'error');
          if (isDevMode()) {
            console.error('Error creating task:', err);
          }
        }
      });
  }

  onStatusChange(taskId: string, event: { status: TaskStatus }): void {
    this.taskService.updateTask(taskId, { status: event.status })
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.notificationService.show('Taakstatus bijgewerkt', 'success');
          this.loadTasks();
        },
        error: (err) => {
          this.notificationService.show('Er is een fout opgetreden bij het bijwerken van de taakstatus', 'error');
          if (isDevMode()) {
            console.error('Error updating task status:', err);
          }
        }
      });
  }

  onDeleteTask(taskId: string): void {
    this.taskService.deleteTask(taskId)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.notificationService.show('Taak verwijderd', 'success');
          this.loadTasks();
        },
        error: (err) => {
          this.notificationService.show('Er is een fout opgetreden bij het verwijderen van de taak', 'error');
          if (isDevMode()) {
            console.error('Error deleting task:', err);
          }
        }
      });
  }
}
