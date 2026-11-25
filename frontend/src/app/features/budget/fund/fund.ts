import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import {
  FUND_STATUS_LABEL,
  MOCK_FUND_CONTRIBUTIONS,
  MOCK_FUND_PLANS,
  MockFundContribution,
  budgetTrip,
} from '../../../core/mock/budget.mock';
import {
  MOCK_CURRENT_USER,
  formatDateRange,
  formatVnd,
  memberUser,
} from '../../../core/mock/mock-data';

/**
 * Màn 14 · Quỹ chung
 * Figma: mobile 2:67 · desktop 46:661
 */
@Component({
  selector: 'app-fund',
  imports: [ReactiveFormsModule],
  templateUrl: './fund.html',
})
export default class Fund {
  private readonly tripId = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((p) => p.get('tripId'))),
    { initialValue: null },
  );

  protected readonly trip = computed(() => budgetTrip(this.tripId()));
  protected readonly dates = computed(() =>
    formatDateRange(this.trip().startDate, this.trip().endDate),
  );
  protected readonly plan = computed(
    () => MOCK_FUND_PLANS.find((p) => p.tripId === this.trip().id) ?? MOCK_FUND_PLANS[0],
  );
  protected readonly holderName = computed(
    () => memberUser(this.plan().holderMemberId)?.fullName ?? '',
  );

  /** Đóng góp (trạng thái cục bộ, cập nhật khi ghi nhận) */
  protected readonly contributions = signal<MockFundContribution[]>(
    MOCK_FUND_CONTRIBUTIONS.map((c) => ({ ...c })),
  );
  protected readonly rows = computed(() =>
    this.contributions().map((c) => ({ ...c, name: this.displayName(c.memberId) })),
  );
  protected readonly balance = computed(() =>
    this.contributions().reduce((sum, c) => sum + c.confirmed, 0),
  );
  protected readonly paidCount = computed(
    () => this.contributions().filter((c) => c.status === 'PAID').length,
  );
  protected readonly unpaid = computed(() => this.rows().filter((r) => r.status === 'UNPAID'));

  protected readonly formOpen = signal(false);
  protected readonly successMessage = signal<string | null>(null);
  protected readonly form = new FormGroup({
    memberId: new FormControl<number | null>(null, Validators.required),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  protected readonly formatVnd = formatVnd;
  protected readonly statusLabel = FUND_STATUS_LABEL;

  /** "Minh · Bạn" với người đang đăng nhập */
  private displayName(memberId: number): string {
    const user = memberUser(memberId);
    if (!user) return `Thành viên #${memberId}`;
    return user.id === MOCK_CURRENT_USER.id ? `${user.shortName} · Bạn` : user.shortName;
  }

  protected openForm(): void {
    this.successMessage.set(null);
    this.form.reset({
      memberId: this.unpaid()[0]?.memberId ?? null,
      amount: this.plan().perMember,
    });
    this.formOpen.set(true);
  }

  protected cancel(): void {
    this.formOpen.set(false);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const memberId = Number(this.form.value.memberId);
    const amount = Number(this.form.value.amount);
    this.contributions.update((list) =>
      list.map((c): MockFundContribution =>
        c.memberId === memberId ? { ...c, confirmed: c.confirmed + amount, status: 'PAID' } : c,
      ),
    );
    this.formOpen.set(false);
    this.successMessage.set(`Đã ghi nhận ${formatVnd(amount)} từ ${this.displayName(memberId)}.`);
  }
}
