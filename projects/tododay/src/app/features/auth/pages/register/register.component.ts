import { Component, computed, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthError, AuthResponse, AuthService } from '@tododay/core/services/auth.service';
import { NotificationService } from '@tododay/core/services/notification.service';

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

/**
 * Registration component that handles new user sign-ups.
 * Provides a form for users to create a new account with email and password.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: false
})
export class RegisterComponent {
  readonly registerForm = new FormGroup<RegisterForm>(
    {
      name: new FormControl('', {
        validators: [Validators.required, Validators.minLength(2)],
        nonNullable: true
      }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true
      }),
      password: new FormControl('', {
        validators: [Validators.required, Validators.minLength(6)],
        nonNullable: true
      }),
      confirmPassword: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true
      })
    },
    { validators: this.validatePasswordMatch }
  );
  readonly formErrors = computed(() => {
    if (!this.registerForm) {
      return {};
    }

    return {
      name: this.getFieldErrors('name'),
      email: this.getFieldErrors('email'),
      password: this.getFieldErrors('password'),
      confirmPassword: this.getFieldErrors('confirmPassword'),
      mismatch: this.registerForm.errors?.['mismatch']
    };
  });
  private readonly isLoading = signal(false);
  readonly isLoading$ = this.isLoading.asReadonly();

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
    private readonly notificationService: NotificationService
  ) {}

  /**
   * Handles form submission for user registration.
   * If the form is valid, it attempts to register the user and redirects to the login page on success.
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      const { email, password, name } = this.registerForm.getRawValue();

      this.authService
        .signUp(email, password)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response: AuthResponse) => {
            if (response.success) {
              this.notificationService.success(response.message);
              void this.router.navigate(['/login']);
            } else {
              this.notificationService.error(response.message);
            }
            this.isLoading.set(false);
          },
          error: (error: AuthError) => {
            console.error('Registration error:', error);
            this.notificationService.error(
              error.message || 'Registration failed. Please try again.'
            );
            this.isLoading.set(false);
          }
        });
    }
  }

  /**
   * Custom validator to ensure password and confirm password fields match.
   */
  private validatePasswordMatch(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { mismatch: true };
  }

  /**
   * Gets validation errors for a specific form field
   */
  private getFieldErrors(fieldName: keyof RegisterForm): Record<string, boolean> | null {
    const control = this.registerForm.get(fieldName);
    return control?.touched ? control.errors : null;
  }
}
