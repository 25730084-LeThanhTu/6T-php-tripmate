import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SplitType, findTrip, formatDateRange, formatVnd } from '../../../core/mock/mock-data';
import {
  ExpenseStore,
  SPLIT_LONG_LABEL,
  SPLIT_MODE_LABEL,
  SplitDraft,
  computeShares,
  memberLabel,
  splitEqually,
  splitError,
} from '../expense-store';

/**
 * Màn 17 · Cách chia chi phí
 * Figma: mobile 2:82 (Nội dung 2:85) · desktop 46:856 (Nội dung desktop 46:915)
 * Bốn cách chia EQUAL / EXACT / PERCENT / SHARES, tính phần từng người ngay khi nhập.
 */
@Component({
  selector: 'app-expense-split',
  templateUrl: './expense-split.html',
  host: { class: 'flex flex-col gap-[18px] lg:gap-6' },
})
export default class ExpenseSplit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ExpenseStore);

  protected readonly tripId = this.route.snapshot.paramMap.get('tripId') ?? '';
  private readonly trip = findTrip(this.tripId);
  protected readonly tripLine = this.trip
    ? `${this.trip.title}  ·  ${formatDateRange(this.trip.startDate, this.trip.endDate)}`
    : `Chuyến đi #${this.tripId}`;

  private readonly draft = this.store.draft();
  protected readonly amount = this.draft.amount;
  /** "Cà phê ngắm hoàng hôn · 600.000 ₫" */
  protected readonly expenseLine = `${this.draft.title.trim() || 'Khoản chi mới'} · ${formatVnd(this.amount)}`;

  protected readonly members = this.store.tripMemberIds(this.tripId).map((id) => ({
    id,
    label: memberLabel(id),
  }));

  protected readonly modes: readonly SplitType[] = ['EQUAL', 'EXACT', 'PERCENT', 'SHARES'];
  protected readonly modeLabel = SPLIT_MODE_LABEL;

  // ------------------------------------------------------------ Trạng thái cục bộ
  protected readonly mode = signal<SplitType>(this.draft.split.mode);
  protected readonly selected = signal<number[]>([...this.draft.split.selected]);
  protected readonly exact = signal<Record<number, number>>({ ...this.draft.split.exact });
  protected readonly percent = signal<Record<number, number>>({ ...this.draft.split.percent });
  protected readonly shareUnits = signal<Record<number, number>>({ ...this.draft.split.shares });

  private readonly split = computed<SplitDraft>(() => ({
    mode: this.mode(),
    selected: this.members.map((m) => m.id).filter((id) => this.selected().includes(id)),
    exact: this.exact(),
    percent: this.percent(),
    shares: this.shareUnits(),
  }));

  /** Phần của từng người (cập nhật ngay khi nhập) */
  protected readonly shares = computed(() => computeShares(this.amount, this.split()));
  protected readonly total = computed(() =>
    this.split().selected.reduce((s, id) => s + (this.shares()[id] ?? 0), 0),
  );
  protected readonly error = computed(() => splitError(this.amount, this.split()));
  protected readonly matched = computed(() => this.error() === null);
  protected readonly showError = signal(false);

  protected readonly percentTotal = computed(
    () =>
      Math.round(this.split().selected.reduce((s, id) => s + (this.percent()[id] ?? 0), 0) * 100) /
      100,
  );
  protected readonly unitTotal = computed(() =>
    this.split().selected.reduce((s, id) => s + (this.shareUnits()[id] ?? 0), 0),
  );

  protected readonly allSelected = computed(() => this.selected().length === this.members.length);
  protected readonly applyLabel = computed(
    () => `Áp dụng ${SPLIT_LONG_LABEL[this.mode()].toLowerCase()}`,
  );

  /** Dòng đối chiếu (46:2224) */
  protected readonly formula = computed(() => {
    const n = this.split().selected.length;
    switch (this.mode()) {
      case 'EQUAL': {
        const each = n ? Math.floor(this.amount / n) : 0;
        return `${formatVnd(each)} × ${n} thành viên = ${formatVnd(this.total())}`;
      }
      case 'EXACT':
        return `Đã chia ${formatVnd(this.total())} / ${formatVnd(this.amount)}`;
      case 'PERCENT':
        return `${this.percentTotal()}% / 100% = ${formatVnd(this.matched() ? this.amount : 0)}`;
      case 'SHARES': {
        const units = this.unitTotal();
        return units
          ? `${units} phần · ${formatVnd(Math.round(this.amount / units))} / phần`
          : '0 phần';
      }
    }
  });

  protected readonly vnd = formatVnd;
  protected readonly formatNumber = (n: number | undefined) =>
    n ? new Intl.NumberFormat('vi-VN').format(n) : '';

  // ------------------------------------------------------------ Thao tác
  protected setMode(mode: SplitType): void {
    const ids = this.split().selected;
    if (mode === 'EXACT' && ids.some((id) => this.exact()[id] === undefined)) {
      // Gợi ý: bắt đầu từ phần chia hiện tại
      this.exact.set({ ...this.shares() });
    }
    if (mode === 'PERCENT' && ids.some((id) => this.percent()[id] === undefined)) {
      const base = Math.floor(10000 / Math.max(ids.length, 1)) / 100;
      const values: Record<number, number> = {};
      ids.forEach((id, i) => {
        values[id] =
          i === ids.length - 1 ? Math.round((100 - base * (ids.length - 1)) * 100) / 100 : base;
      });
      this.percent.set(values);
    }
    if (mode === 'SHARES' && ids.some((id) => this.shareUnits()[id] === undefined)) {
      this.shareUnits.set(Object.fromEntries(ids.map((id) => [id, this.shareUnits()[id] ?? 1])));
    }
    this.mode.set(mode);
    this.showError.set(false);
  }

  protected isSelected(id: number): boolean {
    return this.selected().includes(id);
  }

  protected toggleMember(id: number): void {
    this.selected.update((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
    );
  }

  protected toggleAll(): void {
    this.selected.set(this.allSelected() ? [] : this.members.map((m) => m.id));
  }

  protected setExact(id: number, input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '').slice(0, 12);
    const value = digits ? Number(digits) : 0;
    this.exact.update((v) => ({ ...v, [id]: value }));
    input.value = this.formatNumber(value);
  }

  protected setPercent(id: number, value: string): void {
    const n = Math.min(100, Math.max(0, Number(value) || 0));
    this.percent.update((v) => ({ ...v, [id]: n }));
  }

  protected setUnits(id: number, value: string): void {
    const n = Math.max(0, Math.floor(Number(value) || 0));
    this.shareUnits.update((v) => ({ ...v, [id]: n }));
  }

  /** Chia đều phần còn lại khi chọn "Số tiền" */
  protected fillEqually(): void {
    this.exact.set({ ...this.exact(), ...splitEqually(this.amount, this.split().selected) });
  }

  protected apply(): void {
    if (!this.matched()) {
      this.showError.set(true);
      return;
    }
    this.store.setSplit(this.split());
    // Quay lại màn 16 để lưu khoản chi
    void this.router.navigate(['/trips', this.tripId, 'expenses', 'new']);
  }
}
