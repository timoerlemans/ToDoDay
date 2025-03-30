import { Injectable, signal, DestroyRef } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';

import { SupabaseService } from '@tododay/core/services/supabase.service';
import { NotificationService } from '@tododay/core/services/notification.service';

/**
 * Authentication state interface
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

/**
 * Authentication response interface
 */
export interface AuthResponse {
  success: boolean;
  message: string;
}

/**
 * Authentication error interface
 */
export interface AuthError {
  message: string;
  status?: number;
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

  readonly authState$ = toObservable(this.authState);
  readonly currentUser$ = this.authState$.pipe(map(state => state.user));

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
   * Checks if a user is currently authenticated
   */
  isAuthenticated(): Observable<boolean> {
    return this.supabaseService.currentUser$.pipe(map(user => !!user));
  }

  /**
   * Signs in a user with email and password
   * @param email User's email
   * @param password User's password
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
   * Signs up a new user with email and password
   * @param email User's email
   * @param password User's password
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
   * Signs out the current user
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
   * Resets the password for a user with the given email
   * @param email The user's email
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
   * Gets a user-friendly error message from an authentication error
   * @param error The authentication error
   */
  private getErrorMessage(error: AuthError): string {
    if (error?.message) {
      return error.message;
    }
    return 'An error occurred. Please try again later.';
  }

  /**
   * Gets the current authentication state
   */
  getAuthState(): Observable<AuthState> {
    return this.authState$;
  }
}
