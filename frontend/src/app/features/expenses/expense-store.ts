import { Injectable, computed, signal } from '@angular/core';

import {
  MOCK_EXPENSES,
  MOCK_EXPENSE_CATEGORIES,
  MOCK_MEMBERS,
  MockExpense,
  SplitType,
  formatVnd,
  memberUser,
} from '../../core/mock/mock-data';
import { EXPENSE_MOCK_TODAY, expenseReceipt } from '../../core/mock/expenses.mock';

/** Khoản chi trong bộ nhớ tạm (dữ liệu giả + các khoản thêm trong phiên) */
export interface StoredExpense extends MockExpense {
  /** Phần của từng thành viên (memberId -> số tiền). Không có = chia đều */
  shares?: Record<number, number>;
  receiptName?: string;
}

/** Cấu hình cách chia đang soạn (màn 17) */
export interface SplitDraft {
  mode: SplitType;
  selected: number[];
  /** Giá trị nhập theo chế độ: số tiền / phần trăm / số phần */
  exact: Record<number, number>;
  percent: Record<number, number>;
  shares: Record<number, number>;
}

/** Bản nháp khoản chi (màn 16) — giữ lại khi chuyển sang màn 17 */
export interface ExpenseDraft {
  editingId: number | null;
  title: string;
  amount: number;
  categoryId: number;
  /** null = từ quỹ chung */
  payerMemberId: number | null;
  expenseDate: string;
  notes: string;
  receiptName: string | null;
  receiptUrl: string | null;
  split: SplitDraft;
}

export const SPLIT_MODE_LABEL: Record<SplitType, string> = {
  EQUAL: 'Chia đều',
  EXACT: 'Số tiền',
  PERCENT: 'Phần trăm',
  SHARES: 'Số phần',
};

/** "Đều · 4 người" (cột CÁCH CHIA desktop, Figma 46:2100) */
export const SPLIT_SHORT_LABEL: Record<SplitType, string> = {
  EQUAL: 'Đều',
  EXACT: 'Số tiền',
  PERCENT: 'Phần trăm',
  SHARES: 'Số phần',
};

/** "Chia đều" / "Chia theo số tiền"... */
export const SPLIT_LONG_LABEL: Record<SplitType, string> = {
  EQUAL: 'Chia đều',
  EXACT: 'Chia theo số tiền',
  PERCENT: 'Chia theo phần trăm',
  SHARES: 'Chia theo số phần',
};

export const CURRENT_MEMBER_ID = 1;

/** Tên ngắn của thành viên; người đang đăng nhập có hậu tố "· Bạn" */
export function memberLabel(memberId: number | null, withYou = true): string {
  if (memberId === null) return 'Quỹ chung';
  const name = memberUser(memberId)?.shortName ?? `#${memberId}`;
  return withYou && memberId === CURRENT_MEMBER_ID ? `${name} · Bạn` : name;
}

export function memberFullLabel(memberId: number): string {
  const name = memberUser(memberId)?.fullName ?? `#${memberId}`;
  return memberId === CURRENT_MEMBER_ID ? `${name} · Bạn` : name;
}

export function categoryName(categoryId: number): string {
  return MOCK_EXPENSE_CATEGORIES.find((c) => c.id === categoryId)?.name ?? 'Khác';
}

