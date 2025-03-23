import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthFormBaseComponent } from '../../components/auth-form-base.component';

/**
 * Reset password component that handles password reset requests.
 * Provides a form for users to request a password reset using their email.
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent extends AuthFormBaseComponent {
  override form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    })
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

    const { email } = this.form.getRawValue();

    this.authService.resetPassword(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Password reset email sent successfully!');
          void this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.notificationService.error('Failed to send password reset email');
        }
      });
  }
}
