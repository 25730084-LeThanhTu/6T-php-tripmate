import { MOCK_EXPENSES, MOCK_MEMBERS } from '../../core/mock/mock-data';
import { computeBalances, suggestTransfers } from './settlement-math';

describe('settlement-math', () => {
  const memberIds = MOCK_MEMBERS.filter((m) => m.tripId === 'da-lat').map((m) => m.id);
  const expenses = MOCK_EXPENSES.filter((e) => e.tripId === 'da-lat');

  it('computes net balances from mock expenses (Figma 19)', () => {
    const balances = computeBalances(memberIds, expenses);
    expect(balances.get(1)).toBe(2_100_000); // Minh
    expect(balances.get(2)).toBe(300_000); // Lan
    expect(balances.get(3)).toBe(-300_000); // Huy
    expect(balances.get(4)).toBe(-2_100_000); // An
  });

  it('balances always sum to zero', () => {
    const balances = computeBalances(
      [1, 2, 3],
      [{ payerMemberId: 1, isFromFund: false, amount: 100, splitMemberIds: [1, 2, 3] }],
    );
    expect([...balances.values()].reduce((a, b) => a + b, 0)).toBe(0);
  });

  it('counts fund contributions and ignores payer of fund expenses', () => {
    const balances = computeBalances(
      [1, 2],
      [{ payerMemberId: null, isFromFund: true, amount: 1_000, splitMemberIds: [1, 2] }],
      [{ memberId: 1, amount: 1_000 }],
    );
    expect(balances.get(1)).toBe(500);
    expect(balances.get(2)).toBe(-500);
  });

  it('suggests the minimal greedy transfers', () => {
    const transfers = suggestTransfers(computeBalances(memberIds, expenses));
    expect(transfers).toEqual([
      { fromMemberId: 4, toMemberId: 1, amount: 2_100_000 },
      { fromMemberId: 3, toMemberId: 2, amount: 300_000 },
    ]);
  });

  it('returns no transfers when everyone is settled', () => {
    expect(
      suggestTransfers(
        new Map([
          [1, 0],
          [2, 0],
        ]),
      ),
    ).toEqual([]);
  });
});
