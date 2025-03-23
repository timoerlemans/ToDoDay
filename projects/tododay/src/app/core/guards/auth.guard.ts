import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

/**
 * Auth Guard voor het beveiligen van routes die alleen toegankelijk zijn voor ingelogde gebruikers
 */
export const AuthGuard = () => {
  const router = inject(Router);
  const authService = inject<AuthService>(AuthService);

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
 * Auth Guard voor het beveiligen van routes die alleen toegankelijk zijn voor niet-ingelogde gebruikers
 * (bijvoorbeeld login en register pagina's)
 */
export const PublicGuard = () => {
  const router = inject(Router);
  const authService = inject<AuthService>(AuthService);

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
