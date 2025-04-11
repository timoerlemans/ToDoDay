import { DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NotificationService } from '@tododay/core/services/notification.service';
import { BehaviorSubject } from 'rxjs';
import { AppComponent } from './app.component';

// Create a mock Notification type that matches your actual type
interface Notification {
  id: string;
  message: string;
  type: string;
  duration?: number;
}

describe('AppComponent', () => {
  let notificationServiceMock: {
    notifications$: BehaviorSubject<Notification[]>;
  };

  beforeEach(async () => {
    // Create a mock for NotificationService
    notificationServiceMock = {
      notifications$: new BehaviorSubject<Notification[]>([])
    };

    // Create a mock for DestroyRef
    const destroyRefMock = {
      onDestroy: jest.fn()
    } as unknown as DestroyRef;

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: DestroyRef, useValue: destroyRefMock }
      ]
    }).compileComponents();

    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should subscribe to notifications', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const testNotification: Notification = {
      id: '1',
      message: 'Test notification',
      type: 'info',
      duration: 3000
    };

    notificationServiceMock.notifications$.next([testNotification]);

    expect(console.log).toHaveBeenCalledWith('Notification:', testNotification);
  });
});
