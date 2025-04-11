import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { routes } from '@tododay/app.routes';
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
    provideHttpClient(withInterceptors([securityInterceptor]))
  ]
};
