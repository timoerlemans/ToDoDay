import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  private readonly notificationService = inject(NotificationService);

  constructor() {
    this.notificationService.notifications$
      .pipe(takeUntilDestroyed())
      .subscribe(notifications => {
        notifications.forEach(notification => {
          console.log('Notification:', notification);
        });
      });
  }
}
