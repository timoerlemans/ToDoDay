import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from '@tododay/app.routes';
import { securityInterceptor } from '@tododay/core/interceptors/security.interceptor';

/**
 * Application-wide configuration.
 * Sets up core providers for:
 * - Routing
 * - Service Worker (PWA)
 * - HTTP Client with security interceptor
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(
      withInterceptors([
        securityInterceptor
      ])
    )
  ]
};
