import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskFormData, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'tododay-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  @Output() submitTask = new EventEmitter<TaskFormData>();

  taskForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    project: new FormControl(''),
    dueDate: new FormControl<Date | null>(null),
    priority: new FormControl(TaskPriority.MEDIUM)
  });

  protected readonly TaskPriority = TaskPriority;

  constructor() {}

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.submitTask.emit(this.taskForm.value as TaskFormData);
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
