import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

/**
 * Root module of the application.
 *
 * @description
 * The AppModule bootstraps the application and configures:
 * - Core Angular modules (BrowserModule, RouterModule)
 * - Root component (AppComponent)
 * - Application routing
 */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
