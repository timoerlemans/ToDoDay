import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  message: string;
  type: NotificationType;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);

  show(message: string, type: NotificationType = 'info'): void {
    const notification: Notification = {
      message,
      type,
      id: Math.random().toString(36).substring(7)
    };

    this.notifications.next([...this.notifications.value, notification]);

    setTimeout(() => {
      this.remove(notification.id);
    }, 5000);
  }

  remove(id: string): void {
    this.notifications.next(
      this.notifications.value.filter(notification => notification.id !== id)
    );
  }

  get notifications$() {
    return this.notifications.asObservable();
  }
} 