import { Injectable, signal } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
}

/**
 * Authentication response interface
 */
interface AuthResponse {
  success: boolean;
  message: string;
}

/**
 * Authentication error interface
 */
interface AuthError {
  message: string;
  status?: number;
  name?: string;
}

/**
 * Service responsible for handling authentication operations.
 * Manages user authentication state and provides methods for sign in, sign up, and sign out.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authState = signal<AuthState>({
    isAuthenticated: false,
    user: null
  });

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationService: NotificationService
  ) {
    this.supabaseService.currentUser$.subscribe(user => {
      this.authState.set({
        isAuthenticated: !!user,
        user
      });
    });
  }

  /**
   * Observable of the current authentication state
   */
  get authState$(): Observable<AuthState> {
    return from(this.authState.asReadonly());
  }

  /**
   * Checks if a user is currently authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.supabaseService.currentUser$.pipe(
      map(user => !!user)
    );
  }

  /**
   * Signs in a user with email and password
   * @param email User's email
   * @param password User's password
   */
  async signIn(email: string, password: string): Promise<void> {
    try {
      await this.supabaseService.signIn(email, password);
      this.notificationService.success('Successfully logged in');
    } catch (error) {
      this.notificationService.error('Failed to log in');
      throw error;
    }
  }

  /**
   * Signs up a new user with email and password
   * @param email User's email
   * @param password User's password
   */
  async signUp(email: string, password: string): Promise<void> {
    try {
      await this.supabaseService.signUp(email, password);
      this.notificationService.success('Successfully registered');
    } catch (error) {
      this.notificationService.error('Failed to register');
      throw error;
    }
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<void> {
    try {
      await this.supabaseService.signOut();
      this.notificationService.success('Successfully logged out');
    } catch (error) {
      this.notificationService.error('Failed to log out');
      throw error;
    }
  }

  /**
   * Gets a user-friendly error message from an authentication error
   * @param error The authentication error
   */
  private getErrorMessage(error: AuthError): string {
    if (error?.message) {
      return error.message;
    }
    return 'An error occurred. Please try again later.';
  }
}
