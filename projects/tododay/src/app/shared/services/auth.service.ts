import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    // TODO: Implement actual authentication
    this.currentUser.next({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  get currentUser$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  getCurrentUser(): User | null {
    return this.currentUser.value;
  }

  login(email: string, password: string): Promise<void> {
    // TODO: Implement actual login
    return Promise.resolve();
  }

  logout(): Promise<void> {
    // TODO: Implement actual logout
    this.currentUser.next(null);
    return Promise.resolve();
  }
} 