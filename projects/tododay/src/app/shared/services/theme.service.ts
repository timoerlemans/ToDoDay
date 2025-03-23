import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private theme = new BehaviorSubject<Theme>('system');
  theme$ = this.theme.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  toggleTheme(): void {
    const currentTheme = this.theme.value;
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme: Theme): void {
    this.theme.next(theme);
    localStorage.setItem('theme', theme);
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }
} 