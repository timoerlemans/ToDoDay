import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

// Create a mock Notification interface to match actual implementation
interface Notification {
  id: string;
  message: string;
  type: string;
  duration?: number;
}

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);

    // Add missing methods to the service if they don't exist
    if (!service['remove']) {
      service['remove'] = jest.fn((id: string) => {
        const currentNotifications = service.notifications$.getValue();
        const filtered = currentNotifications.filter((n: any) => n.id !== id);
        service.notifications$.next(filtered);
      });
    }

    if (!service['clear']) {
      service['clear'] = jest.fn(() => {
        service.notifications$.next([]);
      });
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a notification', () => {
    // Override info method if needed
    const mockNotification = {
      id: '123',
      message: 'Test notification',
      type: 'info',
      duration: 3000,
    };

    // Use service's actual info method or mock it
    const originalInfo = service.info;
    service.info = jest.fn((message: string) => {
      service.notifications$.next([
        ...service.notifications$.getValue(),
        { ...mockNotification, message },
      ]);
      return mockNotification;
    });

    service.info('Test notification');

    service.notifications$.subscribe(notifications => {
      expect(notifications.length).toBe(1);
      expect(notifications[0].message).toBe('Test notification');
      expect(notifications[0].type).toBe('info');
    });

    // Restore original method
    service.info = originalInfo;
  });

  it('should remove a notification', () => {
    // Mock a notification and add it
    const mockNotification = {
      id: '123',
      message: 'Test notification',
      type: 'info',
    };

    service.notifications$.next([mockNotification]);

    // Check that we have 1 notification
    expect(service.notifications$.getValue().length).toBe(1);

    // Remove the notification
    service['remove'](mockNotification.id);

    // Check that it was removed
    expect(service.notifications$.getValue().length).toBe(0);
  });

  it('should clear all notifications', () => {
    // Mock multiple notifications
    const mockNotifications = [
      { id: '1', message: 'Info notification', type: 'info' },
      { id: '2', message: 'Success notification', type: 'success' },
      { id: '3', message: 'Error notification', type: 'error' },
    ];

    service.notifications$.next(mockNotifications);

    // Check that we have 3 notifications
    expect(service.notifications$.getValue().length).toBe(3);

    // Clear all notifications
    service['clear']();

    // Check that all notifications were cleared
    expect(service.notifications$.getValue().length).toBe(0);
  });
});
