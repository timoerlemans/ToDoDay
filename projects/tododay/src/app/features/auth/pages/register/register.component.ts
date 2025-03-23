import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    return formGroup.get('password')?.value === formGroup.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  };

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, password } = this.registerForm.value;

      this.authService.signUp(email, password).subscribe({
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