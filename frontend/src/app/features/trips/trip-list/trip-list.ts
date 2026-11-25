import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  MOCK_CURRENT_USER,
  MOCK_TRIPS,
  MockTrip,
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
import { TranslatePipe } from '../../../core/i18n';

const FILTER_I18N_KEYS: Record<TripFilter, string> = {
  ALL: 'trips.filters.all',
  ONGOING: 'trips.filters.ongoing',
  UPCOMING: 'trips.filters.upcoming',
  COMPLETED: 'trips.filters.completed',
};

const STATUS_I18N_KEYS: Record<string, string> = {
  PLANNING: 'trips.status.PLANNING',
  ONGOING: 'trips.status.ONGOING',
  COMPLETED: 'trips.status.COMPLETED',
  CANCELLED: 'trips.status.CANCELLED',
};

/**
 * Màn 04 · Chuyến đi của tôi
 * Figma: mobile 2:17 · desktop 46:11 · bộ lọc 67:2168 (Filter · Mobile/Desktop · trip)
 */
@Component({
  selector: 'app-trip-list',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './trip-list.html',
})
export default class TripList {
  protected readonly userName = MOCK_CURRENT_USER.shortName;
  protected readonly statusKey = STATUS_I18N_KEYS;
  protected readonly formatVnd = formatVnd;
  protected readonly formatDateRange = formatDateRange;
  protected readonly duration = tripDurationLabel;
  protected readonly percent = budgetPercent;

  protected readonly filter = signal<TripFilter>('ALL');

  protected readonly filters = TRIP_FILTERS.map((f) => ({
    ...f,
    labelKey: FILTER_I18N_KEYS[f.key],
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
