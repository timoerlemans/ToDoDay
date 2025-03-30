import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from '@tododay/app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { securityInterceptor } from '@tododay/core/interceptors/security.interceptor';

/**
 * Application-wide configuration.
 * Sets up core providers for:
 * - Routing
 * - Client Hydration
 * - HTTP Client with security interceptor
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([securityInterceptor])),
  ],
};
