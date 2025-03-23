import { Component, OnInit, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'tododay-theme-toggle',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  protected currentTheme: Theme = 'system';
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.theme$
      .pipe(takeUntilDestroyed())
      .subscribe((theme: Theme) => {
        this.currentTheme = theme;
      });
  }

  ngOnDestroy(): void {
    // Cleanup indien nodig
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }
} 