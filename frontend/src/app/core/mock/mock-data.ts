/**
 * DỮ LIỆU GIẢ dùng tạm khi chưa có API.
 * Nội dung lấy theo thiết kế Figma (chuyến "Đà Lạt cùng hội bạn").
 * Khi có API: thay các hằng số này bằng service gọi HttpClient.
 *
 * Mỗi nhóm màn có thể bổ sung dữ liệu riêng trong core/mock/<nhom>.mock.ts
 */

export type TripStatus = 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
export type MemberRole = 'LEADER' | 'CO_LEADER' | 'MEMBER';
export type SplitType = 'EQUAL' | 'EXACT' | 'PERCENT' | 'SHARES';
export type SettlementStatus = 'PENDING' | 'SENT' | 'CONFIRMED';

export interface MockUser {
  id: string;
  fullName: string;
  /** Tên ngắn dùng trong danh sách: "Minh", "Lan"... */
  shortName: string;
  username: string;
  email: string;
  phone?: string;
}

export interface MockTrip {
  id: string;
  title: string;
  description?: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: TripStatus;
  coverImage?: string;
  memberCount: number;
  totalBudget: number;
  spent: number;
  myRole: MemberRole;
}

export interface MockMember {
  id: number;
  tripId: string;
  userId: string;
  role: MemberRole;
}

export interface MockExpenseCategory {
  id: number;
  name: string;
  icon: string;
}

export interface MockExpense {
  id: number;
  tripId: string;
  title: string;
  categoryId: number;
  payerMemberId: number | null;
  isFromFund: boolean;
  amount: number;
  expenseDate: string; // YYYY-MM-DD
  splitType: SplitType;
  splitMemberIds: number[];
  notes?: string;
}

export interface MockBudgetCategory {
  name: string;
  allocated: number;
  spent: number;
}

export interface MockSettlement {
  id: number;
  tripId: string;
  fromMemberId: number;
  toMemberId: number;
  amount: number;
  status: SettlementStatus;
  sentAt?: string; // ISO
}

// ---------------------------------------------------------------- Người dùng

export const MOCK_USERS: readonly MockUser[] = [
  {
    id: 'u-minh',
    fullName: 'Nguyễn Minh',
    shortName: 'Minh',
    username: 'nguyenminh',
    email: 'minh.nguyen@gmail.com',
    phone: '0901 234 567',
  },
  {
    id: 'u-lan',
    fullName: 'Trần Lan',
    shortName: 'Lan',
    username: 'tranlan',
    email: 'lan.tran@gmail.com',
  },
  {
    id: 'u-huy',
    fullName: 'Lê Huy',
    shortName: 'Huy',
    username: 'lehuy',
    email: 'huy.le@gmail.com',
  },
  {
    id: 'u-an',
    fullName: 'Phạm An',
    shortName: 'An',
    username: 'phaman',
    email: 'an.pham@gmail.com',
  },
];

/** Người dùng đang đăng nhập */
export const MOCK_CURRENT_USER: MockUser = MOCK_USERS[0];

// ---------------------------------------------------------------- Chuyến đi

export const MOCK_TRIPS: readonly MockTrip[] = [
  {
    id: 'da-lat',
    title: 'Đà Lạt cùng hội bạn',
    description: 'Đi trốn cùng hội bạn',
    location: 'Đà Lạt, Lâm Đồng',
    startDate: '2026-11-16',
    endDate: '2026-11-18',
    status: 'ONGOING',
    coverImage: 'images/trips/da-lat.jpg',
    memberCount: 4,
    totalBudget: 12_000_000,
    spent: 8_400_000,
    myRole: 'LEADER',
  },
  {
    id: 'vung-tau',
    title: 'Một cuối tuần ở Vũng Tàu',
    location: 'Vũng Tàu, Bà Rịa – Vũng Tàu',
    startDate: '2026-12-12',
    endDate: '2026-12-13',
    status: 'PLANNING',
    memberCount: 3,
    totalBudget: 5_000_000,
    spent: 0,
    myRole: 'MEMBER',
  },
  {
    id: 'can-gio',
    title: 'Một ngày ở Cần Giờ',
    location: 'Cần Giờ, TP. Hồ Chí Minh',
    startDate: '2026-10-25',
    endDate: '2026-10-25',
    status: 'COMPLETED',
    memberCount: 5,
    totalBudget: 2_500_000,
    spent: 2_300_000,
    myRole: 'CO_LEADER',
  },
];

// ---------------------------------------------------------------- Thành viên (chuyến Đà Lạt)

export const MOCK_MEMBERS: readonly MockMember[] = [
  { id: 1, tripId: 'da-lat', userId: 'u-minh', role: 'LEADER' },
  { id: 2, tripId: 'da-lat', userId: 'u-lan', role: 'CO_LEADER' },
  { id: 3, tripId: 'da-lat', userId: 'u-huy', role: 'MEMBER' },
  { id: 4, tripId: 'da-lat', userId: 'u-an', role: 'MEMBER' },
];

