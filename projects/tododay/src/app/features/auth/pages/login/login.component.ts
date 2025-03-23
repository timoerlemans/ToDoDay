import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Login component that handles user authentication.
 * Provides a form for users to sign in with their email and password.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  /** Form group for login credentials */
  loginForm: FormGroup;
  /** Loading state for the form submission */
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }

  /**
   * Handles form submission for user login.
   * If the form is valid, it attempts to sign in the user and redirects to the tasks page on success.
   */
  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;

      this.authService.signIn(email, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/tasks']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Login error:', error);
          this.isLoading = false;
        }
      });
    }
  }
}
