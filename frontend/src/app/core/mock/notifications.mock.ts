/**
 * DỮ LIỆU GIẢ cho màn 24 · Thông báo.
 * `link` là đường dẫn tới màn liên quan (theo core/figma/figma-screens.ts).
 */
export type NotificationType =
  | 'EXPENSE_ADDED'
  | 'BUDGET_WARNING_80'
  | 'SETTLEMENT_SENT'
  | 'SETTLEMENT_CONFIRMED'
  | 'TRIP_INVITATION'
  | 'MEMBER_JOINED';

export interface MockNotification {
  id: number;
  type: NotificationType;
  title: string;
  body: string;
  /** ISO */
  createdAt: string;
  /** Nhãn thời gian hiển thị */
  timeLabel: string;
  isRead: boolean;
  link: string;
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  EXPENSE_ADDED: 'Chi tiêu',
  BUDGET_WARNING_80: 'Ngân sách',
  SETTLEMENT_SENT: 'Chia tiền',
  SETTLEMENT_CONFIRMED: 'Chia tiền',
  TRIP_INVITATION: 'Lời mời',
  MEMBER_JOINED: 'Thành viên',
};

export const MOCK_NOTIFICATIONS: readonly MockNotification[] = [
  {
    id: 1,
    type: 'SETTLEMENT_SENT',
    title: 'An đã báo chuyển 2.100.000 ₫',
    body: 'Kiểm tra tài khoản và xác nhận đã nhận tiền.',
    createdAt: '2026-11-17T14:35:00+07:00',
    timeLabel: '14:35 · 17/11',
    isRead: false,
    link: '/trips/da-lat/settlements/1',
  },
  {
    id: 2,
    type: 'BUDGET_WARNING_80',
    title: 'Ngân sách Ăn uống đã dùng 80%',
    body: 'Đã chi 2.400.000 ₫ / 3.000.000 ₫ · Đà Lạt cùng hội bạn.',
    createdAt: '2026-11-17T12:10:00+07:00',
    timeLabel: '12:10 · 17/11',
    isRead: false,
    link: '/trips/da-lat/budget',
  },
  {
    id: 3,
    type: 'EXPENSE_ADDED',
    title: 'Lan đã thêm khoản chi',
    body: 'Ăn uống · 2 ngày — 2.400.000 ₫, chia đều cho 4 người.',
    createdAt: '2026-11-17T12:05:00+07:00',
    timeLabel: '12:05 · 17/11',
    isRead: false,
    link: '/trips/da-lat/expenses/1',
  },
  {
    id: 4,
    type: 'TRIP_INVITATION',
    title: 'Trần Lan mời bạn tham gia chuyến đi',
    body: 'Một cuối tuần ở Vũng Tàu · 12 – 13/12/2026.',
    createdAt: '2026-11-16T20:00:00+07:00',
    timeLabel: '20:00 · 16/11',
    isRead: true,
    link: '/invitations/VUNGTAU26',
  },
  {
    id: 5,
    type: 'EXPENSE_ADDED',
    title: 'Minh đã thêm khoản chi',
    body: 'Homestay 2 đêm — 3.600.000 ₫, chia đều cho 4 người.',
    createdAt: '2026-11-16T15:20:00+07:00',
    timeLabel: '15:20 · 16/11',
    isRead: true,
    link: '/trips/da-lat/expenses/3',
  },
  {
    id: 6,
    type: 'MEMBER_JOINED',
    title: 'Lê Huy đã tham gia chuyến đi',
    body: 'Đà Lạt cùng hội bạn hiện có 4 thành viên.',
    createdAt: '2026-11-10T09:00:00+07:00',
    timeLabel: '09:00 · 10/11',
    isRead: true,
    link: '/trips/da-lat/members',
  },
];
