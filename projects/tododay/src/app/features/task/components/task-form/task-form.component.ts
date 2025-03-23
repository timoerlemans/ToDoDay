import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Task, TaskPriority } from '../../../../core/models/task';

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
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent {
  @Input() task?: Task;
  @Output() submitted = new EventEmitter<Task>();

  taskForm = new FormGroup<TaskForm>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    priority: new FormControl<TaskPriority | null>(null),
    project: new FormControl<string | null>(null),
    labels: new FormControl<string[] | null>(null),
    due_date: new FormControl<string | null>(null),
    start_date: new FormControl<string | null>(null),
    notify_at: new FormControl<string | null>(null)
  });

  TaskPriority = TaskPriority;

  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description || '',
        priority: this.task.priority || null,
        project: this.task.project || null,
        labels: this.task.labels || null,
        due_date: this.task.due_date ? new Date(this.task.due_date).toISOString().split('T')[0] : null,
        start_date: this.task.start_date ? new Date(this.task.start_date).toISOString().split('T')[0] : null,
        notify_at: this.task.notify_at ? new Date(this.task.notify_at).toISOString().split('T')[0] : null
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.submitted.emit(this.taskForm.getRawValue() as Task);
      this.taskForm.reset();
    }
  }

  protected getErrorMessage(field: string): string {
    const control = this.taskForm.get(field);
    if (control?.errors?.['required']) return 'Dit veld is verplicht';
    if (control?.errors?.['minlength']) return `Minimaal ${control.errors['minlength'].requiredLength} karakters`;
    return '';
  }
}
