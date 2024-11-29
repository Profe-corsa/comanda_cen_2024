import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function googleEmailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value;
    const isGoogleEmail = email?.endsWith('@gmail.com');
    return isGoogleEmail ? null : { notGoogleEmail: true };
  };
}
