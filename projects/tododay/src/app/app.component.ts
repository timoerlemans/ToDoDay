import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@tododay/core/services/notification.service';

/**
 * Root component of the application.
 * Handles application-wide notifications and routing.
 */
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly destroyRef: DestroyRef
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
