import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Represents the available theme options for the application.
 * - 'light': Light theme mode
 * - 'dark': Dark theme mode
 * - 'system': Use the system preference (auto)
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Service responsible for managing the application's theme.
 * Provides methods to change, toggle, and observe the current theme.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('system');

  /**
   * Observable for the current theme state.
   * Components can subscribe to this to react to theme changes.
   */
  theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Sets the application theme.
   * Updates the theme subject, saves to local storage, and applies CSS changes.
   *
   * @param theme - The theme to set ('light', 'dark', or 'system')
   */
  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  /**
   * Toggles between light and dark themes.
   * If the current theme is light, it will switch to dark and vice versa.
   */
  toggleTheme(): void {
    const currentTheme = this.themeSubject.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  private initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('system');
    }
  }

  private applyTheme(theme: Theme): void {
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  }
}
