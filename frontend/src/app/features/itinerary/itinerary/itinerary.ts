import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import {
  ACTIVITY_STATUS_LABEL,
  MockActivity,
  activitiesOf,
  durationLabel,
  itineraryDays,
} from '../../../core/mock/itinerary.mock';
import { MOCK_TRIPS, findTrip, formatDateRange, formatVnd } from '../../../core/mock/mock-data';

/**
 * Màn 11 · Lịch trình
 * Figma: mobile 2:52 · desktop 46:466
 * Bộ chọn ngày: component "Filter · Mobile · day" (67:2469) / "Filter · Desktop · day" (67:3111)
 */
@Component({
  selector: 'app-itinerary',
  imports: [RouterLink],
  templateUrl: './itinerary.html',
})
export default class Itinerary {
  private readonly route = inject(ActivatedRoute);

  protected readonly statusLabel = ACTIVITY_STATUS_LABEL;

  private readonly tripId = toSignal(this.route.paramMap.pipe(map((p) => p.get('tripId') ?? '')), {
    initialValue: this.route.snapshot.paramMap.get('tripId') ?? '',
  });

  // TODO(API): lấy chuyến đi + lịch trình từ backend
  protected readonly trip = computed(() => findTrip(this.tripId()) ?? MOCK_TRIPS[0]);
  protected readonly dateRange = computed(() =>
    formatDateRange(this.trip().startDate, this.trip().endDate),
  );
  protected readonly days = computed(() => itineraryDays(this.trip()));
  protected readonly duration = computed(() => durationLabel(this.days().length));

  /** Ngày đang chọn — mặc định ngày 2 như Figma (hoặc ngày truyền qua ?day=) */
  private readonly pickedDate = signal<string | null>(this.route.snapshot.queryParamMap.get('day'));

  protected readonly selectedDay = computed(() => {
    const days = this.days();
    return days.find((d) => d.date === this.pickedDate()) ?? days[1] ?? days[0];
  });

  protected readonly activities = computed<MockActivity[]>(() => {
    const day = this.selectedDay();
    return day ? activitiesOf(this.trip().id, day.date) : [];
  });

  protected readonly totalCost = computed(() =>
    this.activities().reduce((sum, a) => sum + a.estimatedCost, 0),
  );

  protected selectDay(date: string): void {
    this.pickedDate.set(date);
  }

  protected cost(amount: number): string {
    return amount > 0 ? formatVnd(amount) : 'Miễn phí';
  }

  protected formatVnd(amount: number): string {
    return formatVnd(amount);
  }
}
