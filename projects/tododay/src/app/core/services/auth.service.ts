import { Injectable, signal, DestroyRef } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';

import { SupabaseService } from '@tododay/core/services/supabase.service';
import { NotificationService } from '@tododay/core/services/notification.service';

/**
 * Represents the authentication state of the application.
 */
export interface AuthState {
  /** Whether a user is currently authenticated */
  isAuthenticated: boolean;
  /** The currently authenticated user, or null if not authenticated */
  user: User | null;
}

/**
 * Represents the response from an authentication operation.
 */
export interface AuthResponse {
  /** Whether the operation was successful */
  success: boolean;
  /** A message describing the result of the operation */
  message: string;
}

/**
 * Represents an authentication error.
 */
export interface AuthError {
  /** Error message */
  message: string;
  /** HTTP status code, if applicable */
  status?: number;
  /** Error name or type */
  name?: string;
}

/**
 * Service responsible for handling authentication operations.
 * Manages user authentication state and provides methods for sign in, sign up, and sign out.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authState = signal<AuthState>({
    isAuthenticated: false,
    user: null,
  });

  /**
   * Observable of the current authentication state.
   */
  readonly authState$ = toObservable(this.authState);

  /**
   * Observable of the currently authenticated user.
   */
  readonly currentUser$ = this.authState$.pipe(map(state => state.user));

  /**
   * Creates an instance of the AuthService.
   * Sets up subscription to user changes from Supabase.
   *
   * @param supabaseService - Service to interact with Supabase authentication
   * @param notificationService - Service to display notifications
   * @param destroyRef - Reference used to automatically unsubscribe from observables
   */
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly notificationService: NotificationService,
    private readonly destroyRef: DestroyRef
  ) {
    this.supabaseService.currentUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.authState.set({
        isAuthenticated: !!user,
        user,
      });
    });
  }

  /**
   * Checks if a user is currently authenticated.
   *
   * @returns An Observable that emits true if a user is authenticated, false otherwise
   */
  isAuthenticated(): Observable<boolean> {
    return this.supabaseService.currentUser$.pipe(map(user => !!user));
  }

  /**
   * Signs in a user with email and password.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns An Observable of the authentication response
   * @throws AuthError if sign in fails
   */
  signIn(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabaseService.signIn(email, password)).pipe(
      map(() => ({
        success: true,
        message: 'Successfully logged in',
      })),
      catchError((error: AuthError) => {
        this.notificationService.error(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Signs up a new user with email and password.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns An Observable of the authentication response
   * @throws AuthError if sign up fails
   */
  signUp(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabaseService.signUp(email, password)).pipe(
      map(() => ({
        success: true,
        message: 'Successfully registered',
      })),
      catchError((error: AuthError) => {
        this.notificationService.error(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Signs out the current user.
   *
   * @returns An Observable of the authentication response
   * @throws AuthError if sign out fails
   */
  signOut(): Observable<AuthResponse> {
    return from(this.supabaseService.signOut()).pipe(
      map(() => ({
        success: true,
        message: 'Successfully logged out',
      })),
      catchError((error: AuthError) => {
        this.notificationService.error(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Resets the password for a user with the given email.
   * Sends a password reset email to the user.
   *
   * @param email - The user's email address
   * @returns An Observable that completes when the password reset email is sent
   * @throws AuthError if the password reset fails
   */
  resetPassword(email: string): Observable<void> {
    return from(this.supabaseService.resetPassword(email)).pipe(
      map(() => {
        this.notificationService.success('Password reset email sent');
      }),
      catchError((error: AuthError) => {
        this.notificationService.error(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Updates the password for the currently authenticated user.
   *
   * @param password - The new password to set
   * @returns An Observable that completes when the password is updated
   * @throws AuthError if the password update fails
   */
  updatePassword(password: string): Observable<void> {
    return from(this.supabaseService.updatePassword(password)).pipe(
      map(() => {
        this.notificationService.success('Password updated successfully');
      }),
      catchError((error: AuthError) => {
        this.notificationService.error(this.getErrorMessage(error));
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets a user-friendly error message from an authentication error.
   *
   * @param error - The authentication error
   * @returns A user-friendly error message
   */
  private getErrorMessage(error: AuthError): string {
    if (error?.message) {
      return error.message;
    }
    return 'An error occurred. Please try again later.';
  }

  /**
   * Gets the current authentication state.
   *
   * @returns An Observable of the current authentication state
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$;
  }
}
