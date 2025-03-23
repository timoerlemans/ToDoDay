import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, User } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
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
  private currentUser = signal<User | null>(null);

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

    // Try to load the current session
    this.loadSession();

    // Listen for auth state changes
    this.setupAuthListener();
  }

  /**
   * Loads the current session from storage
   */
  private async loadSession(): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.currentUser.set(session.user);
    }
  }

  /**
   * Sets up the authentication state change listener
   */
  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  /**
   * Observable of the current user
   */
  get currentUser$(): Observable<User | null> {
    return from(this.currentUser.asReadonly());
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
   * Gets the Supabase client instance
   */
  getClient(): SupabaseClient {
    return this.supabase;
  }
}
