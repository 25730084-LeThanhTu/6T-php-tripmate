import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EXPENSE_MOCK_TODAY, expenseAuditLogs } from '../../../core/mock/expenses.mock';
import { findTrip, formatDate, formatDateRange, formatVnd } from '../../../core/mock/mock-data';
import {
  ExpenseStore,
  SPLIT_LONG_LABEL,
  categoryName,
  memberLabel,
} from '../expense-store';

/**
 * Màn 18 · Chi tiết khoản chi
 * Figma: mobile 2:87 (Nội dung 2:90) · desktop 46:921 (Nội dung desktop 46:980)
 * Xác nhận xoá: prototype "Xác nhận thao tác quan trọng" 67:1979 (mobile) / 67:2108 (desktop)
 */
@Component({
  selector: 'app-expense-detail',
  imports: [RouterLink],
  templateUrl: './expense-detail.html',
  host: {
    class: 'flex flex-col gap-[18px] lg:gap-6',
    '(document:keydown.escape)': 'cancelDelete()',
  },
})
export default class ExpenseDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ExpenseStore);

  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  protected readonly tripId = computed(() => this.params().get('tripId') ?? '');
  private readonly expenseId = computed(() => Number(this.params().get('expenseId')));

  protected readonly tripLine = computed(() => {
    const t = findTrip(this.tripId());
    return t ? `${t.title}  ·  ${formatDateRange(t.startDate, t.endDate)}` : `Chuyến đi #${this.tripId()}`;
  });
  /** Ghi chú cuối mobile (2:1032): "Đà Lạt cùng hội bạn · 16 – 18/11/2026" */
  protected readonly tripFooter = computed(() => this.tripLine().replace(/ {2}· {2}/, ' · '));

  protected readonly expense = computed(() => this.store.find(this.tripId(), this.expenseId()));
  protected readonly listLink = computed(() => ['/trips', this.tripId(), 'expenses']);

  /** "ĐÃ GHI NHẬN · HÔM NAY" */
  protected readonly badge = computed(() => {
    const e = this.expense();
    if (!e) return '';
    const diff = Math.round((Date.parse(EXPENSE_MOCK_TODAY) - Date.parse(e.expenseDate)) / 86_400_000);
    const when = diff === 0 ? 'HÔM NAY' : diff === 1 ? 'HÔM QUA' : formatDate(e.expenseDate);
    return `ĐÃ GHI NHẬN · ${when}`;
  });

  protected readonly shares = computed(() => {
    const e = this.expense();
    if (!e) return [];
    const values = this.store.sharesOf(e);
    return e.splitMemberIds.map((id) => ({ id, label: memberLabel(id), amount: values[id] ?? 0 }));
  });

  /** Phần mỗi người: một số nếu mọi người bằng nhau */
  protected readonly perPerson = computed(() => {
    const s = this.shares();
    if (!s.length) return '—';
    return s.every((x) => x.amount === s[0].amount) ? formatVnd(s[0].amount) : 'Khác nhau theo người';
  });

  protected readonly info = computed(() => {
    const e = this.expense();
    if (!e) return [];
    return [
      { label: 'Người trả', value: e.isFromFund ? 'Quỹ chung' : memberLabel(e.payerMemberId) },
      { label: 'Ngày chi', value: formatDate(e.expenseDate) },
      { label: 'Nguồn tiền', value: e.isFromFund ? 'Quỹ chung' : 'Ứng cá nhân' },
      { label: 'Cách chia', value: `${SPLIT_LONG_LABEL[e.splitType]} · ${e.splitMemberIds.length} người` },
      { label: 'Phần mỗi người', value: this.perPerson() },
    ];
  });

  protected readonly logs = computed(() =>
    expenseAuditLogs(this.expenseId()).map((l) => ({
      id: l.id,
      title: `${l.createdAt.slice(11, 16)} · ${memberLabel(l.actorMemberId, false)} ${l.summary}`,
      detail: l.detail,
    })),
  );

  protected readonly vnd = formatVnd;
  protected readonly categoryName = categoryName;

  protected readonly showReceipt = signal(false);
  protected readonly confirmOpen = signal(false);

  protected edit(): void {
    const e = this.expense();
    if (!e) return;
    this.store.startEdit(e);
    void this.router.navigate(['/trips', this.tripId(), 'expenses', 'new']);
  }

  protected askDelete(): void {
    this.confirmOpen.set(true);
  }

  protected cancelDelete(): void {
    this.confirmOpen.set(false);
  }

  protected confirmDelete(): void {
    const e = this.expense();
    this.confirmOpen.set(false);
    if (!e) return;
    // TODO(API): DELETE /trips/:tripId/expenses/:expenseId (ghi audit log)
    this.store.remove(e.id);
    void this.router.navigate(this.listLink());
  }
}
