import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, AuthResponse, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key,
      {
        auth: {
          storage: {
            getItem: (key: string) => localStorage.getItem(key),
            setItem: (key: string, value: string) => localStorage.setItem(key, value),
            removeItem: (key: string) => localStorage.removeItem(key)
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
      this.currentUser.next(session.user);
    }
  }

  private setupAuthListener(): void {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  get currentUser$() {
    return this.currentUser.asObservable();
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async signUp(email: string, password: string): Promise<AuthResponse> {
    return this.supabase.auth.signUp({ email, password });
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this.currentUser.next(null);
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
} 