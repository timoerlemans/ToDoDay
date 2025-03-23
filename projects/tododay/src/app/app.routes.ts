import { Routes } from '@angular/router';
import { AuthGuard, PublicGuard } from './core/guards/auth.guard';

/**
 * Application routes configuration.
 *
 * @description
 * Defines the main routing structure of the application:
 * - Implements lazy loading for all feature modules
 * - Includes authentication guards for protected routes
 * - Provides public routes for authentication
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    canActivate: [PublicGuard],
    loadChildren: () => import('./features/auth/auth.module')
      .then(m => m.AuthModule)
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/task/task.module')
      .then(m => m.TaskModule)
  }
];
