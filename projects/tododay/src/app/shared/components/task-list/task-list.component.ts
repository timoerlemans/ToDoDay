import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit } from '@angular/core';
import { TaskService } from '@tododay/shared/services/task.service';
import { Task, TaskStatus } from '@tododay/shared/models/task.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Component that displays a list of tasks.
 *
 * @description
 * The TaskListComponent is responsible for:
 * - Displaying a list of tasks
 * - Handling task status changes
 * - Handling task deletion
 * - Maintaining task list state
 */
@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];

  constructor(
    @Inject(TaskService) private readonly taskService: TaskService,
    @Inject(DestroyRef) private readonly destroyRef: DestroyRef
  ) {
    this.taskService.tasks$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tasks => {
        this.tasks = tasks;
      });
  }

  ngOnInit(): void {}

  /**
   * Tracks tasks in ngFor by their ID for better performance.
   *
   * @param index - The current index in the iteration
   * @param task - The current task object
   * @returns The task's unique identifier
   */
  trackByTaskId(_: number, task: Task): string {
    return task.id;
  }

  /**
   * Handles status changes for a task.
   *
   * @param event - Object containing the task ID and new status
   */
  onStatusChange(event: { taskId: string; status: TaskStatus }): void {
    const task = this.taskService.getTaskById(event.taskId);
    if (task) {
      this.taskService.updateTask({
        ...task,
        status: event.status
      });
    }
  }

  /**
   * Handles task deletion.
   *
   * @param taskId - The ID of the task to delete
   */
  onDelete(taskId: string): void {
    this.taskService.deleteTask(taskId);
  }
}
