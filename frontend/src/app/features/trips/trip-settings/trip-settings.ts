import { Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { TRIP_STATUS_LABEL, TripStatus, formatDateRange } from '../../../core/mock/mock-data';
import { MOCK_TRIP_NOTE, tripMembers, tripOrDefault } from '../../../core/mock/trips.mock';

type DangerAction = 'close' | 'delete';

/**
 * Màn 07 · Cài đặt chuyến đi
 * Figma: mobile 2:32 · desktop 46:206
 * Hộp xác nhận: Prototype · Xác nhận thao tác quan trọng (67:1979 mobile / 67:2108 desktop)
 */
@Component({
  selector: 'app-trip-settings',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './trip-settings.html',
  host: { '(document:keydown.escape)': 'cancelConfirm()' },
})
export default class TripSettings {
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);

  private readonly tripId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('tripId'))),
    {
      initialValue: null,
    },
  );

  protected readonly trip = computed(() => tripOrDefault(this.tripId()));
  protected readonly base = computed(() => `/trips/${this.tripId() ?? this.trip().id}`);
  protected readonly dates = computed(() =>
    formatDateRange(this.trip().startDate, this.trip().endDate),
  );
  protected readonly memberCount = computed(
    () => tripMembers(this.trip().id).length || this.trip().memberCount,
  );
  protected readonly isLeader = computed(() => this.trip().myRole === 'LEADER');

  /** Trạng thái hiển thị; đổi thành "Đã kết thúc" sau khi đóng chuyến (giả lập) */
  protected readonly status = signal<TripStatus>('ONGOING');
  protected readonly statusLabel = computed(() => TRIP_STATUS_LABEL[this.status()]);

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    description: [''],
  });

  protected readonly saved = signal(false);
  protected readonly coverName = signal<string | null>(null);
  protected readonly confirm = signal<DangerAction | null>(null);

  constructor() {
    // Nạp lại form khi :tripId thay đổi
    effect(() => {
      const t = this.trip();
      this.form.reset({
        title: t.title,
        startDate: t.startDate,
        endDate: t.endDate,
        description: t.id === 'da-lat' ? MOCK_TRIP_NOTE : (t.description ?? ''),
      });
      this.status.set(t.status);
      this.saved.set(false);
    });
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.saved.set(false));
  }

  protected save(): void {
    const v = this.form.getRawValue();
    if (this.form.invalid || v.endDate < v.startDate) {
      this.form.markAllAsTouched();
      return;
    }
    this.form.markAsPristine();
    this.saved.set(true);
  }

  protected onCoverSelected(event: Event): void {
    this.coverName.set((event.target as HTMLInputElement).files?.[0]?.name ?? null);
  }

  protected askConfirm(action: DangerAction): void {
    if (action === 'delete' && !this.isLeader()) return;
    this.confirm.set(action);
  }

  protected cancelConfirm(): void {
    this.confirm.set(null);
  }

  protected proceed(): void {
    const action = this.confirm();
    this.confirm.set(null);
    if (action === 'close') {
      this.status.set('COMPLETED');
    } else if (action === 'delete') {
      this.router.navigate(['/trips']);
    }
  }
}
