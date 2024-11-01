import { AbstractControl, ValidatorFn } from '@angular/forms';

export function matchPasswordValidator(
  passwordControlName: string,
  confirmPasswordControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
    const passwordControl = formGroup.get(passwordControlName);
    const confirmPasswordControl = formGroup.get(confirmPasswordControlName);

    if (!passwordControl || !confirmPasswordControl) {
      return null;
    }

    if (
      confirmPasswordControl.errors &&
      !confirmPasswordControl.errors['passwordMismatch']
    ) {
      return null;
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPasswordControl.setErrors(null);
      return null;
    }
  };
}
