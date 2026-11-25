import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import {
  MOCK_CURRENT_USER,
  MOCK_EXPENSES,
  MOCK_MEMBERS,
  MOCK_SETTLEMENTS,
  SettlementStatus,
  findTrip,
  formatDateRange,
  formatVnd,
  memberUser,
} from '../../../core/mock/mock-data';
import { computeBalances, suggestTransfers } from '../settlement-math';

interface BalanceRow {
  memberId: number;
  label: string;
  amount: number;
  text: string;
  /** Màu số dư: xanh = được nhận, đỏ = cần trả (màu mới, chưa có token) */
  tone: string;
}

interface TransferCard {
  fromMemberId: number;
  toMemberId: number;
  label: string;
  amountText: string;
  settlementId: number | null;
  status: SettlementStatus;
  statusLabel: string;
  /** Người dùng hiện tại là người nhận và đối phương đã báo chuyển */
  awaitingMe: boolean;
  sentNote: string | null;
}

/**
 * Màn 19 · Chia tiền
 * Figma: mobile 2:92 · desktop 46:986
 */
@Component({
  selector: 'app-settlement-list',
  imports: [RouterLink],
  templateUrl: './settlement-list.html',
  host: { class: 'flex flex-col gap-[18px] lg:gap-6' },
})
export default class SettlementList {
  private readonly route = inject(ActivatedRoute);

  protected readonly tripId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('tripId') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('tripId') ?? '',
    },
  );

  protected readonly trip = computed(() => findTrip(this.tripId()));
  protected readonly tripSubtitle = computed(() => {
    const t = this.trip();
    return t ? `${t.title}  ·  ${formatDateRange(t.startDate, t.endDate)}` : '';
  });

  private readonly memberIds = computed(() =>
    MOCK_MEMBERS.filter((m) => m.tripId === this.tripId()).map((m) => m.id),
  );
  private readonly expenses = computed(() =>
    MOCK_EXPENSES.filter((e) => e.tripId === this.tripId()),
  );

  protected readonly summary = computed(() => {
    const total = this.expenses().reduce((sum, e) => sum + e.amount, 0);
    return `Chia đều ${formatVnd(total)} cho ${this.memberIds().length} thành viên.`;
  });

  private readonly balances = computed(() => computeBalances(this.memberIds(), this.expenses()));

  protected readonly balanceRows = computed<BalanceRow[]>(() =>
    [...this.balances()].map(([memberId, amount]) => ({
      memberId,
      label: this.memberLabel(memberId),
      amount,
      text:
        amount > 0 ? `+${formatVnd(amount)}` : amount < 0 ? `−${formatVnd(-amount)}` : formatVnd(0),
      tone: amount > 0 ? 'text-success' : amount < 0 ? 'text-danger' : 'text-ink',
    })),
  );

  protected readonly transfers = computed<TransferCard[]>(() =>
    suggestTransfers(this.balances()).map((t) => {
      const settlement = MOCK_SETTLEMENTS.find(
        (s) =>
          s.tripId === this.tripId() &&
          s.fromMemberId === t.fromMemberId &&
          s.toMemberId === t.toMemberId,
      );
      const status: SettlementStatus = settlement?.status ?? 'PENDING';
      const awaitingMe = status === 'SENT' && this.isMe(t.toMemberId);
      const fromName = memberUser(t.fromMemberId)?.shortName ?? '';
      return {
        fromMemberId: t.fromMemberId,
        toMemberId: t.toMemberId,
        label: `${this.memberLabel(t.fromMemberId)} → ${this.memberLabel(t.toMemberId)}`,
        amountText: formatVnd(t.amount),
        settlementId: settlement?.id ?? null,
        status,
        statusLabel: this.statusLabel(status, awaitingMe),
        awaitingMe,
        sentNote:
          status === 'SENT' && settlement?.sentAt
            ? `${fromName} đã báo chuyển tiền lúc ${settlement.sentAt.slice(11, 16)}.`
            : null,
      };
    }),
  );

  protected readonly transferCountText = computed(() => {
    const n = this.transfers().length;
    return n === 0 ? 'Không cần chuyển' : `Chỉ ${n} lượt chuyển`;
  });

  private isMe(memberId: number): boolean {
    return memberUser(memberId)?.id === MOCK_CURRENT_USER.id;
  }

  private memberLabel(memberId: number): string {
    const name = memberUser(memberId)?.shortName ?? `#${memberId}`;
    return this.isMe(memberId) ? `${name} · Bạn` : name;
  }

  private statusLabel(status: SettlementStatus, awaitingMe: boolean): string {
    switch (status) {
      case 'SENT':
        return awaitingMe ? 'Chờ bạn xác nhận đã nhận' : 'Chờ người nhận xác nhận';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      default:
        return 'Chưa thanh toán';
    }
  }
}
