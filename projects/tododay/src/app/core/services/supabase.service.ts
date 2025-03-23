import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { createClient, SupabaseClient, AuthResponse, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

/**
 * Service responsible for managing Supabase client and authentication.
 * Provides methods for authentication operations and access to the Supabase client.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly currentUser = signal<User | null>(null);
  readonly currentUser$ = toObservable(this.currentUser);

  constructor(private readonly storageService: StorageService) {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key,
      {
        auth: {
          storage: {
            getItem: (key: string) => this.storageService.getItem(key),
            setItem: (key: string, value: string) => this.storageService.setItem(key, value),
            removeItem: (key: string) => this.storageService.removeItem(key)
          },
          persistSession: true,
          autoRefreshToken: true
        }
      }
    );

    // Set initial auth state
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.set(session?.user ?? null);
    });

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  /**
   * Signs in a user with email and password
   * @param email User's email
   * @param password User's password
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  /**
   * Signs up a new user with email and password
   * @param email User's email
   * @param password User's password
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signUp({ email, password });
  }

  /**
   * Signs out the current user
   */
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  /**
   * Sends a password reset email to the user
   * @param email User's email address
   */
  async resetPassword(email: string): Promise<void> {
    await this.supabase.auth.resetPasswordForEmail(email);
  }

  async updatePassword(password: string): Promise<void> {
    await this.supabase.auth.updateUser({ password });
  }

  /**
   * Gets the Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
