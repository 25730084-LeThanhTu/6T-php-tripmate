import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { addMockActivity, itineraryDays } from '../../../core/mock/itinerary.mock';
import {
  MOCK_TRIPS,
  findTrip,
  formatDate,
  formatDateRange,
  formatVnd,
} from '../../../core/mock/mock-data';

/** Giá trị mẫu hiển thị làm placeholder / xem trước (theo Figma) */
const SAMPLE = {
  title: 'Cà phê ngắm hoàng hôn',
  place: 'Túi Mơ To, Đà Lạt',
  cost: '600.000 ₫',
  notes: 'Mang áo khoác, đến sớm chọn bàn đẹp.',
};

/**
 * Màn 12 · Thêm hoạt động
 * Figma: mobile 2:57 · desktop 46:531
 */
@Component({
  selector: 'app-activity-create',
  imports: [ReactiveFormsModule],
  templateUrl: './activity-create.html',
})
export default class ActivityCreate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly sample = SAMPLE;

  // TODO(API): lấy chuyến đi từ backend
  protected readonly trip = findTrip(this.route.snapshot.paramMap.get('tripId')) ?? MOCK_TRIPS[0];
  protected readonly dateRange = formatDateRange(this.trip.startDate, this.trip.endDate);
  protected readonly days = itineraryDays(this.trip);

  private readonly initialDay =
    this.days.find((d) => d.date === this.route.snapshot.queryParamMap.get('day'))?.date ??
    this.days[1]?.date ??
    this.days[0]?.date ??
    '';

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', Validators.required],
    date: [this.initialDay, Validators.required],
    startTime: ['15:00', Validators.required],
    endTime: ['17:00', Validators.required],
    place: [''],
    cost: [''],
    notes: [''],
  });

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** Chi phí người dùng nhập, chỉ giữ chữ số */
  private readonly costAmount = computed(
    () => Number((this.value().cost ?? '').replace(/\D/g, '')) || 0,
  );

  /** Xem trước điểm hẹn (desktop, Figma 46:1949) */
  protected readonly preview = computed(() => {
    const v = this.value();
    const amount = this.costAmount();
    return {
      title: v.title?.trim() || SAMPLE.title,
      place: v.place?.trim() || SAMPLE.place,
      when: `${v.date ? formatDate(v.date) : ''} · ${v.startTime || '--:--'} – ${v.endTime || '--:--'}`,
      cost: amount > 0 ? formatVnd(amount) : v.cost ? 'Miễn phí' : SAMPLE.cost,
    };
  });

  protected readonly showErrors = signal(false);

  /** Định dạng lại ô chi phí khi rời ô: 600000 -> "600.000 ₫" */
  protected formatCost(): void {
    const amount = this.costAmount();
    if (amount > 0) this.form.controls.cost.setValue(formatVnd(amount));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.showErrors.set(true);
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    // TODO(API): gọi API tạo hoạt động
    addMockActivity({
      tripId: this.trip.id,
      date: v.date,
      title: v.title.trim(),
      place: v.place.trim(),
      startTime: v.startTime,
      endTime: v.endTime,
      estimatedCost: this.costAmount(),
      status: 'UPCOMING',
      notes: v.notes.trim() || undefined,
    });
    this.router.navigate(['/trips', this.trip.id, 'itinerary'], { queryParams: { day: v.date } });
  }
}
