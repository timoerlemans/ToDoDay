import { Injectable, signal } from '@angular/core';
import { Observable, from } from 'rxjs';

/**
 * Interface representing a notification message
 */
export interface Notification {
  /** Unique identifier for the notification */
  id: string;
  /** Message content to display */
  message: string;
  /** Type of notification that determines its styling */
  type: 'success' | 'error' | 'info' | 'warning';
  /** Duration in milliseconds before auto-dismissal */
  duration?: number;
}

/**
 * Service responsible for managing application-wide notifications.
 * Provides methods to show different types of notifications and manage their lifecycle.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notifications = signal<Notification[]>([]);

  /**
   * Observable of the current notifications array
   */
  get notifications$(): Observable<Notification[]> {
    return from(this.notifications.asReadonly());
  }

  /**
   * Shows a success notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  success(message: string, duration = 3000): void {
    this.addNotification({
      id: crypto.randomUUID(),
      message,
      type: 'success',
      duration
    });
  }

  /**
   * Shows an error notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  error(message: string, duration = 5000): void {
    this.addNotification({
      id: crypto.randomUUID(),
      message,
      type: 'error',
      duration
    });
  }

  /**
   * Shows an info notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  info(message: string, duration = 3000): void {
    this.addNotification({
      id: crypto.randomUUID(),
      message,
      type: 'info',
      duration
    });
  }

  /**
   * Shows a warning notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  warning(message: string, duration = 5000): void {
    this.addNotification({
      id: crypto.randomUUID(),
      message,
      type: 'warning',
      duration
    });
  }

  /**
   * Internal method to show a notification
   * @param notification The notification to add
   */
  private addNotification(notification: Notification): void {
    this.notifications.update(notifications => [...notifications, notification]);
    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Removes a specific notification
   * @param id The ID of the notification to remove
   */
  removeNotification(id: string): void {
    this.notifications.update(notifications =>
      notifications.filter(notification => notification.id !== id)
    );
  }

  /**
   * Clears all notifications
   */
  clear(): void {
    this.notifications.set([]);
  }
}
