import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AuthFormBaseComponent } from '../../components/auth-form-base.component';

/**
 * Update password component that handles password updates.
 * Provides a form for users to set a new password.
 */
@Component({
  selector: 'app-update-password',
  standalone: false,
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdatePasswordComponent extends AuthFormBaseComponent {
  override form = new FormGroup({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)]
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
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

    const { password } = this.form.getRawValue();

    this.authService
      .updatePassword(password)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          void this.router.navigate(['/tasks']);
        },
        error: () => {
          // Error handling is done in the service
        }
      });
  }
}
