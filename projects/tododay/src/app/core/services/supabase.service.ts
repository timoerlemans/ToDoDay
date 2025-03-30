import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AuthResponse, createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '@tododay/../environments/environment';
import { StorageService } from '@tododay/core/services/storage.service';

/**
 * Service responsible for managing Supabase client and authentication.
 * Provides methods for authentication operations and access to the Supabase client.
 */
@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  /**
   * Signal containing the current authenticated user or null if not authenticated.
   */
  private readonly currentUser = signal<User | null>(null);

  /**
   * Observable of the current authenticated user.
   * Components can subscribe to this to react to authentication state changes.
   */
  readonly currentUser$ = toObservable(this.currentUser);

  /**
   * Creates an instance of the SupabaseService.
   * Initializes the Supabase client with custom storage handling.
   * Sets up authentication state listeners.
   *
   * @param storageService - Service for local storage operations
   */
  constructor(private readonly storageService: StorageService) {
    this.supabase = createClient(environment.supabase.url, environment.supabase.key, {
      auth: {
        storage: {
          getItem: (key: string) => this.storageService.getItem(key),
          setItem: async (key: string, value: string) => {
            try {
              await this.storageService.setItem(key, value);
            } catch (error) {
              console.error('Failed to set auth storage item', error);
            }
          },
          removeItem: (key: string) => this.storageService.removeItem(key)
        },
        persistSession: true,
        autoRefreshToken: true,
        // Configure to avoid locks when multiple tabs are open
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-app-version': '1.0.0'
        }
      }
    });

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
   * Signs in a user with email and password.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise that resolves to the authentication response
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  /**
   * Signs up a new user with email and password.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise that resolves to the authentication response
   */
  async signUp(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signUp({ email, password });
  }

  /**
   * Signs out the current user.
   * Clears the authentication state.
   *
   * @returns Promise that resolves when sign out is complete
   */
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  /**
   * Sends a password reset email to the user.
   *
   * @param email - User's email address
   * @returns Promise that resolves when the reset email has been sent
   */
  async resetPassword(email: string): Promise<void> {
    await this.supabase.auth.resetPasswordForEmail(email);
  }

  /**
   * Updates the password for the currently authenticated user.
   *
   * @param password - The new password to set
   * @returns Promise that resolves when the password has been updated
   */
  async updatePassword(password: string): Promise<void> {
    await this.supabase.auth.updateUser({ password });
  }

  /**
   * Gets the Supabase client instance.
   * Provides direct access to all Supabase functionality.
   *
   * @returns The configured Supabase client
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
