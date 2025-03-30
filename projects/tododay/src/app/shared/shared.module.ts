import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ThemeToggleComponent } from '@tododay/shared/components/theme-toggle/theme-toggle.component';

/**
 * Shared module containing common components, directives, and pipes.
 *
 * @description
 * This module exports reusable UI components and features that are
 * shared across multiple feature modules.
 */
@NgModule({
  declarations: [ThemeToggleComponent],
  imports: [CommonModule],
  exports: [ThemeToggleComponent]
})
export class SharedModule {}