/** "Minh, Lan, Huy và An" */
export function joinNames(memberIds: readonly number[]): string {
  const names = memberIds.map((id) => memberLabel(id, false));
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} và ${names[names.length - 1]}`;
}

/** Chia đều số tiền nguyên; phần lẻ cộng dần cho những người đầu */
export function splitEqually(amount: number, memberIds: readonly number[]): Record<number, number> {
  const result: Record<number, number> = {};
  if (!memberIds.length) return result;
  const base = Math.floor(amount / memberIds.length);
  let rest = amount - base * memberIds.length;
  for (const id of memberIds) {
    result[id] = base + (rest > 0 ? 1 : 0);
    if (rest > 0) rest--;
  }
  return result;
}

/** Chia theo trọng số (phần trăm / số phần), làm tròn để tổng khớp số tiền */
export function splitByWeight(
  amount: number,
  memberIds: readonly number[],
  weights: Record<number, number>,
): Record<number, number> {
  const result: Record<number, number> = {};
  const total = memberIds.reduce((s, id) => s + (weights[id] ?? 0), 0);
  if (!memberIds.length || total <= 0) {
    for (const id of memberIds) result[id] = 0;
    return result;
  }
  let assigned = 0;
  memberIds.forEach((id, index) => {
    const value =
      index === memberIds.length - 1
        ? amount - assigned
        : Math.round((amount * (weights[id] ?? 0)) / total);
    result[id] = value;
    assigned += value;
  });
  return result;
}

/** Phần của từng người theo cấu hình chia */
export function computeShares(amount: number, split: SplitDraft): Record<number, number> {
  switch (split.mode) {
    case 'EQUAL':
      return splitEqually(amount, split.selected);
    case 'EXACT':
      return Object.fromEntries(split.selected.map((id) => [id, split.exact[id] ?? 0]));
    case 'PERCENT':
      return splitByWeight(amount, split.selected, split.percent);
    case 'SHARES':
      return splitByWeight(amount, split.selected, split.shares);
  }
}

/** Kiểm tra tổng phần chia khớp số tiền. Trả về thông báo lỗi hoặc null */
export function splitError(amount: number, split: SplitDraft): string | null {
  if (!split.selected.length) return 'Chọn ít nhất một thành viên để chia.';
  const sum = (values: Record<number, number>) =>
    split.selected.reduce((s, id) => s + (values[id] ?? 0), 0);
  switch (split.mode) {
    case 'EQUAL':
      return null;
    case 'EXACT': {
      const diff = amount - sum(split.exact);
      if (diff === 0) return null;
      return diff > 0
        ? `Còn thiếu ${formatVnd(diff)} so với số tiền khoản chi.`
        : `Vượt ${formatVnd(-diff)} so với số tiền khoản chi.`;
    }
    case 'PERCENT': {
      const total = Math.round(sum(split.percent) * 100) / 100;
      return total === 100 ? null : `Tổng phần trăm đang là ${total}%, cần đúng 100%.`;
    }
    case 'SHARES':
      return sum(split.shares) > 0 ? null : 'Tổng số phần phải lớn hơn 0.';
  }
}

/** "17/11 · Hôm nay", "16/11 · Hôm qua", "15/11" */
export function dayLabel(date: string): string {
  const [, m, d] = date.split('-');
  const short = `${d}/${m}`;
  const diff = Math.round(
    (Date.parse(EXPENSE_MOCK_TODAY) - Date.parse(date)) / (24 * 60 * 60 * 1000),
  );
  if (diff === 0) return `${short} · Hôm nay`;
  if (diff === 1) return `${short} · Hôm qua`;
  return short;
}

export { formatVnd };

/**
 * Kho chi tiêu dùng chung cho màn 15 – 18 (dữ liệu giả, chỉ sống trong phiên).
 * TODO(API): thay bằng service gọi /trips/:tripId/expenses.
 */
@Injectable({ providedIn: 'root' })
export class ExpenseStore {
  private readonly items = signal<StoredExpense[]>(
    MOCK_EXPENSES.map((e) => ({ ...e, receiptName: expenseReceipt(e.id)?.fileName })),
  );

  readonly all = this.items.asReadonly();

  private readonly draftState = signal<ExpenseDraft>(this.emptyDraft());
  readonly draft = this.draftState.asReadonly();

  forTrip(tripId: string): StoredExpense[] {
    return this.items()
      .filter((e) => e.tripId === tripId)
      .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate) || a.id - b.id);
  }

  find(tripId: string, id: number): StoredExpense | undefined {
    return this.items().find((e) => e.tripId === tripId && e.id === id);
  }

  remove(id: number): void {
    this.items.update((list) => list.filter((e) => e.id !== id));
  }

  /** Phần của từng người trong một khoản chi */
  sharesOf(expense: StoredExpense): Record<number, number> {
    return expense.shares ?? splitEqually(expense.amount, expense.splitMemberIds);
  }

  // ------------------------------------------------------------ Bản nháp

  tripMemberIds(tripId: string): number[] {
    const ids = MOCK_MEMBERS.filter((m) => m.tripId === tripId).map((m) => m.id);
    return ids.length ? ids : MOCK_MEMBERS.map((m) => m.id);
  }

  updateDraft(patch: Partial<ExpenseDraft>): void {
    this.draftState.update((d) => ({ ...d, ...patch }));
  }

  setSplit(split: SplitDraft): void {
    this.draftState.update((d) => ({ ...d, split }));
  }

  setReceipt(name: string | null, url: string | null): void {
    const old = this.draftState().receiptUrl;
    if (old && old !== url) URL.revokeObjectURL(old);
    this.updateDraft({ receiptName: name, receiptUrl: url });
  }

  /** Bắt đầu sửa một khoản chi có sẵn */
  startEdit(expense: StoredExpense): void {
    const shares = this.sharesOf(expense);
    this.resetDraft();
    this.draftState.set({
      ...this.emptyDraft(),
      editingId: expense.id,
      title: expense.title,
      amount: expense.amount,
      categoryId: expense.categoryId,
      payerMemberId: expense.isFromFund ? null : expense.payerMemberId,
      expenseDate: expense.expenseDate,
      notes: expense.notes ?? '',
      receiptName: expense.receiptName ?? null,
      split: {
        mode: expense.splitType,
        selected: [...expense.splitMemberIds],
        exact: { ...shares },
        percent: {},
        shares: {},
      },
    });
  }

  /** Tính phần chia của bản nháp hiện tại */
  draftShares(draft: ExpenseDraft = this.draftState()): Record<number, number> {
    return computeShares(draft.amount, draft.split);
  }

  /** Lưu bản nháp thành khoản chi (giả) — trả về id */
  saveDraft(tripId: string): number {
    const d = this.draftState();
    const shares = this.draftShares(d);
    const id = d.editingId ?? Math.max(0, ...this.items().map((e) => e.id)) + 1;
    const expense: StoredExpense = {
      id,
      tripId,
      title: d.title.trim(),
      categoryId: d.categoryId,
      payerMemberId: d.payerMemberId,
      isFromFund: d.payerMemberId === null,
      amount: d.amount,
      expenseDate: d.expenseDate,
      splitType: d.split.mode,
      splitMemberIds: [...d.split.selected],
      notes: d.notes.trim() || undefined,
      shares: d.split.mode === 'EQUAL' ? undefined : shares,
      receiptName: d.receiptName ?? undefined,
    };
    this.items.update((list) =>
      d.editingId ? list.map((e) => (e.id === id ? expense : e)) : [...list, expense],
    );
    this.resetDraft();
    return id;
  }

  resetDraft(): void {
    const old = this.draftState().receiptUrl;
    if (old) URL.revokeObjectURL(old);
    this.draftState.set(this.emptyDraft());
  }

  /** Tóm tắt "4 thành viên · Chia đều" */
  readonly draftSplitSummary = computed(() => {
    const s = this.draftState().split;
    return `${s.selected.length} thành viên · ${SPLIT_LONG_LABEL[s.mode]}`;
  });

  private emptyDraft(): ExpenseDraft {
    // Giá trị mặc định theo Figma 16 (2:80): "Cà phê ngắm hoàng hôn", 600.000 ₫, Ăn uống, 17/11/2026, Minh
    const members = MOCK_MEMBERS.filter((m) => m.tripId === 'da-lat').map((m) => m.id);
    return {
      editingId: null,
      title: 'Cà phê ngắm hoàng hôn',
      amount: 600_000,
      categoryId: 1,
      payerMemberId: CURRENT_MEMBER_ID,
      expenseDate: EXPENSE_MOCK_TODAY,
      notes: '',
      receiptName: null,
      receiptUrl: null,
      split: { mode: 'EQUAL', selected: members, exact: {}, percent: {}, shares: {} },
    };
  }
}
