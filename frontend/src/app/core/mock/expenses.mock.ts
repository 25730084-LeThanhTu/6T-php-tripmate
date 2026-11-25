/**
 * DỮ LIỆU GIẢ riêng cho nhóm màn Chi tiêu (15 – 18).
 * Nội dung theo Figma: 15 (2:72 / 46:726) · 18 (2:87 / 46:921).
 * Khi có API: thay bằng service gọi HttpClient (expense_audit_logs, receipts).
 */

/** Ngày "hôm nay" trong thiết kế (chuyến Đà Lạt đang diễn ra) */
export const EXPENSE_MOCK_TODAY = '2026-11-17';

export type ExpenseAuditAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface MockExpenseAuditLog {
  id: number;
  expenseId: number;
  /** Thành viên thực hiện thao tác */
  actorMemberId: number;
  action: ExpenseAuditAction;
  /** ISO, giờ Việt Nam */
  createdAt: string;
  /** Dòng chính: "Minh cập nhật tên khoản chi" (không gồm giờ và tên người) */
  summary: string;
  /** Dòng phụ: chi tiết thay đổi */
  detail: string;
}

export interface MockExpenseReceipt {
  expenseId: number;
  fileName: string;
}

/** Lịch sử chỉnh sửa (Figma 2:1061 / 46:2255) — mới nhất trước */
export const MOCK_EXPENSE_AUDIT_LOGS: readonly MockExpenseAuditLog[] = [
  {
    id: 2,
    expenseId: 2,
    actorMemberId: 1,
    action: 'UPDATE',
    createdAt: '2026-11-17T14:20:00+07:00',
    summary: 'cập nhật tên khoản chi',
    detail: '“Vé tham quan” → “Vé tham quan & gửi xe”',
  },
  {
    id: 1,
    expenseId: 2,
    actorMemberId: 1,
    action: 'CREATE',
    createdAt: '2026-11-17T14:15:00+07:00',
    summary: 'tạo khoản chi',
    detail: '600.000 ₫ · Chia đều cho 4 thành viên',
  },
  {
    id: 3,
    expenseId: 1,
    actorMemberId: 2,
    action: 'CREATE',
    createdAt: '2026-11-17T20:05:00+07:00',
    summary: 'tạo khoản chi',
    detail: '2.400.000 ₫ · Chia đều cho 4 thành viên',
  },
  {
    id: 4,
    expenseId: 3,
    actorMemberId: 1,
    action: 'CREATE',
    createdAt: '2026-11-16T15:00:00+07:00',
    summary: 'tạo khoản chi',
    detail: '3.600.000 ₫ · Chia đều cho 4 thành viên',
  },
  {
    id: 5,
    expenseId: 4,
    actorMemberId: 3,
    action: 'CREATE',
    createdAt: '2026-11-16T07:30:00+07:00',
    summary: 'tạo khoản chi',
    detail: '1.800.000 ₫ · Chia đều cho 4 thành viên',
  },
];

/** Hoá đơn đã đính kèm (Figma 2:1057: "hoadon_1711.jpg") */
export const MOCK_EXPENSE_RECEIPTS: readonly MockExpenseReceipt[] = [
  { expenseId: 2, fileName: 'hoadon_1711.jpg' },
  { expenseId: 3, fileName: 'homestay_1611.jpg' },
];

export function expenseAuditLogs(expenseId: number): MockExpenseAuditLog[] {
  return MOCK_EXPENSE_AUDIT_LOGS.filter((l) => l.expenseId === expenseId).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function expenseReceipt(expenseId: number): MockExpenseReceipt | undefined {
  return MOCK_EXPENSE_RECEIPTS.find((r) => r.expenseId === expenseId);
}
