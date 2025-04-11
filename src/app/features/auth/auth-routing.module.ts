import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@tododay/features/auth/pages/login/login.component';
import { RegisterComponent } from '@tododay/features/auth/pages/register/register.component';
import { ResetPasswordComponent } from '@tododay/features/auth/pages/reset-password/reset-password.component';
import { UpdatePasswordComponent } from '@tododay/features/auth/pages/update-password/update-password.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'update-password', component: UpdatePasswordComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
