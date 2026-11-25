import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import {
  ROLE_LABEL,
  TRIP_STATUS_LABEL,
  formatDateRange,
  formatVnd,
} from '../../../core/mock/mock-data';
import {
  MOCK_NEXT_ACTIVITY,
  budgetPercent,
  tripMembers,
  tripOrDefault,
} from '../../../core/mock/trips.mock';

/**
 * Màn 06 · Tổng quan chuyến đi
 * Figma: mobile 2:27 · desktop 46:141
 */
@Component({
  selector: 'app-trip-overview',
  imports: [RouterLink],
  templateUrl: './trip-overview.html',
})
export default class TripOverview {
  private readonly tripId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('tripId'))),
    {
      initialValue: null,
    },
  );

  protected readonly trip = computed(() => tripOrDefault(this.tripId()));
  /** Đường dẫn dùng id trên URL (giữ nguyên kể cả khi đang hiển thị dữ liệu dự phòng) */
  protected readonly base = computed(() => `/trips/${this.tripId() ?? this.trip().id}`);

  protected readonly statusLabel = computed(() => TRIP_STATUS_LABEL[this.trip().status]);
  protected readonly roleLabel = computed(() => ROLE_LABEL[this.trip().myRole]);
  protected readonly dates = computed(() =>
    formatDateRange(this.trip().startDate, this.trip().endDate),
  );
  protected readonly percent = computed(() => budgetPercent(this.trip()));
  protected readonly remaining = computed(() =>
    Math.max(0, this.trip().totalBudget - this.trip().spent),
  );
  protected readonly activity = computed(() => MOCK_NEXT_ACTIVITY[this.trip().id]);
  protected readonly members = computed(() => tripMembers(this.trip().id));

  protected readonly formatVnd = formatVnd;
  protected readonly roleLabels = ROLE_LABEL;

  protected readonly shortcuts = [
    { path: 'itinerary', label: 'Lịch trình', icon: 'icons/trips/calendar.svg' },
    { path: 'members', label: 'Thành viên', icon: 'icons/nav-user-active.svg' },
    { path: 'budget', label: 'Ngân sách', icon: 'icons/nav-wallet-active.svg' },
  ];
}
