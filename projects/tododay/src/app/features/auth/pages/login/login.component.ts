import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '@tododay/app/core/services/auth.service';
import { NotificationService } from '@tododay/app/core/services/notification.service';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.signIn(email, password).then(({ success, message }) => {
        if (success) {
          this.notificationService.show('Succesvol ingelogd', 'success');
          this.router.navigate(['/tasks']);
        } else {
          this.notificationService.show(message || 'Inloggen mislukt. Controleer je gegevens.', 'error');
        }
      }).catch(error => {
        this.notificationService.show('Er is een fout opgetreden bij het inloggen.', 'error');
        console.error('Login error:', error);
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }
} 