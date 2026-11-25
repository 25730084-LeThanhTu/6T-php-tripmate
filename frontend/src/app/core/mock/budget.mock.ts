/**
 * DỮ LIỆU GIẢ cho nhóm màn Ngân sách (13) và Quỹ chung (14).
 * Giá trị lấy theo Figma (2:67 / 46:661).
 */
import { MOCK_TRIPS, MockTrip, findTrip } from './mock-data';

export type FundContributionStatus = 'UNPAID' | 'PAID';

export interface MockFundPlan {
  tripId: string;
  /** Mục tiêu đóng góp của cả nhóm */
  target: number;
  /** Mỗi thành viên cần đóng */
  perMember: number;
  /** Thành viên giữ quỹ */
  holderMemberId: number;
}

export interface MockFundContribution {
  memberId: number;
  /** Số tiền đã được xác nhận */
  confirmed: number;
  status: FundContributionStatus;
}

export const MOCK_FUND_PLANS: readonly MockFundPlan[] = [
  { tripId: 'da-lat', target: 4_000_000, perMember: 1_000_000, holderMemberId: 1 },
];

/** Chưa ai đóng quỹ (Figma: "0 / 4 đã đóng", số dư 0 ₫) */
export const MOCK_FUND_CONTRIBUTIONS: readonly MockFundContribution[] = [
  { memberId: 1, confirmed: 0, status: 'UNPAID' },
  { memberId: 2, confirmed: 0, status: 'UNPAID' },
  { memberId: 3, confirmed: 0, status: 'UNPAID' },
  { memberId: 4, confirmed: 0, status: 'UNPAID' },
];

export const FUND_STATUS_LABEL: Record<FundContributionStatus, string> = {
  UNPAID: 'Chưa đóng',
  PAID: 'Đã đóng',
};

/** Chuyến theo id trên URL, mặc định là chuyến Đà Lạt */
export function budgetTrip(id: string | null | undefined): MockTrip {
  return findTrip(id) ?? MOCK_TRIPS[0];
}

/** 3600000 -> "3,6" (đơn vị triệu, tối đa 1 chữ số thập phân) */
export function formatMillion(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(amount / 1_000_000);
}
