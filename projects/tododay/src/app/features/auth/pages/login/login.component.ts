import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

/**
 * Login component that handles user authentication.
 * Provides a form for users to sign in with their email and password.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  /** Form group for login credentials */
  loginForm = new FormGroup<LoginForm>({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)],
      nonNullable: true,
    }),
  });

  /** Loading state for the form submission */
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef
  ) {}

  /**
   * Handles form submission for user login.
   * If the form is valid, it attempts to sign in the user and redirects to the tasks page on success.
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const { email, password } = this.loginForm.getRawValue();

      this.authService
        .signIn(email, password)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: response => {
            if (response.success) {
              this.router.navigate(['/tasks']);
              this.notificationService.success('Successfully logged in');
            }
            this.isLoading = false;
          },
          error: error => {
            console.error('Login error:', error);
            this.notificationService.error('Failed to log in. Please check your credentials.');
            this.isLoading = false;
          },
        });
    }
  }

  /**
   * Gets form control error message
   * @param controlName The name of the form control
   * @returns The error message if any
   */
  getErrorMessage(controlName: keyof LoginForm): string {
    const control = this.loginForm.get(controlName);
    if (!control?.errors || !control.touched) return '';

    if (control.errors['required']) return `${controlName} is required`;
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength']) return 'Password must be at least 6 characters long';

    return '';
  }
}
