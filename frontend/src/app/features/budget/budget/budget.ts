import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { budgetTrip, formatMillion } from '../../../core/mock/budget.mock';
import {
  MOCK_BUDGET_CATEGORIES,
  MockBudgetCategory,
  formatDateRange,
  formatVnd,
} from '../../../core/mock/mock-data';

/** Ngưỡng nhắc / cảnh báo (Figma: "Nhắc khi đạt 80% · Cảnh báo khi đạt 100%") */
const REMIND_AT = 80;

/**
 * Màn 13 · Ngân sách
 * Figma: mobile 2:62 · desktop 46:596
 */
@Component({
  selector: 'app-budget',
  imports: [RouterLink],
  templateUrl: './budget.html',
})
export default class Budget {
  private readonly tripId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('tripId'))),
    { initialValue: null },
  );

  protected readonly trip = computed(() => budgetTrip(this.tripId()));
  protected readonly base = computed(() => `/trips/${this.tripId() ?? this.trip().id}`);
  protected readonly dates = computed(() =>
    formatDateRange(this.trip().startDate, this.trip().endDate),
  );

  protected readonly percent = computed(() => {
    const t = this.trip();
    return t.totalBudget > 0 ? Math.round((t.spent / t.totalBudget) * 100) : 0;
  });
  protected readonly remaining = computed(() =>
    Math.max(0, this.trip().totalBudget - this.trip().spent),
  );

  /** Hạng mục (sửa tại chỗ khi bật "Chỉnh sửa") */
  protected readonly categories = signal<MockBudgetCategory[]>(
    MOCK_BUDGET_CATEGORIES.map((c) => ({ ...c })),
  );
  protected readonly editing = signal(false);

  /** Hạng mục đã chạm ngưỡng nhắc, sắp theo % giảm dần */
  private readonly warned = computed(() =>
    this.categories()
      .map((c) => ({ name: c.name, pct: this.categoryPercent(c) }))
      .filter((c) => c.pct >= REMIND_AT),
  );
  protected readonly alertTitle = computed(() => {
    const first = this.warned()[0];
    return first ? `${first.name} đã chạm ${REMIND_AT}%` : null;
  });
  protected readonly alertText = computed(() => {
    const top = [...this.warned()].sort((a, b) => b.pct - a.pct)[0];
    return top ? `${top.name} đã dùng ${top.pct}%. Cân nhắc trước khi thêm khoản chi mới.` : '';
  });

  protected readonly formatVnd = formatVnd;
  protected readonly formatMillion = formatMillion;

  protected categoryPercent(c: MockBudgetCategory): number {
    return c.allocated > 0 ? Math.round((c.spent / c.allocated) * 100) : 100;
  }

  protected toggleEdit(): void {
    this.editing.update((v) => !v);
  }

  /** Nhập theo đơn vị triệu ₫ */
  protected updateAllocated(index: number, value: string): void {
    const millions = Number(value.replace(',', '.'));
    if (!Number.isFinite(millions) || millions < 0) return;
    this.categories.update((list) =>
      list.map((c, i) => (i === index ? { ...c, allocated: Math.round(millions * 1_000_000) } : c)),
    );
  }
}
