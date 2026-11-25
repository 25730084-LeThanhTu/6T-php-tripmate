import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import {
  MOCK_MEMBERS,
  MOCK_TRIPS,
  ROLE_LABEL,
  findTrip,
  findUser,
  formatDateRange,
  formatVnd,
} from '../../../core/mock/mock-data';
import { findReceivedInvitation } from '../../../core/mock/members.mock';

/**
 * Màn 10 · Chi tiết lời mời (góc nhìn người được mời)
 * Figma: mobile 2:47 · desktop 46:401
 */
@Component({
  selector: 'app-invitation-detail',
  templateUrl: './invitation-detail.html',
  host: { class: 'flex flex-col' },
})
export default class InvitationDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly code = toSignal(this.route.paramMap.pipe(map((p) => p.get('code'))), {
    initialValue: this.route.snapshot.paramMap.get('code'),
  });

  protected readonly invitation = computed(() => findReceivedInvitation(this.code()));
  protected readonly trip = computed(() => findTrip(this.invitation().tripId) ?? MOCK_TRIPS[0]);
  protected readonly inviterName = computed(
    () => findUser(this.invitation().inviterUserId)?.fullName ?? '',
  );
  protected readonly dates = computed(() =>
    formatDateRange(this.trip().startDate, this.trip().endDate),
  );
  protected readonly subtitle = computed(() => `${this.trip().title}  ·  ${this.dates()}`);
  /** "Đà Lạt, Lâm Đồng" -> "Đà Lạt" */
  protected readonly destination = computed(() => this.trip().location.split(',')[0]);
  protected readonly memberCount = computed(
    () => MOCK_MEMBERS.filter((m) => m.tripId === this.trip().id).length || this.trip().memberCount,
  );

  protected readonly details = computed(() => [
    { label: 'Thời gian', value: this.dates() },
    { label: 'Điểm đến', value: this.destination() },
    { label: 'Thành viên hiện tại', value: `${this.memberCount()} người` },
    { label: 'Vai trò của bạn', value: ROLE_LABEL[this.invitation().role] },
    { label: 'Ngân sách nhóm', value: formatVnd(this.trip().totalBudget) },
  ]);

  protected readonly pending = signal<'accept' | 'decline' | null>(null);

  protected accept(): void {
    this.pending.set('accept');
    void this.router.navigate(['/trips', this.trip().id]);
  }

  protected decline(): void {
    this.pending.set('decline');
    void this.router.navigate(['/trips']);
  }
}
