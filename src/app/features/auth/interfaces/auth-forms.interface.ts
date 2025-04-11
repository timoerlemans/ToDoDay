import { FormControl, ValidationErrors } from '@angular/forms';

export interface FormErrors {
  [key: string]: ValidationErrors | null;
}

export interface ResetPasswordForm {
  email: FormControl<string>;
}

export interface UpdatePasswordForm {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}
