import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import {
  MOCK_CURRENT_USER,
  MOCK_SETTLEMENTS,
  SettlementStatus,
  findTrip,
  formatDateRange,
  formatVnd,
  memberUser,
} from '../../../core/mock/mock-data';
import { findSettlementDetail } from '../../../core/mock/settlements.mock';

type DialogKind = 'confirm' | 'receipt' | 'info' | null;

/**
 * Màn 20 · Xác nhận thanh toán
 * Figma: mobile 2:97 · desktop 46:1051
 * Hộp thoại: "Xác nhận nhận tiền" 67:1969 / 67:2098, "Thông tin thao tác" 67:1941 / 67:2070
 */
@Component({
  selector: 'app-settlement-confirm',
  templateUrl: './settlement-confirm.html',
  host: {
    class: 'flex flex-col gap-[18px] lg:gap-6',
    '(document:keydown.escape)': 'closeDialog()',
  },
})
export default class SettlementConfirm {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });
  protected readonly tripId = computed(() => this.params().get('tripId') ?? '');
  private readonly settlementId = computed(() => Number(this.params().get('settlementId')));

  protected readonly trip = computed(() => findTrip(this.tripId()));
  protected readonly tripSubtitle = computed(() => {
    const t = this.trip();
    return t ? `${t.title}  ·  ${formatDateRange(t.startDate, t.endDate)}` : '';
  });

  protected readonly settlement = computed(
    () => MOCK_SETTLEMENTS.find((s) => s.id === this.settlementId()) ?? MOCK_SETTLEMENTS[0],
  );
  protected readonly detail = computed(() => findSettlementDetail(this.settlement().id));

  /** Trạng thái cục bộ — bấm xác nhận sẽ chuyển sang CONFIRMED */
  private readonly localStatus = signal<SettlementStatus | null>(null);
  protected readonly status = computed(() => this.localStatus() ?? this.settlement().status);

  protected readonly dialog = signal<DialogKind>(null);

  private readonly from = computed(() => memberUser(this.settlement().fromMemberId));
  private readonly to = computed(() => memberUser(this.settlement().toMemberId));
  protected readonly isReceiver = computed(() => this.to()?.id === MOCK_CURRENT_USER.id);

  protected readonly fromShort = computed(() => this.from()?.shortName ?? '');
  protected readonly toShort = computed(() => this.to()?.shortName ?? '');
  protected readonly amountText = computed(() => formatVnd(this.settlement().amount));
  protected readonly partiesText = computed(() => {
    const you = (id?: string) => (id === MOCK_CURRENT_USER.id ? ' · Bạn' : '');
    return `${this.from()?.fullName ?? ''} → ${this.to()?.fullName ?? ''}${you(this.to()?.id)}`;
  });

  protected readonly chipText = computed(() => {
    switch (this.status()) {
      case 'CONFIRMED':
        return 'ĐÃ XÁC NHẬN NHẬN TIỀN';
      case 'SENT':
        return 'ĐANG CHỜ NGƯỜI NHẬN XÁC NHẬN';
      default:
        return 'CHƯA THANH TOÁN';
    }
  });

  protected readonly headline = computed(() => {
    switch (this.status()) {
      case 'CONFIRMED':
        return 'Đã nhận đủ tiền';
      case 'SENT':
        return `${this.fromShort()} đã báo chuyển tiền`;
      default:
        return `${this.fromShort()} chưa chuyển tiền`;
    }
  });

  protected readonly subline = computed(() => {
    switch (this.status()) {
      case 'CONFIRMED':
        return `Khoản chuyển của ${this.fromShort()} đã được ghi nhận.`;
      case 'SENT':
        return 'Kiểm tra tài khoản trước khi xác nhận nhé.';
      default:
        return `Bạn sẽ được nhắc xác nhận khi ${this.fromShort()} báo đã chuyển.`;
    }
  });

  /** "2026-11-17T14:35:00+07:00" -> "17/11 · 14:35" */
  protected readonly sentAtText = computed(() => {
    const sentAt = this.settlement().sentAt;
    if (!sentAt) return '—';
    return `${sentAt.slice(8, 10)}/${sentAt.slice(5, 7)} · ${sentAt.slice(11, 16)}`;
  });

  protected readonly canConfirm = computed(() => this.status() === 'SENT' && this.isReceiver());

  /** "Tôi đã nhận đủ tiền": ghi nhận CONFIRMED (cục bộ) rồi mở hộp thoại 67:1969 / 67:2098 */
  protected confirmReceived(): void {
    this.localStatus.set('CONFIRMED');
    this.dialog.set('confirm');
  }

  protected backToList(): void {
    void this.router.navigate(['/trips', this.tripId(), 'settlements']);
  }

  protected closeDialog(): void {
    this.dialog.set(null);
  }
}
