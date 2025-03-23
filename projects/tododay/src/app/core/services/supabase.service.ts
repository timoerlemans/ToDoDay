import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = signal<User | null>(null);

  constructor(private storageService: StorageService) {
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

    // Probeer de huidige sessie te laden
    this.loadSession();

    // Luister naar auth state changes
    this.setupAuthListener();
  }

  private async loadSession(): Promise<void> {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.currentUser.set(session.user);
    }
  }

  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.set(session?.user ?? null);
    });
  }

  get currentUser$() {
    return this.currentUser.asReadonly();
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signUp({ email, password });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.set(null);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
