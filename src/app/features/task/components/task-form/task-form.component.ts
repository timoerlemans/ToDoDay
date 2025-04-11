import { Component, EventEmitter, input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateTaskDto, Task, TaskPriority, TaskStatus } from '@tododay/core/models/task';
import { signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Interface for the task form data structure
 */
interface TaskForm {
  smartInput: FormControl<string>; // Smart input field for natural language parsing
  title: FormControl<string>;
  description: FormControl<string>;
  priority: FormControl<TaskPriority | null>;
  project: FormControl<string | null>;
  labels: FormControl<string[] | null>;
  due_date: FormControl<string | null>;
  start_date: FormControl<string | null>;
  notify_at: FormControl<string | null>;
}

/**
 * Interface for parsed task data from natural language input
 * Used to store the result of natural language parsing
 */
interface ParsedTaskData {
  title: string;
  description?: string;
  project?: string;
  priority?: TaskPriority;
  labels?: string[];
  due_date?: Date;
  start_date?: Date;
  notify_at?: Date;
}

@Component({
  selector: 'app-task-form',
  standalone: false,
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss']
})
export class TaskFormComponent implements OnInit {
  task = input<Task | undefined>(undefined);
  @Output() submitted = new EventEmitter<Task>();

  // Signal to track if the detailed fields are visible
  showDetailedFields = signal<boolean>(false);

  taskForm = new FormGroup<TaskForm>({
    // Smart input field for natural language parsing (required)
    smartInput: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)]
    }),
    // Other fields are now optional
    title: new FormControl('', {
      nonNullable: true
    }),
    description: new FormControl('', {
      nonNullable: true
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
    if (this.task()) {
      const taskData = this.task();
      // When editing an existing task, populate the smart input with the task title
      // and show detailed fields by default
      this.showDetailedFields.set(true);
      this.taskForm.patchValue({
        smartInput: taskData!.title, // Populate smart input with existing task's title
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
          : null
      });
    }

    // Listen to changes on the smart input to populate other fields
    // using the natural language parser
    this.taskForm
      .get('smartInput')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe(value => {
        if (value && value.length > 3) {
          this.populateFieldsFromSmartInput(value);
        }
      });
  }

  /**
   * Toggles the visibility of detailed fields
   */
  toggleDetailedFields(): void {
    this.showDetailedFields.update(value => !value);
  }
  /**
   * Parse the smart input text into structured task data
   * This is a placeholder method that will be implemented in the future
   * @param text The natural language input text
   * @returns Parsed task data object
   */
  parseSmartInput(text: string): ParsedTaskData | null {
    // This is a placeholder for future implementation
    // In the future, this will use NLP or pattern matching to extract:
    // - Task title (required)
    // - Project designation (prefixed with @ symbol)
    // - Labels (prefixed with # symbol)
    // - Due dates (date expressions like "tomorrow", "next week", etc.)
    // - Priority indicators (high, medium, low)

    // For now, just return the text as the title
    return {
      title: text
      // Other fields will be extracted in the future implementation
    };
  }

  /**
   * Updates form fields based on parsed smart input
   * @param text The smart input text to parse
   */
  populateFieldsFromSmartInput(text: string): void {
    const parsedData = this.parseSmartInput(text);

    if (parsedData) {
      // Only update the title field for now
      // In the future, this will update all fields based on parsed data
      this.taskForm.patchValue({
        title: parsedData.title
      });

      // Don't reset the smart input field itself
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const formData = this.taskForm.getRawValue();

      // Try to parse smart input first if it's filled in
      let parsedData: ParsedTaskData | null = null;
      if (formData.smartInput) {
        parsedData = this.parseSmartInput(formData.smartInput);
      }

      // Create task combining both smart input parsing and manual fields
      const taskData: CreateTaskDto = {
        // Use parsed title or fall back to manual title field
        title: parsedData?.title || formData.title || formData.smartInput,
        // For other fields, use parsed data if available, otherwise use manual fields
        description: parsedData?.description || formData.description || '',
        priority: parsedData?.priority || formData.priority || undefined,
        project: parsedData?.project || formData.project || undefined,
        labels: parsedData?.labels || formData.labels || undefined,
        due_date:
          parsedData?.due_date || (formData.due_date ? new Date(formData.due_date) : undefined),
        start_date:
          parsedData?.start_date ||
          (formData.start_date ? new Date(formData.start_date) : undefined),
        notify_at:
          parsedData?.notify_at || (formData.notify_at ? new Date(formData.notify_at) : undefined),
        status: TaskStatus.TODO
      };

      this.submitted.emit(taskData as unknown as Task);
      this.taskForm.reset();
      this.showDetailedFields.set(false);
    }
  }

  protected getErrorMessage(field: string): string {
    const control = this.taskForm.get(field);
    if (control?.errors?.['required']) {
      return 'This field is required';
    }
    if (control?.errors?.['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
    }
    return '';
  }
}
