import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { budgetTrip } from '../../../core/mock/budget.mock';
import { formatDateRange, formatVnd } from '../../../core/mock/mock-data';
import { categoryTotals, dailyTotals, memberAdvances } from '../../../core/mock/stats.mock';

type ReportView = 'category' | 'day' | 'member';

/** Màu biểu đồ theo thứ tự hạng mục – cần đối chiếu lại với Figma */
const SERIES = [
  { stroke: 'stroke-primary', fill: 'bg-primary' },
  { stroke: 'stroke-accent', fill: 'bg-accent' },
  { stroke: 'stroke-muted', fill: 'bg-muted' },
  { stroke: 'stroke-primary-soft', fill: 'bg-primary-soft' },
];

/**
 * Màn 21 · Thống kê
 * Figma: mobile 2:102 · desktop 46:1116
 */
@Component({
  selector: 'app-stats',
  templateUrl: './stats.html',
})
export default class Stats {
  private readonly tripId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('tripId'))),
    { initialValue: null },
  );

  protected readonly trip = computed(() => budgetTrip(this.tripId()));
  protected readonly dates = computed(() =>
    formatDateRange(this.trip().startDate, this.trip().endDate),
  );

  protected readonly categories = computed(() => categoryTotals(this.trip().id));
  protected readonly days = computed(() => dailyTotals(this.trip()));
  protected readonly members = computed(() => memberAdvances(this.trip().id));

  protected readonly actual = computed(() => this.categories().reduce((s, c) => s + c.amount, 0));
  protected readonly planned = computed(() => this.trip().totalBudget);
  protected readonly remaining = computed(() => Math.max(0, this.planned() - this.actual()));
  protected readonly usedPercent = computed(() =>
    this.planned() > 0 ? Math.round((this.actual() / this.planned()) * 100) : 0,
  );
  protected readonly perMember = computed(() =>
    this.trip().memberCount > 0 ? Math.round(this.actual() / this.trip().memberCount) : 0,
  );

  /** Các lát của biểu đồ vòng (chu vi = 100 nên % = độ dài nét) */
  protected readonly slices = computed(() => {
    const total = this.actual();
    let offset = 0;
    return this.categories().map((c, i) => {
      const pct = total > 0 ? (c.amount / total) * 100 : 0;
      const slice = {
        ...c,
        pct,
        dash: `${pct} ${100 - pct}`,
        // bắt đầu ở 12 giờ
        offset: 25 - offset,
        color: SERIES[i % SERIES.length],
      };
      offset += pct;
      return slice;
    });
  });
  protected readonly donutSummary = computed(() =>
    this.slices()
      .map((s) => `${s.label} ${Math.round(s.pct)}% (${formatVnd(s.amount)})`)
      .join(', '),
  );

  protected readonly maxDay = computed(() => Math.max(0, ...this.days().map((d) => d.amount)));

  protected readonly reportViews: { key: ReportView; label: string }[] = [
    { key: 'category', label: 'Hạng mục' },
    { key: 'day', label: 'Theo ngày' },
    { key: 'member', label: 'Thành viên' },
  ];
  protected readonly view = signal<ReportView>('category');
  protected readonly exported = signal(false);

  protected readonly formatVnd = formatVnd;

  protected formatNumber(amount: number): string {
    return new Intl.NumberFormat('vi-VN').format(amount);
  }

  protected dayPercent(amount: number): number {
    return this.maxDay() > 0 ? (amount / this.maxDay()) * 100 : 0;
  }

  /** Chọn kiểu báo cáo và cuộn tới biểu đồ tương ứng */
  protected selectView(key: ReportView, target: HTMLElement): void {
    this.view.set(key);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected exportReport(): void {
    this.exported.set(true);
  }
}