// ---------------------------------------------------------------- Chi tiêu

export const MOCK_EXPENSE_CATEGORIES: readonly MockExpenseCategory[] = [
  { id: 1, name: 'Ăn uống', icon: 'restaurant' },
  { id: 2, name: 'Lưu trú', icon: 'hotel' },
  { id: 3, name: 'Di chuyển', icon: 'directions_car' },
  { id: 4, name: 'Vé tham quan', icon: 'confirmation_number' },
  { id: 5, name: 'Mua sắm cá nhân', icon: 'shopping_bag' },
  { id: 6, name: 'Khác', icon: 'receipt_long' },
];

export const MOCK_EXPENSES: readonly MockExpense[] = [
  {
    id: 1,
    tripId: 'da-lat',
    title: 'Ăn uống · 2 ngày',
    categoryId: 1,
    payerMemberId: 2,
    isFromFund: false,
    amount: 2_400_000,
    expenseDate: '2026-11-17',
    splitType: 'EQUAL',
    splitMemberIds: [1, 2, 3, 4],
  },
  {
    id: 2,
    tripId: 'da-lat',
    title: 'Vé tham quan & gửi xe',
    categoryId: 6,
    payerMemberId: 1,
    isFromFund: false,
    amount: 600_000,
    expenseDate: '2026-11-17',
    splitType: 'EQUAL',
    splitMemberIds: [1, 2, 3, 4],
  },
  {
    id: 3,
    tripId: 'da-lat',
    title: 'Homestay 2 đêm',
    categoryId: 2,
    payerMemberId: 1,
    isFromFund: false,
    amount: 3_600_000,
    expenseDate: '2026-11-16',
    splitType: 'EQUAL',
    splitMemberIds: [1, 2, 3, 4],
  },
  {
    id: 4,
    tripId: 'da-lat',
    title: 'Xe đi Đà Lạt',
    categoryId: 3,
    payerMemberId: 3,
    isFromFund: false,
    amount: 1_800_000,
    expenseDate: '2026-11-16',
    splitType: 'EQUAL',
    splitMemberIds: [1, 2, 3, 4],
  },
];

// ---------------------------------------------------------------- Ngân sách (chuyến Đà Lạt)

export const MOCK_BUDGET_CATEGORIES: readonly MockBudgetCategory[] = [
  { name: 'Lưu trú', allocated: 5_000_000, spent: 3_600_000 },
  { name: 'Ăn uống', allocated: 3_000_000, spent: 2_400_000 },
  { name: 'Di chuyển', allocated: 2_000_000, spent: 1_800_000 },
  { name: 'Khác', allocated: 2_000_000, spent: 600_000 },
];

// ---------------------------------------------------------------- Chia tiền

export const MOCK_SETTLEMENTS: readonly MockSettlement[] = [
  {
    id: 1,
    tripId: 'da-lat',
    fromMemberId: 4,
    toMemberId: 1,
    amount: 2_100_000,
    status: 'SENT',
    sentAt: '2026-11-17T14:35:00+07:00',
  },
  { id: 2, tripId: 'da-lat', fromMemberId: 3, toMemberId: 2, amount: 300_000, status: 'PENDING' },
];

// ---------------------------------------------------------------- Tiện ích

export function findTrip(id: string | null | undefined): MockTrip | undefined {
  return MOCK_TRIPS.find((t) => t.id === id);
}

export function findUser(id: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

/** Thông tin người dùng của một thành viên chuyến đi */
export function memberUser(memberId: number): MockUser | undefined {
  const member = MOCK_MEMBERS.find((m) => m.id === memberId);
  return member ? findUser(member.userId) : undefined;
}

export const ROLE_LABEL: Record<MemberRole, string> = {
  LEADER: 'Trưởng nhóm',
  CO_LEADER: 'Phó nhóm',
  MEMBER: 'Thành viên',
};

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  PLANNING: 'Sắp tới',
  ONGOING: 'Đang diễn ra',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

/** 8400000 -> "8.400.000 ₫" */
export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(amount)} ₫`;
}

/** "2026-11-16","2026-11-18" -> "16 – 18/11/2026" */
export function formatDateRange(start: string, end: string): string {
  const [sy, sm, sd] = start.split('-');
  const [ey, em, ed] = end.split('-');
  if (start === end) return `${sd}/${sm}/${sy}`;
  if (sy === ey && sm === em) return `${sd} – ${ed}/${em}/${ey}`;
  if (sy === ey) return `${sd}/${sm} – ${ed}/${em}/${ey}`;
  return `${sd}/${sm}/${sy} – ${ed}/${em}/${ey}`;
}

/** "2026-11-17" -> "17/11/2026" */
export function formatDate(date: string): string {
  const [y, m, d] = date.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}
