import { Component, DestroyRef, computed, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FormErrors } from '../interfaces/auth-forms.interface';

/**
 * Base component for authentication forms.
 * Provides common functionality for login and register forms.
 */
@Component({
  template: ''
})
export abstract class AuthFormBaseComponent {
  private readonly submitting = signal(false);
  readonly isSubmitting = this.submitting.asReadonly();

  protected readonly formErrors = computed(() => {
    if (!this.form) {
      return {};
    }

    return Object.keys(this.form.controls).reduce((errors, key) => {
      const control = this.form.get(key);
      if (control?.touched) {
        errors[key] = control.errors;
      } else {
        errors[key] = null;
      }
      return errors;
    }, {} as FormErrors);
  });

  abstract form: FormGroup;

  constructor(
    protected readonly router: Router,
    protected readonly destroyRef: DestroyRef
  ) {}

  /**
   * Checks if a form field has errors and has been touched
   * @param fieldName The name of the form field to check
   * @returns True if the field has errors and has been touched
   */
  protected hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    if (!field) {
      return false;
    }
    return field.invalid && field.touched;
  }

  /**
   * Gets the error message for a form field
   * @param fieldName The name of the form field to get errors for
   * @returns A user-friendly error message or empty string if no errors
   */
  protected getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control?.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;
    const fieldLabel = this.getFieldLabel(fieldName);

    if (errors['required']) {
      return `${fieldLabel} is required`;
    }
    if (errors['email']) {
      return 'Please enter a valid email address';
    }
    if (errors['minlength']) {
      return `${fieldLabel} must be at least ${errors['minlength'].requiredLength} characters`;
    }
    if (errors['mismatch']) {
      return 'Passwords do not match';
    }

    return 'Invalid value';
  }

  /**
   * Marks all form fields as touched to trigger validation display
   */
  protected markFormTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Sets the submitting state of the form
   */
  protected setSubmitting(value: boolean): void {
    this.submitting.set(value);
  }

  /**
   * Gets a user-friendly label for a form field
   */
  private getFieldLabel(fieldName: string): string {
    return fieldName
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  }
}
