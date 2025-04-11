import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from './notification.service';

// Mock crypto.randomUUID for Jest tests
global.crypto = {
  ...global.crypto,
  randomUUID: () =>
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
} as Crypto;

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a notification', async () => {
    // Call the actual info method
    service.info('Test notification');

    // Get the current notifications
    const notifications = await firstValueFrom(service.getNotifications());

    expect(notifications.length).toBe(1);
    expect(notifications[0].message).toBe('Test notification');
    expect(notifications[0].type).toBe('info');
  });

  it('should remove a notification', async () => {
    // Call info to create a notification
    service.info('Test notification');

    // Get the notifications to find the ID
    const notificationsBeforeRemove = await firstValueFrom(service.getNotifications());
    expect(notificationsBeforeRemove.length).toBe(1);

    const notificationId = notificationsBeforeRemove[0].id;

    // Remove the notification
    service.removeNotification(notificationId);

    // Check that it was removed
    const notificationsAfterRemove = await firstValueFrom(service.getNotifications());
    expect(notificationsAfterRemove.length).toBe(0);
  });

  it('should clear all notifications', async () => {
    // Add multiple notifications
    service.info('Info notification');
    service.success('Success notification');
    service.error('Error notification');

    // Check that we have 3 notifications
    const notificationsBeforeClear = await firstValueFrom(service.getNotifications());
    expect(notificationsBeforeClear.length).toBe(3);

    // Clear all notifications
    service.clearNotifications();

    // Check that all notifications were cleared
    const notificationsAfterClear = await firstValueFrom(service.getNotifications());
    expect(notificationsAfterClear.length).toBe(0);
  });
});
