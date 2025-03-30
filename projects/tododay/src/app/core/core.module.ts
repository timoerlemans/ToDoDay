import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

/**
 * Core module containing singleton services and application-wide providers.
 * This module should only be imported in the root AppModule.
 */
@NgModule({ imports: [CommonModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class CoreModule {
  private static guardConstructor = false;

  constructor(@Optional() @SkipSelf() parentModule?: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only');
    }
    CoreModule.guardConstructor = true;
  }
}
