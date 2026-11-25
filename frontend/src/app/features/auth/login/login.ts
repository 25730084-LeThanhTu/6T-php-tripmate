import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AUTH_LINKS, AUTH_PREFILL } from '../../../core/mock/auth.mock';

/**
 * Màn 01 · Đăng nhập
 * Figma: mobile 2:2 · desktop 46:2
 * Đăng nhập giả lập: hợp lệ → chuyển tới /trips.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export default class Login {
  private readonly router = inject(Router);

  protected readonly links = AUTH_LINKS;
  protected readonly submitting = signal(false);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: [AUTH_PREFILL.email, [Validators.required, Validators.email]],
    password: [AUTH_PREFILL.password, Validators.required],
    remember: [true],
  });

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    void this.router.navigateByUrl(AUTH_LINKS.afterLogin);
  }
}
