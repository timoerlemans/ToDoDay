import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { NotificationService } from './notification.service';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authState = new BehaviorSubject<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  constructor(
    private supabaseService: SupabaseService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  get currentUser$(): Observable<User | null> {
    return this.supabaseService.currentUser$;
  }

  get authState$(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  private initializeAuth(): void {
    this.supabaseService.currentUser$.subscribe(user => {
      this.authState.next({
        user,
        loading: false,
        error: null
      });
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.supabaseService.currentUser$.pipe(
      map(user => !!user)
    );
  }

  signIn(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabaseService.signIn(email, password)).pipe(
      map(() => {
        this.notificationService.showSuccess('Succesvol ingelogd');
        this.router.navigate(['/tasks']);
        return { success: true, message: 'Succesvol ingelogd' };
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.showError(message);
        return [{ success: false, message }];
      })
    );
  }

  signUp(email: string, password: string): Observable<AuthResponse> {
    return from(this.supabaseService.signUp(email, password)).pipe(
      map(() => {
        this.notificationService.showSuccess('Registratie succesvol');
        this.router.navigate(['/login']);
        return { success: true, message: 'Registratie succesvol' };
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.showError(message);
        return [{ success: false, message }];
      })
    );
  }

  signOut(): Observable<AuthResponse> {
    return from(this.supabaseService.signOut()).pipe(
      map(() => {
        this.notificationService.showSuccess('Succesvol uitgelogd');
        this.router.navigate(['/login']);
        return { success: true, message: 'Succesvol uitgelogd' };
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.showError(message);
        return [{ success: false, message }];
      })
    );
  }

  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }
    return 'Er is een fout opgetreden. Probeer het later opnieuw.';
  }
} 