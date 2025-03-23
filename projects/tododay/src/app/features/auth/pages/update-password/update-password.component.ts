import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthFormBaseComponent } from '../../components/auth-form-base.component';
import { UpdatePasswordForm } from '../../interfaces/auth-forms.interface';

/**
 * Update password component that handles password updates.
 * Provides a form for users to set a new password.
 */
@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePasswordComponent extends AuthFormBaseComponent {
  override form = new FormGroup<UpdatePasswordForm>({
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
      ]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  }, {
    validators: [this.passwordMatchValidator]
  });

  constructor(
    private readonly authService: AuthService,
    protected override readonly router: Router,
    private readonly notificationService: NotificationService,
    protected override readonly destroyRef: DestroyRef
  ) {
    super(router, destroyRef);
  }

  override async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const { password } = this.form.getRawValue();

    try {
      await this.authService.updatePassword(password);
      this.notificationService.success('Password updated successfully!');
      void this.router.navigate(['/tasks']);
    } catch (error) {
      this.notificationService.error('Failed to update password');
      console.error('Password update error:', error);
    }
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
}
