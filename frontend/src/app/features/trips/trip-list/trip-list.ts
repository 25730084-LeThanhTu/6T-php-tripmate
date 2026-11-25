import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  MOCK_CURRENT_USER,
  MOCK_TRIPS,
  MockTrip,
  TRIP_STATUS_LABEL,
  formatDateRange,
  formatVnd,
} from '../../../core/mock/mock-data';
import {
  TRIP_FILTERS,
  TripFilter,
  budgetPercent,
  pendingSettlementForCurrentUser,
  tripDurationLabel,
} from '../../../core/mock/trips.mock';

/**
 * Màn 04 · Chuyến đi của tôi
 * Figma: mobile 2:17 · desktop 46:11 · bộ lọc 67:2168 (Filter · Mobile/Desktop · trip)
 */
@Component({
  selector: 'app-trip-list',
  imports: [RouterLink],
  templateUrl: './trip-list.html',
})
export default class TripList {
  protected readonly userName = MOCK_CURRENT_USER.shortName;
  protected readonly statusLabel = TRIP_STATUS_LABEL;
  protected readonly formatVnd = formatVnd;
  protected readonly formatDateRange = formatDateRange;
  protected readonly duration = tripDurationLabel;
  protected readonly percent = budgetPercent;

  protected readonly filter = signal<TripFilter>('ALL');

  protected readonly filters = TRIP_FILTERS.map((f) => ({
    ...f,
    count: f.statuses
      ? MOCK_TRIPS.filter((t) => f.statuses!.includes(t.status)).length
      : MOCK_TRIPS.length,
  }));

  private readonly visibleTrips = computed(() => {
    const option = TRIP_FILTERS.find((f) => f.key === this.filter())!;
    return option.statuses
      ? MOCK_TRIPS.filter((t) => option.statuses!.includes(t.status))
      : MOCK_TRIPS;
  });

  /** Thẻ nổi bật: chuyến đang diễn ra */
  protected readonly featured = computed(() =>
    this.visibleTrips().find((t) => t.status === 'ONGOING'),
  );
  /** Các hành trình còn lại */
  protected readonly others = computed(() =>
    this.visibleTrips().filter((t) => t !== this.featured()),
  );

  protected readonly reminder = pendingSettlementForCurrentUser();

  protected tripLink(trip: MockTrip): string {
    return `/trips/${trip.id}`;
  }
}
