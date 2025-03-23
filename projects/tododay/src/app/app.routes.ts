import { Routes } from '@angular/router';
import { AuthGuard, PublicGuard } from '@tododay/core/guards/auth.guard';

/**
 * Application routes configuration.
 *
 * @description
 * Defines the main routing structure of the application:
 * - Implements lazy loading for all feature modules
 * - Includes authentication guards for protected routes
 * - Provides public routes for authentication
 * - Redirects root path to tasks
 */
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [PublicGuard],
    loadChildren: () => import('@tododay/features/auth/auth.module')
      .then(m => m.AuthModule),
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    loadChildren: () => import('@tododay/features/task/task.module')
      .then(m => m.TaskModule),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  }
];
