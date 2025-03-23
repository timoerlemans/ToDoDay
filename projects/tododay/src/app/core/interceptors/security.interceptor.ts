import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

export function securityInterceptor(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  // Voeg security headers toe aan uitgaande requests
  const secureRequest = request.clone({
    setHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  });

  return next(secureRequest);
} 