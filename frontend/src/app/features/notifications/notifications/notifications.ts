import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MOCK_TRIPS, formatDateRange } from '../../../core/mock/mock-data';
import {
  MOCK_NOTIFICATIONS,
  MockNotification,
  NOTIFICATION_TYPE_LABEL,
} from '../../../core/mock/notifications.mock';

type NoticeFilter = 'all' | 'unread';

/**
 * Màn 24 · Thông báo
 * Figma: mobile 2:117 · desktop 46:1311
 * Bộ lọc: "Filter · Mobile · notice" 67:2720 / "Filter · Desktop · notice" 67:3362 (State=All / Unread)
 */
@Component({
  selector: 'app-notifications',
  imports: [RouterLink],
  templateUrl: './notifications.html',
  host: { class: 'flex flex-col gap-[18px] lg:gap-6' },
})
export default class Notifications {
  /** Figma desktop dùng mô tả của chuyến đi hiện tại dưới tiêu đề */
  private readonly currentTrip = MOCK_TRIPS[0];
  protected readonly subtitle = `${this.currentTrip.title}  ·  ${formatDateRange(this.currentTrip.startDate, this.currentTrip.endDate)}`;
  protected readonly typeLabel = NOTIFICATION_TYPE_LABEL;

  protected readonly items = signal<MockNotification[]>(MOCK_NOTIFICATIONS.map((n) => ({ ...n })));
  protected readonly filter = signal<NoticeFilter>('all');

  protected readonly unreadCount = computed(() => this.items().filter((n) => !n.isRead).length);
  protected readonly visible = computed(() =>
    this.filter() === 'unread' ? this.items().filter((n) => !n.isRead) : this.items(),
  );

  protected markRead(id: number): void {
    this.items.update((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  protected markAllRead(): void {
    this.items.update((list) => list.map((n) => ({ ...n, isRead: true })));
  }
}
