import { Component, input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from '@tododay/shared/models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  task = input.required<Task>();
  @Output() statusChange = new EventEmitter<{ taskId: string; status: TaskStatus }>();
  @Output() delete = new EventEmitter<string>();

  TaskStatus = TaskStatus;

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusChange.emit({
      taskId: this.task().id,
      status: select.value as TaskStatus
    });
  }

  onDelete(): void {
    this.delete.emit(this.task().id);
  }
}
