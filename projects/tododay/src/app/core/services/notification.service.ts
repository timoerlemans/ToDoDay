import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

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
  private notifications = signal<Notification[]>([]);

  /**
   * Observable of the current notifications array
   */
  get notifications$(): Observable<Notification[]> {
    return this.notifications.asReadonly();
  }

  /**
   * Shows a success notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  /**
   * Shows an error notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  showError(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  /**
   * Shows an info notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  showInfo(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  /**
   * Shows a warning notification
   * @param message The message to display
   * @param duration Time in milliseconds before auto-dismissal
   */
  showWarning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  /**
   * Internal method to show a notification
   * @param message The message to display
   * @param type The type of notification
   * @param duration Time in milliseconds before auto-dismissal
   */
  private show(message: string, type: Notification['type'], duration: number): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      message,
      type,
      duration
    };

    this.notifications.update(notifications => [...notifications, notification]);

    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  /**
   * Removes a specific notification
   * @param notification The notification to remove
   */
  removeNotification(notification: Notification): void {
    this.notifications.update(notifications =>
      notifications.filter(n => n.id !== notification.id)
    );
  }

  /**
   * Clears all notifications
   */
  clear(): void {
    this.notifications.set([]);
  }
}
