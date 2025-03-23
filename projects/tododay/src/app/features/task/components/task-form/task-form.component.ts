import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Task, TaskPriority } from '../../../../core/models/task';

interface TaskForm {
  title: FormControl<string>;
  description: FormControl<string>;
  priority: FormControl<TaskPriority>;
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
    priority: new FormControl<TaskPriority>(TaskPriority.MEDIUM, {
      nonNullable: true
    })
  });

  TaskPriority = TaskPriority;

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
