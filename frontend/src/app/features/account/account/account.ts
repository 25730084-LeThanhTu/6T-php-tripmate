import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { MOCK_CURRENT_USER, MOCK_TRIPS, formatDateRange } from '../../../core/mock/mock-data';

type EditSection = 'profile' | 'bank' | null;

/**
 * Màn 25 · Tài khoản
 * Figma: mobile 2:122 · desktop 46:1376
 * Phản hồi thao tác: "Thông tin thao tác" 67:1941 / 67:2070
 */
@Component({
  selector: 'app-account',
  imports: [ReactiveFormsModule],
  templateUrl: './account.html',
  host: { class: 'flex flex-col gap-[18px] lg:gap-6', '(document:keydown.escape)': 'closeInfo()' },
})
export default class Account {
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  /** Figma desktop dùng mô tả của chuyến đi hiện tại dưới tiêu đề */
  private readonly currentTrip = MOCK_TRIPS[0];
  protected readonly subtitle = `${this.currentTrip.title}  ·  ${formatDateRange(this.currentTrip.startDate, this.currentTrip.endDate)}`;

  protected readonly profile = signal({
    fullName: MOCK_CURRENT_USER.fullName,
    username: MOCK_CURRENT_USER.username,
    email: MOCK_CURRENT_USER.email,
    phone: MOCK_CURRENT_USER.phone ?? '',
  });
  protected readonly handle = computed(
    () => `@${this.profile().username}  ·  ${this.profile().email}`,
  );

  protected readonly tripStats = (() => {
    const count = (s: string) => MOCK_TRIPS.filter((t) => t.status === s).length;
    return `${count('ONGOING')} chuyến đang đi · ${count('PLANNING')} sắp tới · ${count('COMPLETED')} đã kết thúc`;
  })();

  protected readonly bank = signal<{ bankName: string; accountNumber: string } | null>(null);
  protected readonly notificationsOn = signal(true);
  protected readonly editing = signal<EditSection>(null);
  protected readonly info = signal<{ title: string; message: string } | null>(null);

  protected readonly profileForm = this.fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.pattern(/^[a-z0-9._]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
  });

  protected readonly bankForm = this.fb.group({
    bankName: ['', Validators.required],
    accountNumber: ['', [Validators.required, Validators.pattern(/^[0-9 ]{6,20}$/)]],
  });

  protected toggleEdit(section: Exclude<EditSection, null>): void {
    if (this.editing() === section) {
      this.editing.set(null);
      return;
    }
    if (section === 'profile') this.profileForm.reset(this.profile());
    if (section === 'bank') this.bankForm.reset(this.bank() ?? { bankName: '', accountNumber: '' });
    this.editing.set(section);
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.profile.set(this.profileForm.getRawValue());
    this.editing.set(null);
    this.showInfo('Đã lưu thông tin', 'Thông tin cá nhân của bạn đã được cập nhật.');
  }

  protected saveBank(): void {
    if (this.bankForm.invalid) {
      this.bankForm.markAllAsTouched();
      return;
    }
    this.bank.set(this.bankForm.getRawValue());
    this.editing.set(null);
    this.showInfo(
      'Đã lưu tài khoản nhận tiền',
      'Thành viên sẽ thấy tài khoản này khi chuyển tiền cho bạn.',
    );
  }

  protected toggleNotifications(): void {
    this.notificationsOn.update((v) => !v);
  }

  /** Thao tác chưa có màn riêng → hộp thoại "Thao tác minh họa" (67:1941 / 67:2070) */
  protected showDemo(): void {
    this.showInfo(
      'Thao tác minh họa',
      'Prototype sử dụng dữ liệu mẫu để trình bày luồng thao tác. Chức năng này sẽ hoạt động khi kết nối hệ thống.',
    );
  }

  protected closeInfo(): void {
    this.info.set(null);
  }

  protected logout(): void {
    void this.router.navigate(['/auth/login']);
  }

  private showInfo(title: string, message: string): void {
    this.info.set({ title, message });
  }
}
