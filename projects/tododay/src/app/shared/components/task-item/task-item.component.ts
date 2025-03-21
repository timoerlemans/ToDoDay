import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskStatus } from '@tododay/app/core/models/task';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() statusChange = new EventEmitter<{ taskId: string; status: TaskStatus }>();
  @Output() deleteTask = new EventEmitter<string>();

  protected readonly TaskStatus = TaskStatus;

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusChange.emit({ taskId: this.task.id, status: select.value as TaskStatus });
  }

  onDelete(): void {
    this.deleteTask.emit(this.task.id);
  }
}
