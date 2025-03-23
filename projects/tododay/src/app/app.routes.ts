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
 * - Redirects root path to tasks
 */
export const routes: Routes = [
  {
    path: '',
    canActivate: [PublicGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/auth/auth.module')
          .then(m => m.AuthModule)
      }
    ]
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./features/task/task.module')
          .then(m => m.TaskModule)
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  }
];
