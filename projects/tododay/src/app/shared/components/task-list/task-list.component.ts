import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '../task-item/task-item.component';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { Subscription } from 'rxjs';

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
export class TaskListComponent implements OnInit, OnDestroy {
  tasks: Task[] = [];
  private subscription: Subscription;

  constructor(private taskService: TaskService) {
    this.subscription = this.taskService.tasks$.subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

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