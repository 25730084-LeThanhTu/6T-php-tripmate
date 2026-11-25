import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import {
  MOCK_EXPENSE_CATEGORIES,
  findTrip,
  formatDate,
  formatDateRange,
  formatVnd,
} from '../../../core/mock/mock-data';
import {
  ExpenseStore,
  SPLIT_LONG_LABEL,
  SPLIT_SHORT_LABEL,
  StoredExpense,
  categoryName,
  dayLabel,
  memberLabel,
} from '../expense-store';

type OpenMenu = 'category' | 'payer' | null;
/** Bộ lọc người trả: memberId, 'fund' = quỹ chung, null = tất cả */
type PayerFilter = number | 'fund' | null;

interface DayGroup {
  date: string;
  label: string;
  total: number;
  items: StoredExpense[];
}

/**
 * Màn 15 · Chi tiêu
 * Figma: mobile 2:72 (Nội dung 2:75) · desktop 46:726 (Nội dung desktop 46:785)
 */
@Component({
  selector: 'app-expense-list',
  imports: [RouterLink],
  templateUrl: './expense-list.html',
  host: { class: 'flex flex-col gap-[18px] lg:gap-6' },
})
export default class ExpenseList {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(ExpenseStore);

  protected readonly tripId = toSignal(
    this.route.paramMap.pipe(map((p) => p.get('tripId') ?? '')),
    {
      initialValue: this.route.snapshot.paramMap.get('tripId') ?? '',
    },
  );
  protected readonly trip = computed(() => findTrip(this.tripId()));
  protected readonly tripTitle = computed(
    () => this.trip()?.title ?? `Chuyến đi #${this.tripId()}`,
  );
  protected readonly tripDates = computed(() => {
    const t = this.trip();
    return t ? formatDateRange(t.startDate, t.endDate) : '';
  });

  protected readonly expenses = computed(() => this.store.forTrip(this.tripId()));
  protected readonly memberCount = computed(() => this.store.tripMemberIds(this.tripId()).length);

  // ------------------------------------------------------------ Tóm tắt
  protected readonly total = computed(() => this.expenses().reduce((s, e) => s + e.amount, 0));
  protected readonly perPerson = computed(() =>
    this.memberCount() ? Math.round(this.total() / this.memberCount()) : 0,
  );
  protected readonly recordedRange = computed(() => {
    const dates = this.expenses()
      .map((e) => e.expenseDate)
      .sort();
    if (!dates.length) return 'Chưa có khoản chi';
    return formatDateRange(dates[0], dates[dates.length - 1]);
  });

  // ------------------------------------------------------------ Bộ lọc
  protected readonly categoryFilter = signal<number | null>(null);
  protected readonly payerFilter = signal<PayerFilter>(null);
  protected readonly openMenu = signal<OpenMenu>(null);

  protected readonly categories = MOCK_EXPENSE_CATEGORIES;
  protected readonly payerOptions = computed(() =>
    this.store.tripMemberIds(this.tripId()).map((id) => ({ id, label: memberLabel(id) })),
  );

  protected readonly isAll = computed(
    () => this.categoryFilter() === null && this.payerFilter() === null,
  );
  protected readonly categoryChipLabel = computed(() => {
    const id = this.categoryFilter();
    return id === null ? 'Hạng mục' : categoryName(id);
  });
  protected readonly payerChipLabel = computed(() => {
    const p = this.payerFilter();
    if (p === null) return 'Người trả';
    return p === 'fund' ? 'Quỹ chung' : memberLabel(p);
  });

  protected readonly filtered = computed(() => {
    const cat = this.categoryFilter();
    const payer = this.payerFilter();
    return this.expenses().filter((e) => {
      if (cat !== null && e.categoryId !== cat) return false;
      if (payer === 'fund') return e.isFromFund;
      if (payer !== null) return !e.isFromFund && e.payerMemberId === payer;
      return true;
    });
  });

  protected readonly groups = computed<DayGroup[]>(() => {
    const map = new Map<string, DayGroup>();
    for (const e of this.filtered()) {
      let g = map.get(e.expenseDate);
      if (!g) {
        g = { date: e.expenseDate, label: dayLabel(e.expenseDate), total: 0, items: [] };
        map.set(e.expenseDate, g);
      }
      g.total += e.amount;
      g.items.push(e);
    }
    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  });

  protected toggleMenu(menu: Exclude<OpenMenu, null>): void {
    this.openMenu.update((m) => (m === menu ? null : menu));
  }

  protected showAll(): void {
    this.categoryFilter.set(null);
    this.payerFilter.set(null);
    this.openMenu.set(null);
  }

  protected pickCategory(id: number | null): void {
    this.categoryFilter.set(id);
    this.openMenu.set(null);
  }

  protected pickPayer(p: PayerFilter): void {
    this.payerFilter.set(p);
    this.openMenu.set(null);
  }

  // ------------------------------------------------------------ Hiển thị
  protected readonly vnd = formatVnd;
  protected readonly date = formatDate;
  protected readonly categoryName = categoryName;

  protected payer(e: StoredExpense, withYou = true): string {
    return e.isFromFund ? 'Quỹ chung' : memberLabel(e.payerMemberId, withYou);
  }

  /** "Lan trả · Chia đều 4 người" */
  protected mobileMeta(e: StoredExpense): string {
    const who = e.isFromFund ? 'Từ quỹ chung' : `${memberLabel(e.payerMemberId, false)} trả`;
    return `${who} · ${SPLIT_LONG_LABEL[e.splitType]} ${e.splitMemberIds.length} người`;
  }

  /** "Đều · 4 người" */
  protected splitShort(e: StoredExpense): string {
    return `${SPLIT_SHORT_LABEL[e.splitType]} · ${e.splitMemberIds.length} người`;
  }

  protected detailLink(e: StoredExpense): string[] {
    return ['/trips', this.tripId(), 'expenses', String(e.id)];
  }

  /** Bỏ bản nháp đang sửa (từ màn 18) khi bắt đầu thêm khoản mới */
  protected startNew(): void {
    if (this.store.draft().editingId !== null) this.store.resetDraft();
  }

  protected readonly newLink = computed(() => ['/trips', this.tripId(), 'expenses', 'new']);
}
