import { Component, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '@tododay/shared/components/task-item/task-item.component';
import { TaskService } from '@tododay/shared/services/task.service';
import { Task, TaskStatus } from '@tododay/shared/models/task.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  template: `
    <div class="space-y-4">
      <div *ngFor="let task of tasks" class="task-item">
        <app-task-item
          [task]="task"
          (statusChange)="onStatusChange($event)"
          (delete)="onDelete($event)"
        ></app-task-item>
      </div>
    </div>
  `,
  styles: [`
    .task-item {
      margin-bottom: 1rem;
    }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private destroyRef: DestroyRef
  ) {
    this.taskService.tasks$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(tasks => {
        this.tasks = tasks;
      });
  }

  ngOnInit(): void {}

  onStatusChange(event: { taskId: string; status: TaskStatus }): void {
    const task = this.taskService.getTaskById(event.taskId);
    if (task) {
      this.taskService.updateTask({
        ...task,
        status: event.status
      });
    }
  }

  onDelete(taskId: string): void {
    this.taskService.deleteTask(taskId);
  }
} 