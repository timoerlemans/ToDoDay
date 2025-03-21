import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';

interface AppUser extends User {
  name?: string;
  app_metadata: any;
  user_metadata: any;
  aud: string;
  created_at: string;
}

export interface AuthState {
  readonly user: any | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    isLoading: false,
    error: null
  });

  readonly authState$ = this.authStateSubject.asObservable();
  
  private readonly currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private readonly router: Router,
    private readonly supabaseService: SupabaseService
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } catch (error) {
        console.error('Fout bij het laden van de opgeslagen gebruiker:', error);
        localStorage.removeItem('currentUser');
      }
    }

    this.checkAuthState();
  }

  getAuthState(): Observable<AuthState> {
    return this.authState$;
  }

  /**
   * Registreert een nieuwe gebruiker
   */
  register(email: string, password: string, name: string): Observable<AppUser> {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    return from(this.signUp(email, password)).pipe(
      map(() => ({
        id: '1',
        email,
        name,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as AppUser)),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Registratie fout:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logt een gebruiker in
   */
  login(email: string, password: string): Observable<AppUser> {
    this.authStateSubject.next({
      ...this.authStateSubject.value,
      isLoading: true,
      error: null
    });

    return from(this.signIn(email, password)).pipe(
      map(() => ({
        id: '1',
        email,
        name: 'Test User',
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as AppUser)),
      tap(user => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        console.error('Login fout:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logt de huidige gebruiker uit
   */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.authStateSubject.next({
      user: null,
      isLoading: false,
      error: null
    });
    this.router.navigate(['/login']);
  }

  /**
   * Helper functie om te controleren of een gebruiker is ingelogd
   */
  isAuthenticated(): Observable<boolean> {
    return from(this.supabaseService.getSession()).pipe(
      map(({ data: { session } }) => !!session),
      tap(isAuthenticated => this.isAuthenticatedSubject.next(isAuthenticated)),
      catchError(() => {
        this.isAuthenticatedSubject.next(false);
        return [false];
      })
    );
  }

  /**
   * Haalt de huidige gebruiker op
   */
  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Reset het wachtwoord van een gebruiker
   */
  resetPassword(email: string): Observable<{ success: boolean; message?: string }> {
    return from(this.supabaseService.resetPasswordForEmail(email)).pipe(
      map(() => ({ success: true })),
      catchError(error => {
        console.error('Wachtwoord reset fout:', error);
        return throwError(() => ({
          success: false,
          message: error.message
        }));
      })
    );
  }

  private async initializeAuth() {
    const { data: { session } } = await this.supabaseService.getSession();
    this.authStateSubject.next({
      user: session?.user || null,
      isLoading: false,
      error: null
    });

    this.supabaseService.onAuthStateChange((event, session) => {
      this.authStateSubject.next({
        user: session?.user || null,
        isLoading: false,
        error: null
      });
    });
  }

  private checkAuthState() {
    this.supabaseService.getSession().then(({ data: { session } }) => {
      this.isAuthenticatedSubject.next(!!session);
    });
  }

  async signUp(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await this.supabaseService.signUp(email, password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            message: 'Controleer je e-mail voor de bevestigingslink voordat je inlogt.'
          };
        }
        return {
          success: false,
          message: error.message
        };
      }
      return { success: true };
    } catch (error) {
      console.error('Registratie fout:', error);
      return {
        success: false,
        message: 'Er is een fout opgetreden bij het registreren.'
      };
    }
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await this.supabaseService.signInWithPassword(email, password);
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            message: 'Controleer je e-mail voor de bevestigingslink voordat je inlogt.'
          };
        }
        return {
          success: false,
          message: error.message
        };
      }
      this.isAuthenticatedSubject.next(true);
      this.router.navigate(['/']);
      return { success: true };
    } catch (error) {
      console.error('Login fout:', error);
      return {
        success: false,
        message: 'Er is een fout opgetreden bij het inloggen.'
      };
    }
  }

  async signOut(): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await this.supabaseService.signOut();
      if (error) {
        return {
          success: false,
          message: error.message
        };
      }
      this.isAuthenticatedSubject.next(false);
      this.router.navigate(['/login']);
      return { success: true };
    } catch (error) {
      console.error('Uitlog fout:', error);
      return {
        success: false,
        message: 'Er is een fout opgetreden bij het uitloggen.'
      };
    }
  }

  async updatePassword(newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await this.supabaseService.updateUser({ password: newPassword });
      if (error) {
        return {
          success: false,
          message: error.message
        };
      }
      return { success: true };
    } catch (error) {
      console.error('Wachtwoord update fout:', error);
      return {
        success: false,
        message: 'Er is een fout opgetreden bij het updaten van het wachtwoord.'
      };
    }
  }
} 