import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus } from '../../../core/models/task';

@Component({
  selector: 'tododay-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  @Input({ required: true }) task!: Task;
  @Output() statusChange = new EventEmitter<{ taskId: string; status: TaskStatus }>();
  @Output() delete = new EventEmitter<string>();

  protected readonly TaskStatus = TaskStatus;

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusChange.emit({
      taskId: this.task.id,
      status: select.value as TaskStatus
    });
  }

  onDelete(): void {
    this.delete.emit(this.task.id);
  }
}
