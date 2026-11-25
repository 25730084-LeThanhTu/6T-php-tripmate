/**
 * Hàm thuần tính số dư và gợi ý chuyển tiền (màn 19 · Chia tiền).
 *
 * Số dư ròng của một thành viên:
 *   B = tiền đã trả hộ + tiền đã góp quỹ − phần phải chịu (split owed)
 * B > 0: được nhận lại · B < 0: cần trả.
 *
 * Gợi ý chuyển tiền dùng thuật toán tham lam "min cash flow":
 * luôn ghép người nợ nhiều nhất với người được nhận nhiều nhất.
 */

export interface ExpenseLike {
  payerMemberId: number | null;
  isFromFund: boolean;
  amount: number;
  splitMemberIds: readonly number[];
}

export interface FundContribution {
  memberId: number;
  amount: number;
}

export interface Transfer {
  fromMemberId: number;
  toMemberId: number;
  amount: number;
}

/** Chia đều số tiền (đồng) cho n người; phần dư lẻ dồn cho những người đầu danh sách. */
function equalShares(amount: number, memberIds: readonly number[]): Map<number, number> {
  const shares = new Map<number, number>();
  const n = memberIds.length;
  if (n === 0) return shares;
  const base = Math.floor(amount / n);
  let remainder = amount - base * n;
  for (const id of memberIds) {
    shares.set(id, base + (remainder > 0 ? 1 : 0));
    if (remainder > 0) remainder--;
  }
  return shares;
}

/**
 * Tính số dư ròng của từng thành viên.
 * Khoản chi từ quỹ chung (isFromFund) không cộng cho người trả nào — phần góp quỹ
 * được tính qua `contributions`.
 */
export function computeBalances(
  memberIds: readonly number[],
  expenses: readonly ExpenseLike[],
  contributions: readonly FundContribution[] = [],
): Map<number, number> {
  const balances = new Map<number, number>(memberIds.map((id) => [id, 0]));
  const add = (id: number, delta: number) => balances.set(id, (balances.get(id) ?? 0) + delta);

  for (const c of contributions) add(c.memberId, c.amount);

  for (const e of expenses) {
    if (!e.isFromFund && e.payerMemberId !== null) add(e.payerMemberId, e.amount);
    for (const [id, share] of equalShares(e.amount, e.splitMemberIds)) add(id, -share);
  }
  return balances;
}

/** Gợi ý chuyển tiền tối thiểu số lượt (tham lam: nợ lớn nhất ↔ nhận lớn nhất). */
export function suggestTransfers(balances: ReadonlyMap<number, number>): Transfer[] {
  const creditors = [...balances].filter(([, b]) => b > 0).map(([id, b]) => ({ id, b }));
  const debtors = [...balances].filter(([, b]) => b < 0).map(([id, b]) => ({ id, b: -b }));
  const transfers: Transfer[] = [];

  while (creditors.length && debtors.length) {
    creditors.sort((a, b) => b.b - a.b);
    debtors.sort((a, b) => b.b - a.b);
    const c = creditors[0];
    const d = debtors[0];
    const amount = Math.min(c.b, d.b);
    transfers.push({ fromMemberId: d.id, toMemberId: c.id, amount });
    c.b -= amount;
    d.b -= amount;
    if (c.b === 0) creditors.shift();
    if (d.b === 0) debtors.shift();
  }
  return transfers;
}
