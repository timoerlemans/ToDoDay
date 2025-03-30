import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '@tododay/features/auth/pages/login/login.component';
import { RegisterComponent } from '@tododay/features/auth/pages/register/register.component';
import { ResetPasswordComponent } from '@tododay/features/auth/pages/reset-password/reset-password.component';
import { UpdatePasswordComponent } from '@tododay/features/auth/pages/update-password/update-password.component';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    UpdatePasswordComponent
  ],
  imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule]
})
export class AuthModule {}
