import { Component, EventEmitter, input, Output } from '@angular/core';
import { Task, TaskStatus } from '@tododay/core/models/task';

/**
 * Component that displays and manages a single task item.
 * Provides UI for viewing task details and performing actions like status changes and deletion.
 */
@Component({
    selector: 'app-task-item',
    templateUrl: './task-item.component.html',
    styleUrls: ['./task-item.component.scss'],
    standalone: false
})
export class TaskItemComponent {
  /**
   * The task to be displayed and managed by this component.
   * Required input that must be provided by the parent component.
   */
  task = input.required<Task>();

  /**
   * Event emitted when the task's status is changed.
   * Emits an object containing the new status.
   */
  @Output() statusChange = new EventEmitter<{ status: TaskStatus }>();

  /**
   * Event emitted when the task is deleted.
   * Emits the task ID.
   */
  @Output() delete = new EventEmitter<string>();

  /**
   * Event emitted when the task is edited.
   * Emits the complete task object.
   */
  @Output() edit = new EventEmitter<Task>();

  /**
   * Reference to the TaskStatus enum for use in the template.
   */
  TaskStatus = TaskStatus;

  /**
   * Handles task status change events.
   * Emits the new status via the statusChange output.
   *
   * @param status - The new status as a string
   */
  onStatusChange(status: string): void {
    this.statusChange.emit({ status: status as TaskStatus });
  }

  /**
   * Handles task deletion.
   * Emits the task ID via the delete output.
   */
  onDelete(): void {
    this.delete.emit(this.task().id);
  }

  /**
   * Handles task edit action.
   * Emits the complete task object via the edit output.
   */
  onEdit(): void {
    this.edit.emit(this.task());
  }
}
