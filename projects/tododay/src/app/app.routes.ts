import { Routes } from '@angular/router';
import { AuthGuard, PublicGuard } from '@tododay/core/guards/auth.guard';

/**
 * Application routes configuration.
 * Implements lazy loading for all feature modules.
 * Includes authentication guards for protected routes.
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [PublicGuard],
    loadComponent: () => import('@tododay/features/auth/pages/login/login.component')
      .then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [PublicGuard],
    loadComponent: () => import('@tododay/features/auth/pages/register/register.component')
      .then(m => m.RegisterComponent),
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    loadComponent: () => import('@tododay/features/task/pages/task-list/task-list.component')
      .then(m => m.TaskListComponent),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  }
];
