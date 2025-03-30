import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from '@tododay/app.component';
import { routes } from '@tododay/app.routes';
import { CoreModule } from '@tododay/core/core.module';
import { securityInterceptor } from '@tododay/core/interceptors/security.interceptor';

/**
 * Root module of the application.
 *
 * @description
 * The AppModule is the main entry point of the application.
 * It imports all necessary modules and bootstraps the AppComponent.
 */
@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    CoreModule,
    RouterModule.forRoot(routes),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [provideHttpClient(withInterceptors([securityInterceptor]), withInterceptorsFromDi())]
})
export class AppModule {}
