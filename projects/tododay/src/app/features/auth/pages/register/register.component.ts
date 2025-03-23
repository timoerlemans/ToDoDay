import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Registration component that handles new user sign-ups.
 * Provides a form for users to create a new account with email and password.
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  /** Form group for registration details */
  registerForm: FormGroup;
  /** Loading state for the form submission */
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2)
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ]),
      confirmPassword: new FormControl('', [
        Validators.required
      ])
    }, { validators: this.validatePasswordMatch });
  }

  /**
   * Custom validator to ensure password and confirm password fields match.
   * @param control The form group to validate
   * @returns Validation error if passwords don't match, null otherwise
   */
  private validatePasswordMatch(control: AbstractControl): ValidationErrors | null {
    const formGroup = control as FormGroup;
    const firstField = formGroup.get('password');
    const secondField = formGroup.get('confirmPassword');

    if (!firstField || !secondField) {
      return null;
    }

    return firstField.value === secondField.value ? null : { mismatch: true };
  }

  /**
   * Handles form submission for user registration.
   * If the form is valid, it attempts to register the user and redirects to the login page on success.
   */
  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, password, name } = this.registerForm.value;

      this.authService.signUp(email, password, name).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/login']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
