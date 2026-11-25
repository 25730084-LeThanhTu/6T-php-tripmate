import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { findTrip, formatDateRange } from '../../../core/mock/mock-data';
import { DEFAULT_TRIP_ID, MOCK_TRIP_NOTE } from '../../../core/mock/trips.mock';

/**
 * Màn 05 · Tạo chuyến đi
 * Figma: mobile 2:22 · desktop 46:76
 * Dữ liệu giả: gửi form chỉ điều hướng sang chuyến "da-lat".
 */
@Component({
  selector: 'app-trip-create',
  imports: [ReactiveFormsModule],
  templateUrl: './trip-create.html',
})
export default class TripCreate {
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly sample = findTrip(DEFAULT_TRIP_ID)!;

  protected readonly form = this.fb.group({
    title: [this.sample.title, Validators.required],
    startDate: [this.sample.startDate, Validators.required],
    endDate: [this.sample.endDate, Validators.required],
    location: [this.sample.location, Validators.required],
    budget: [new Intl.NumberFormat('vi-VN').format(this.sample.totalBudget)],
    description: [MOCK_TRIP_NOTE],
  });

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** "Đà Lạt cùng hội bạn  ·  16 – 18/11/2026" (Figma 46:139) */
  protected readonly summary = computed(() => {
    const v = this.value();
    const title = v.title?.trim() || 'Chuyến đi mới';
    return v.startDate && v.endDate
      ? `${title}  ·  ${formatDateRange(v.startDate, v.endDate)}`
      : title;
  });

  protected readonly dateError = computed(() => {
    const v = this.value();
    return !!v.startDate && !!v.endDate && v.endDate < v.startDate;
  });

  protected readonly cover = signal(this.sample.coverImage ?? 'images/trips/da-lat.jpg');
  protected readonly submitted = signal(false);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokeCover());
  }

  protected onCoverSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.revokeCover();
    this.cover.set(URL.createObjectURL(file));
  }

  /** Chỉ giữ chữ số cho ô ngân sách, hiển thị dạng 12.000.000 */
  protected onBudgetInput(event: Event): void {
    const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '');
    const formatted = digits ? new Intl.NumberFormat('vi-VN').format(Number(digits)) : '';
    this.form.controls.budget.setValue(formatted);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.dateError()) {
      this.form.markAllAsTouched();
      return;
    }
    this.router.navigate(['/trips', DEFAULT_TRIP_ID]);
  }

  private revokeCover(): void {
    const url = this.cover();
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  }
}
