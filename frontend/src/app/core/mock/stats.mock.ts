/**
 * Số liệu thống kê (màn 21) – tính từ MOCK_EXPENSES để khớp Figma 2:102 / 46:1116:
 * Lưu trú 3,6tr · Ăn uống 2,4tr · Di chuyển 1,8tr · Khác 0,6tr;
 * 16/11 5.400.000 · 17/11 3.000.000 · 18/11 0;
 * Minh 4,2tr · Lan 2,4tr · Huy 1,8tr · An 0.
 */
import {
  MOCK_EXPENSES,
  MOCK_EXPENSE_CATEGORIES,
  MOCK_MEMBERS,
  MockTrip,
  memberUser,
} from './mock-data';

export interface StatItem {
  label: string;
  amount: number;
}

function tripExpenses(tripId: string) {
  return MOCK_EXPENSES.filter((e) => e.tripId === tripId);
}

/** Tổng chi theo hạng mục, giảm dần */
export function categoryTotals(tripId: string): StatItem[] {
  const totals = new Map<string, number>();
  for (const e of tripExpenses(tripId)) {
    const name = MOCK_EXPENSE_CATEGORIES.find((c) => c.id === e.categoryId)?.name ?? 'Khác';
    totals.set(name, (totals.get(name) ?? 0) + e.amount);
  }
  return [...totals]
    .map(([label, amount]) => ({ label, amount }))
    .sort((a, b) => b.amount - a.amount);
}

/** Tổng chi từng ngày của chuyến (nhãn "16/11") */
export function dailyTotals(trip: MockTrip): StatItem[] {
  const items: StatItem[] = [];
  const expenses = tripExpenses(trip.id);
  const day = new Date(`${trip.startDate}T00:00:00`);
  const end = new Date(`${trip.endDate}T00:00:00`);
  while (day <= end) {
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, '0');
    const d = String(day.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;
    items.push({
      label: `${d}/${m}`,
      amount: expenses.filter((e) => e.expenseDate === iso).reduce((s, e) => s + e.amount, 0),
    });
    day.setDate(day.getDate() + 1);
  }
  return items;
}

/** Số tiền mỗi thành viên đã ứng trước (không tính khoản chi từ quỹ) */
export function memberAdvances(tripId: string): StatItem[] {
  const expenses = tripExpenses(tripId);
  return MOCK_MEMBERS.filter((m) => m.tripId === tripId).map((m) => ({
    label: memberUser(m.id)?.shortName ?? `Thành viên #${m.id}`,
    amount: expenses
      .filter((e) => !e.isFromFund && e.payerMemberId === m.id)
      .reduce((s, e) => s + e.amount, 0),
  }));
}
