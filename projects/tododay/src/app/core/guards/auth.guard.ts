import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '@tododay/core/services/auth.service';

/**
 * Auth Guard for securing routes that should only be accessible to logged-in users
 */
export const AuthGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuthenticated => {
      if (!isAuthenticated) {
        void router.navigate(['/auth/login']);
        return false;
      }
      return true;
    })
  );
};

/**
 * Public Guard for securing routes that should only be accessible to non-logged-in users
 * (like login and register pages)
 */
export const PublicGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated().pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        void router.navigate(['/tasks']);
        return false;
      }
      return true;
    })
  );
};
