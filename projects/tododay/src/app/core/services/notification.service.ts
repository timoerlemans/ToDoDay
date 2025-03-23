import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  get notifications$() {
    return this.notifications.asReadonly();
  }

  showSuccess(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  showError(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  showInfo(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  showWarning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  private show(message: string, type: Notification['type'], duration: number): void {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      duration
    };

    this.notifications.update(notifications => [...notifications, notification]);

    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  removeNotification(notification: Notification): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== notification.id)
    );
  }

  clear(): void {
    this.notifications.set([]);
  }
}
