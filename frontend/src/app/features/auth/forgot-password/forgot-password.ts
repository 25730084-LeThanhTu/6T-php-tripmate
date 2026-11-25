import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AUTH_LINKS, AUTH_PREFILL, RESET_RESEND_SECONDS } from '../../../core/mock/auth.mock';
import { TranslatePipe } from '../../../core/i18n';

/**
 * Màn 03 · Khôi phục mật khẩu
 * Figma: mobile 2:12 · desktop 46:8
 * Trạng thái đã gửi: Prototype · Khôi phục mật khẩu · Mobile 67:1948 / Desktop 67:2077
 */
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './forgot-password.html',
})
export default class ForgotPassword {
  protected readonly links = AUTH_LINKS;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: [AUTH_PREFILL.email, [Validators.required, Validators.email]],
  });

  /** Đã gửi liên kết (giả lập) → hiện thẻ xác nhận. */
  protected readonly sent = signal(false);
  protected readonly sentTo = signal('');

  /** Đếm ngược "Gửi lại sau 00:59". */
  protected readonly secondsLeft = signal(RESET_RESEND_SECONDS);
  protected readonly countdown = computed(
    () => `00:${String(this.secondsLeft()).padStart(2, '0')}`,
  );

  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCountdown();
    inject(DestroyRef).onDestroy(() => this.stopCountdown());
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sentTo.set(this.form.controls.email.value);
    this.sent.set(true);
  }

  protected resend(): void {
    if (this.secondsLeft() > 0) return;
    this.startCountdown();
  }

  private startCountdown(): void {
    this.stopCountdown();
    this.secondsLeft.set(RESET_RESEND_SECONDS);
    this.timer = setInterval(() => {
      const next = this.secondsLeft() - 1;
      this.secondsLeft.set(Math.max(next, 0));
      if (next <= 0) this.stopCountdown();
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
