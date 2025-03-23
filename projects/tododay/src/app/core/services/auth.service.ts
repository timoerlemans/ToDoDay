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

  signIn(email: string, password: string): Observable<void> {
    return from(this.supabaseService.signIn(email, password)).pipe(
      map(() => void 0),
      tap(() => {
        this.notificationService.show('Je bent succesvol ingelogd', 'success');
        this.router.navigate(['/']);
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.show(message, 'error');
        throw error;
      })
    );
  }

  signUp(email: string, password: string): Observable<void> {
    return from(this.supabaseService.signUp(email, password)).pipe(
      map(() => void 0),
      tap(() => {
        this.notificationService.show('Account succesvol aangemaakt. Controleer je e-mail om je account te verifiëren.', 'success');
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.show(message, 'error');
        throw error;
      })
    );
  }

  signOut(): Observable<void> {
    return from(this.supabaseService.signOut()).pipe(
      tap(() => {
        this.notificationService.show('Je bent succesvol uitgelogd', 'success');
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        const message = this.getErrorMessage(error);
        this.notificationService.show(message, 'error');
        throw error;
      })
    );
  }

  private getErrorMessage(error: any): string {
    if (error?.message) {
      return error.message;
    }

    switch (error?.status) {
      case 400:
        return 'Ongeldige inloggegevens';
      case 401:
        return 'Je bent niet geautoriseerd';
      case 404:
        return 'Account niet gevonden';
      case 422:
        return 'Ongeldige invoer';
      default:
        return 'Er is een onbekende fout opgetreden';
    }
  }
} 