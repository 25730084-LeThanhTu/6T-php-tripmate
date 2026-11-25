import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MOCK_EXPENSE_CATEGORIES, findTrip, formatDateRange, formatVnd } from '../../../core/mock/mock-data';
import { ExpenseStore, joinNames, memberFullLabel, splitError } from '../expense-store';

/**
 * Màn 16 · Thêm chi tiêu
 * Figma: mobile 2:77 (Nội dung 2:80) · desktop 46:791 (Nội dung desktop 46:850)
 * Bản nháp được giữ trong ExpenseStore để chuyển qua lại với màn 17 (Cách chia).
 */
@Component({
  selector: 'app-expense-create',
  imports: [RouterLink],
  templateUrl: './expense-create.html',
  host: { class: 'flex flex-col gap-[18px] lg:gap-6' },
})
export default class ExpenseCreate {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly store = inject(ExpenseStore);

  protected readonly tripId = this.route.snapshot.paramMap.get('tripId') ?? '';
  protected readonly draft = this.store.draft;
  private readonly trip = findTrip(this.tripId);
  /** "Đà Lạt cùng hội bạn  ·  16 – 18/11/2026" */
  protected readonly tripLine = this.trip
    ? `${this.trip.title}  ·  ${formatDateRange(this.trip.startDate, this.trip.endDate)}`
    : `Chuyến đi #${this.tripId}`;
  protected readonly categories = MOCK_EXPENSE_CATEGORIES;
  protected readonly payers = this.store
    .tripMemberIds(this.tripId)
    .map((id) => ({ id, label: memberFullLabel(id) }));

  protected readonly splitLink = ['/trips', this.tripId, 'expenses', 'new', 'split'];
  protected readonly vnd = formatVnd;

  /** Hiển thị số tiền có dấu chấm ngăn cách: 600.000 */
  protected readonly amountText = computed(() => {
    const a = this.draft().amount;
    return a ? new Intl.NumberFormat('vi-VN').format(a) : '';
  });

  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);

  protected readonly titleError = computed(() =>
    this.draft().title.trim() ? null : 'Vui lòng nhập tên khoản chi.',
  );
  protected readonly amountError = computed(() =>
    this.draft().amount > 0 ? null : 'Số tiền phải lớn hơn 0.',
  );
  protected readonly splitProblem = computed(() =>
    splitError(this.draft().amount, this.draft().split),
  );

  /** Xem nhanh phần chia (2:952) */
  protected readonly preview = computed(() => {
    const d = this.draft();
    const shares = this.store.draftShares(d);
    const ids = d.split.selected;
    const values = ids.map((id) => shares[id] ?? 0);
    const same = values.length > 0 && values.every((v) => v === values[0]);
    return {
      label: same ? 'Mỗi người trả' : 'Phần chia',
      value: same ? formatVnd(values[0]) : `${ids.length} người`,
      names: same
        ? joinNames(ids)
        : ids.map((id, i) => `${joinNames([id])} ${formatVnd(values[i])}`).join(' · '),
    };
  });

  protected setTitle(value: string): void {
    this.store.updateDraft({ title: value });
  }

  protected setAmount(input: HTMLInputElement): void {
    const digits = input.value.replace(/\D/g, '').slice(0, 12);
    const amount = digits ? Number(digits) : 0;
    this.store.updateDraft({ amount });
    // Định dạng lại ngay trong ô nhập
    input.value = amount ? new Intl.NumberFormat('vi-VN').format(amount) : '';
  }

  protected setCategory(value: string): void {
    this.store.updateDraft({ categoryId: Number(value) });
  }

  protected setDate(value: string): void {
    if (value) this.store.updateDraft({ expenseDate: value });
  }

  protected setPayer(value: string): void {
    this.store.updateDraft({ payerMemberId: value === 'fund' ? null : Number(value) });
  }

  protected setNotes(value: string): void {
    this.store.updateDraft({ notes: value });
  }

  protected pickReceipt(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (file) this.store.setReceipt(file.name, URL.createObjectURL(file));
    input.value = '';
  }

  protected removeReceipt(): void {
    this.store.setReceipt(null, null);
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.titleError() || this.amountError() || this.splitProblem()) return;
    this.saving.set(true);
    // TODO(API): POST /trips/:tripId/expenses
    this.store.saveDraft(this.tripId);
    void this.router.navigate(['/trips', this.tripId, 'expenses']);
  }
}
