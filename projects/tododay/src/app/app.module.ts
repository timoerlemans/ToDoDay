import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { CoreModule } from './core/core.module';
import { ServiceWorkerModule, provideServiceWorker } from '@angular/service-worker';
import { securityInterceptor } from './core/interceptors/security.interceptor';

/**
 * Root module of the application.
 *
 * @description
 * The AppModule is the main entry point of the application.
 * It imports all necessary modules and bootstraps the AppComponent.
 */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CoreModule,
    RouterModule.forRoot(routes),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    provideHttpClient(
      withInterceptors([
        securityInterceptor
      ])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
