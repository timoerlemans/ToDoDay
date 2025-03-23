import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationService } from './core/services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
