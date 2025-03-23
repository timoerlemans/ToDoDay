import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'tododay-theme-toggle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  protected readonly currentTheme = toSignal(this.themeService.theme$, { initialValue: 'system' as Theme });

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
}
