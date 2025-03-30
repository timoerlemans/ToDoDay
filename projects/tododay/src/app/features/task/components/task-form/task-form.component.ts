import { Component, EventEmitter, input, Output, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Task, TaskPriority, CreateTaskDto, TaskStatus } from '@tododay/core/models/task';

interface TaskForm {
  title: FormControl<string>;
  description: FormControl<string>;
  priority: FormControl<TaskPriority | null>;
  project: FormControl<string | null>;
  labels: FormControl<string[] | null>;
  due_date: FormControl<string | null>;
  start_date: FormControl<string | null>;
  notify_at: FormControl<string | null>;
}

@Component({
    selector: 'app-task-form',
    templateUrl: './task-form.component.html',
    styleUrls: ['./task-form.component.scss'],
    standalone: false
})
export class TaskFormComponent implements OnInit {
  task = input<Task | undefined>(undefined);
  @Output() submitted = new EventEmitter<Task>();

  taskForm = new FormGroup<TaskForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    priority: new FormControl<TaskPriority | null>(null),
    project: new FormControl<string | null>(null),
    labels: new FormControl<string[] | null>(null),
    due_date: new FormControl<string | null>(null),
    start_date: new FormControl<string | null>(null),
    notify_at: new FormControl<string | null>(null),
  });

  TaskPriority = TaskPriority;

  ngOnInit(): void {
    if (this.task()) {
      const taskData = this.task();
      this.taskForm.patchValue({
        title: taskData!.title,
        description: taskData!.description || '',
        priority: taskData!.priority || null,
        project: taskData!.project || null,
        labels: taskData!.labels || null,
        due_date: taskData!.due_date
          ? new Date(taskData!.due_date).toISOString().split('T')[0]
          : null,
        start_date: taskData!.start_date
          ? new Date(taskData!.start_date).toISOString().split('T')[0]
          : null,
        notify_at: taskData!.notify_at
          ? new Date(taskData!.notify_at).toISOString().split('T')[0]
          : null,
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formData = this.taskForm.getRawValue();
      const taskData: CreateTaskDto = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority || undefined,
        project: formData.project || undefined,
        labels: formData.labels || undefined,
        due_date: formData.due_date ? new Date(formData.due_date) : undefined,
        start_date: formData.start_date ? new Date(formData.start_date) : undefined,
        notify_at: formData.notify_at ? new Date(formData.notify_at) : undefined,
        status: TaskStatus.TODO,
      };
      this.submitted.emit(taskData as unknown as Task);
      this.taskForm.reset();
    }
  }

  protected getErrorMessage(field: string): string {
    const control = this.taskForm.get(field);
    if (control?.errors?.['required']) return 'Dit veld is verplicht';
    if (control?.errors?.['minlength'])
      return `Minimaal ${control.errors['minlength'].requiredLength} karakters`;
    return '';
  }
}
