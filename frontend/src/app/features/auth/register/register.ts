import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AUTH_LINKS, AUTH_PREFILL } from '../../../core/mock/auth.mock';
import { TranslatePipe } from '../../../core/i18n';

interface RegisterField {
  id: string;
  labelKey: string;
  control: 'fullName' | 'username' | 'email' | 'password' | 'confirmPassword';
  type: 'text' | 'email' | 'password';
  placeholderKey: string;
  autocomplete: string;
  /** Biểu tượng trong ô nhập (null = chưa có tài sản tương ứng). */
  icon: string | null;
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = group.value as {
    password: string;
    confirmPassword: string;
  };
  return password === confirmPassword ? null : { mismatch: true };
}

/**
 * Màn 02 · Đăng ký
 * Figma: mobile 2:7 · desktop 46:5
 * Đăng ký giả lập: hợp lệ → chuyển tới /trips.
 */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.html',
})
export default class Register {
  private readonly router = inject(Router);

  protected readonly links = AUTH_LINKS;
  protected readonly submitting = signal(false);

  protected readonly fields: readonly RegisterField[] = [
    {
      id: 'reg-name',
      labelKey: 'auth.register.fullName',
      control: 'fullName',
      type: 'text',
      placeholderKey: 'auth.register.fullNamePlaceholder',
      autocomplete: 'name',
      icon: null,
    },
    {
      id: 'reg-username',
      labelKey: 'auth.register.username',
      control: 'username',
      type: 'text',
      placeholderKey: 'auth.register.usernamePlaceholder',
      autocomplete: 'username',
      icon: null,
    },
    {
      id: 'reg-email',
      labelKey: 'auth.register.email',
      control: 'email',
      type: 'email',
      placeholderKey: 'auth.register.emailPlaceholder',
      autocomplete: 'email',
      icon: 'icons/auth/mail.svg',
    },
    {
      id: 'reg-password',
      labelKey: 'auth.register.password',
      control: 'password',
      type: 'password',
      placeholderKey: 'auth.register.passwordPlaceholder',
      autocomplete: 'new-password',
      icon: 'icons/auth/lock.svg',
    },
    {
      id: 'reg-confirm',
      labelKey: 'auth.register.confirmPassword',
      control: 'confirmPassword',
      type: 'password',
      placeholderKey: 'auth.register.confirmPasswordPlaceholder',
      autocomplete: 'new-password',
      icon: 'icons/auth/lock.svg',
    },
  ];

  protected readonly form = inject(FormBuilder).nonNullable.group(
    {
      fullName: [AUTH_PREFILL.fullName, Validators.required],
      username: [AUTH_PREFILL.username, Validators.required],
      email: [AUTH_PREFILL.email, [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  protected invalid(field: RegisterField): boolean {
    const control = this.form.controls[field.control];
    const mismatch = field.control === 'confirmPassword' && this.form.hasError('mismatch');
    return control.touched && (control.invalid || mismatch);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    void this.router.navigateByUrl(AUTH_LINKS.afterRegister);
  }
}
