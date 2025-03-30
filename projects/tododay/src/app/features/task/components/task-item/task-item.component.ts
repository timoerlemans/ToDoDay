import { Component, EventEmitter, input, Output } from '@angular/core';
import { Task, TaskStatus } from '@tododay/core/models/task';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
})
export class TaskItemComponent {
  task = input.required<Task>();
  @Output() statusChange = new EventEmitter<{ status: TaskStatus }>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Task>();

  TaskStatus = TaskStatus;

  onStatusChange(status: string): void {
    this.statusChange.emit({ status: status as TaskStatus });
  }

  onDelete(): void {
    this.delete.emit(this.task().id);
  }

  onEdit(): void {
    this.edit.emit(this.task());
  }
}
