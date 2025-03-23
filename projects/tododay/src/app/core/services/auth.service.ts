import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '@tododay/core/services/supabase.service';
import { NotificationService } from '@tododay/core/services/notification.service';

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
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
  private authState = signal<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Observable of the current user
   */
  get currentUser$(): Observable<User | null> {
    return this.supabaseService.currentUser$;
  }

  /**
   * Observable of the current authentication state
   */
  get authState$(): Observable<AuthState> {
    return this.authState.asReadonly();
  }

  /**
   * Initializes the authentication state by subscribing to the current user
   */
  private initializeAuth(): void {
    this.supabaseService.currentUser$.subscribe(user => {
      this.authState.update(state => ({
        ...state,
        user,
        loading: false,
        error: null
      }));
    });
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
  signIn(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabaseService.signIn(email, password)).pipe(
      map(() => {
        this.notificationService.showSuccess('Successfully signed in');
        this.router.navigate(['/tasks']);
        return { success: true, message: 'Successfully signed in' };
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.showError(message);
        return [{ success: false, message }];
      })
    );
  }

  /**
   * Signs up a new user with email and password
   * @param email User's email
   * @param password User's password
   */
  signUp(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabaseService.signUp(email, password)).pipe(
      map(() => {
        this.notificationService.showSuccess('Registration successful');
        this.router.navigate(['/login']);
        return { success: true, message: 'Registration successful' };
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.showError(message);
        return [{ success: false, message }];
      })
    );
  }

  /**
   * Signs out the current user
   */
  signOut(): Observable<AuthResponse> {
    return from(this.supabaseService.signOut()).pipe(
      map(() => {
        this.notificationService.showSuccess('Successfully signed out');
        this.router.navigate(['/login']);
        return { success: true, message: 'Successfully signed out' };
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.showError(message);
        return [{ success: false, message }];
      })
    );
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
