import { Routes } from '@angular/router';
import { AuthGuard, PublicGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [PublicGuard],
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [PublicGuard],
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'tasks',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/task/pages/task-list/task-list.component').then(m => m.TaskListComponent),
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  }
];
