/**
 * DỮ LIỆU GIẢ riêng cho nhóm màn "Chuyến đi" (04 – 07).
 * Dữ liệu dùng chung (chuyến đi, thành viên, chia tiền...) nằm ở mock-data.ts.
 */
import {
  MOCK_CURRENT_USER,
  MOCK_MEMBERS,
  MOCK_SETTLEMENTS,
  MockTrip,
  TripStatus,
  findTrip,
  memberUser,
} from './mock-data';

/** Chuyến mặc định khi không tìm thấy :tripId */
export const DEFAULT_TRIP_ID = 'da-lat';

/** Bộ lọc trên màn "Chuyến đi của tôi" (Figma 67:2168 · Filter · trip) */
export type TripFilter = 'ALL' | 'ONGOING' | 'UPCOMING';

export interface TripFilterOption {
  key: TripFilter;
  label: string;
  statuses: readonly TripStatus[] | null;
}

export const TRIP_FILTERS: readonly TripFilterOption[] = [
  { key: 'ALL', label: 'Tất cả', statuses: null },
  { key: 'ONGOING', label: 'Đang đi', statuses: ['ONGOING'] },
  { key: 'UPCOMING', label: 'Sắp tới', statuses: ['PLANNING'] },
];

/** Hoạt động sắp tới hiển thị ở màn Tổng quan (Figma 2:395) */
export interface MockNextActivity {
  dayLabel: string;
  timeLabel: string;
  title: string;
  place: string;
  estimatedCost: number;
}

export const MOCK_NEXT_ACTIVITY: Readonly<Partial<Record<string, MockNextActivity>>> = {
  'da-lat': {
    dayLabel: 'Hôm nay · Ngày 2',
    timeLabel: 'SẮP TỚI · 15:00',
    title: 'Cà phê ngắm hoàng hôn',
    place: 'Túi Mơ To',
    estimatedCost: 600_000,
  },
};

/** Mô tả mặc định trong form tạo / cài đặt chuyến đi (Figma 67:1093) */
export const MOCK_TRIP_NOTE = '3 ngày trốn phố, săn mây và uống cà phê.';

export function tripOrDefault(id: string | null | undefined): MockTrip {
  return findTrip(id) ?? findTrip(DEFAULT_TRIP_ID)!;
}

/** "2026-11-16","2026-11-18" -> "3 ngày 2 đêm" */
export function tripDurationLabel(start: string, end: string): string {
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1;
  return days <= 1 ? '1 ngày' : `${days} ngày ${days - 1} đêm`;
}

/** Phần trăm ngân sách đã dùng (0 – 100) */
export function budgetPercent(trip: MockTrip): number {
  if (!trip.totalBudget) return 0;
  return Math.min(100, Math.round((trip.spent / trip.totalBudget) * 100));
}

/** Thành viên của một chuyến kèm thông tin người dùng */
export function tripMembers(tripId: string) {
  return MOCK_MEMBERS.filter((m) => m.tripId === tripId).map((m) => ({
    ...m,
    user: memberUser(m.id),
  }));
}

/**
 * Lời nhắc "Còn một khoản đang chờ bạn": khoản chia tiền đã được báo chuyển
 * tới người dùng hiện tại nhưng chưa xác nhận.
 */
export function pendingSettlementForCurrentUser() {
  const myMemberIds = MOCK_MEMBERS.filter((m) => m.userId === MOCK_CURRENT_USER.id).map(
    (m) => m.id,
  );
  const settlement = MOCK_SETTLEMENTS.find(
    (s) => s.status === 'SENT' && myMemberIds.includes(s.toMemberId),
  );
  if (!settlement) return undefined;
  return { settlement, from: memberUser(settlement.fromMemberId) };
}
