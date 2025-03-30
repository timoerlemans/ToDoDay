import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from '@tododay/features/auth/pages/login/login.component';
import { RegisterComponent } from '@tododay/features/auth/pages/register/register.component';
import { ResetPasswordComponent } from '@tododay/features/auth/pages/reset-password/reset-password.component';
import { UpdatePasswordComponent } from '@tododay/features/auth/pages/update-password/update-password.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ResetPasswordComponent,
    UpdatePasswordComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, AuthRoutingModule],
})
export class AuthModule {}
