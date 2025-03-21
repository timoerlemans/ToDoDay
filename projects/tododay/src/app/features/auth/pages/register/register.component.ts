import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@tododay/app/core/services/auth.service';
import { NotificationService } from '@tododay/app/core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { email, password } = this.registerForm.value;
      
      this.authService.signUp(email, password).then(({ success, message }) => {
        if (success) {
          this.notificationService.show('Registratie succesvol! Controleer je e-mail voor de bevestigingslink.', 'success');
          this.router.navigate(['/login']);
        } else {
          this.notificationService.show(message || 'Er is een fout opgetreden bij het registreren.', 'error');
        }
      }).catch(error => {
        this.notificationService.show('Er is een fout opgetreden bij het registreren.', 'error');
        console.error('Registratie error:', error);
      }).finally(() => {
        this.isLoading = false;
      });
    }
  }
} 