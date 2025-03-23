import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  readonly id: string;
  readonly message: string;
  readonly type: NotificationType;
  readonly duration: number;
}

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

@Injectable({
  providedIn: 'root'
})
export class NotificationService implements OnDestroy {
  private readonly notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public readonly notifications$ = this.notificationsSubject.asObservable();
  private readonly defaultDuration = 3000;
  private readonly timeouts = new Map<string, number>();

  show(message: string, type: NotificationType = 'info', duration: number = this.defaultDuration): void {
    const notification: Notification = {
      id: Date.now().toString(),
      message,
      type,
      duration
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, notification]);

    if (duration > 0) {
      const timeoutId = window.setTimeout(() => {
        this.remove(notification.id);
      }, duration);
      this.timeouts.set(notification.id, timeoutId);
    }
  }

  remove(id: string): void {
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(currentNotifications.filter(n => n.id !== id));
  }

  ngOnDestroy(): void {
    // Cleanup alle actieve timeouts
    this.timeouts.forEach(timeoutId => window.clearTimeout(timeoutId));
    this.timeouts.clear();
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }
}
