import { ChangeDetectionStrategy, Component, DestroyRef, Inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from './core/services/notification.service';

/**
 * Root component of the application.
 *
 * @description
 * The AppComponent serves as the main entry point of the application.
 * It handles application-wide concerns such as:
 * - Routing setup via RouterOutlet
 * - Global notification management
 * - Change detection optimization
 *
 * @example
 * ```html
 * <app-root></app-root>
 * ```
 */
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    @Inject(NotificationService) private readonly notificationService: NotificationService,
    @Inject(DestroyRef) private readonly destroyRef: DestroyRef
  ) {
    this.notificationService.notifications$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(notifications => {
        notifications.forEach(notification => {
          console.log('Notification:', notification);
        });
      });
  }
}
