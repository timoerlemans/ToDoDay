import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskService } from '@tododay/shared/services/task.service';
import { Task, TaskPriority } from '@tododay/shared/models/task.model';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule],
    templateUrl: './task-form.component.html',
    styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  taskForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    project: new FormControl(''),
    dueDate: new FormControl<Date | null>(null),
    priority: new FormControl(TaskPriority.MEDIUM)
  });

  TaskPriority = TaskPriority;

  constructor(private taskService: TaskService) {}

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
