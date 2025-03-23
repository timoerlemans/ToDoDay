import { NgModule } from '@angular/core';

/**
 * Core module containing singleton services and application-wide providers.
 * This module should only be imported in the root AppModule.
 */
@NgModule({
  declarations: [],
  imports: []
})
export class CoreModule {
  constructor() {
    // Ensure CoreModule is imported only by AppModule
    if (CoreModule.guardConstructor) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
    CoreModule.guardConstructor = true;
  }

  private static guardConstructor = false;
}
