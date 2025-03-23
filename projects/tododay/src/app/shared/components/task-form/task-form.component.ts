import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
    selector: 'app-task-form',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './task-form.component.html',
    styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  TaskPriority = TaskPriority;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      project: [''],
      dueDate: [null],
      priority: [TaskPriority.MEDIUM]
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.taskForm.valid) {
      const task: Task = {
        ...this.taskForm.value,
        id: Date.now().toString(),
        status: 'TODO',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.taskService.addTask(task);
      this.taskForm.reset({ priority: TaskPriority.MEDIUM });
    }
  }

  protected getErrorMessage(field: string): string {
    const control = this.taskForm.get(field);
    if (control?.errors?.['required']) return 'Dit veld is verplicht';
    if (control?.errors?.['minlength']) return `Minimaal ${control.errors['minlength'].requiredLength} karakters`;
    return '';
  }
}
