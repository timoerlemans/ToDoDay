import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
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
  /** Timestamp of the notification */
  timestamp: Date;
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
  readonly notifications$ = toObservable(this.notifications);

  constructor() {}

  /**
   * Shows a success notification
   * @param message The message to display
   */
  success(message: string): void {
    this.addNotification(message, 'success');
  }

  /**
   * Shows an error notification
   * @param message The message to display
   */
  error(message: string): void {
    this.addNotification(message, 'error');
  }

  /**
   * Shows an info notification
   * @param message The message to display
   */
  info(message: string): void {
    this.addNotification(message, 'info');
  }

  /**
   * Shows a warning notification
   * @param message The message to display
   */
  warning(message: string): void {
    this.addNotification(message, 'warning');
  }

  /**
   * Get all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
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
  clearNotifications(): void {
    this.notifications.set([]);
  }

  private addNotification(message: string, type: Notification['type']): void {
    const notification: Notification = {
      id: crypto.randomUUID(),
      message,
      type,
      timestamp: new Date()
    };

    this.notifications.update(notifications => [...notifications, notification]);

    // Automatically remove notification after 5 seconds
    setTimeout(() => {
      this.removeNotification(notification.id);
    }, 5000);
  }
}
