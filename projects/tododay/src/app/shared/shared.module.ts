import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskItemComponent } from './components/task-item/task-item.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';

/**
 * Shared module containing common components, directives, and pipes.
 *
 * @description
 * This module exports reusable UI components and features that are
 * shared across multiple feature modules.
 */
@NgModule({
  declarations: [
    TaskListComponent
  ],
  imports: [
    CommonModule,
    TaskFormComponent,
    TaskItemComponent,
    ThemeToggleComponent
  ],
  exports: [
    TaskFormComponent,
    TaskItemComponent,
    ThemeToggleComponent,
    TaskListComponent
  ]
})
export class SharedModule { }
