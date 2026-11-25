/**
 * DỮ LIỆU GIẢ cho nhóm màn Lịch trình (11 · Lịch trình, 12 · Thêm hoạt động).
 * Nội dung lấy theo Figma (chuyến "Đà Lạt cùng hội bạn", ngày 2 · Thứ Ba).
 * Khi có API: thay bằng service gọi HttpClient.
 */
import { MockTrip } from './mock-data';

export type ActivityStatus = 'DONE' | 'UPCOMING';

export interface MockActivity {
  id: number;
  tripId: string;
  /** Ngày diễn ra, YYYY-MM-DD */
  date: string;
  title: string;
  /** Tên ngắn dùng trong phần tóm tắt ngày (desktop) */
  shortTitle?: string;
  place: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  /** Chi phí dự kiến cho nhóm; 0 = Miễn phí */
  estimatedCost: number;
  status: ActivityStatus;
  notes?: string;
}

export interface ItineraryDay {
  /** YYYY-MM-DD */
  date: string;
  /** Số thứ tự ngày trong chuyến: 1, 2, 3... */
  index: number;
  /** "16/11 · T2" */
  chipLabel: string;
  /** "Ngày 2 · Thứ Ba" */
  heading: string;
  /** "17/11/2026 · Ngày 2" */
  optionLabel: string;
}

export const ACTIVITY_STATUS_LABEL: Record<ActivityStatus, string> = {
  DONE: 'Đã hoàn thành',
  UPCOMING: 'Sắp tới',
};

const MOCK_ACTIVITIES: MockActivity[] = [
  {
    id: 1,
    tripId: 'da-lat',
    date: '2026-11-17',
    title: 'Săn mây Cầu Đất',
    place: 'Đồi chè Cầu Đất',
    startTime: '05:00',
    endTime: '07:00',
    estimatedCost: 400_000,
    status: 'DONE',
  },
  {
    id: 2,
    tripId: 'da-lat',
    date: '2026-11-17',
    title: 'Dạo quanh hồ Xuân Hương',
    shortTitle: 'Hồ Xuân Hương',
    place: 'Phường Xuân Hương',
    startTime: '09:00',
    endTime: '11:00',
    estimatedCost: 0,
    status: 'DONE',
  },
  {
    id: 3,
    tripId: 'da-lat',
    date: '2026-11-17',
    title: 'Cà phê ngắm hoàng hôn',
    place: 'Túi Mơ To',
    startTime: '15:00',
    endTime: '17:00',
    estimatedCost: 600_000,
    status: 'UPCOMING',
    notes: 'Mang áo khoác, đến sớm chọn bàn đẹp.',
  },
];

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const WEEKDAY_LONG = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** Danh sách ngày của chuyến đi, sinh từ ngày bắt đầu/kết thúc */
export function itineraryDays(trip: Pick<MockTrip, 'startDate' | 'endDate'>): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  const cursor = new Date(`${trip.startDate}T00:00:00`);
  const end = new Date(`${trip.endDate}T00:00:00`);
  let index = 1;
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const wd = cursor.getDay();
    days.push({
      date: `${y}-${m}-${d}`,
      index,
      chipLabel: `${d}/${m} · ${WEEKDAY_SHORT[wd]}`,
      heading: `Ngày ${index} · ${WEEKDAY_LONG[wd]}`,
      optionLabel: `${d}/${m}/${y} · Ngày ${index}`,
    });
    cursor.setDate(cursor.getDate() + 1);
    index++;
  }
  return days;
}

/** "3 ngày 2 đêm" */
export function durationLabel(dayCount: number): string {
  if (dayCount <= 1) return '1 ngày';
  return `${dayCount} ngày ${dayCount - 1} đêm`;
}

/** Hoạt động của một ngày, sắp theo giờ bắt đầu */
export function activitiesOf(tripId: string, date: string): MockActivity[] {
  return MOCK_ACTIVITIES.filter((a) => a.tripId === tripId && a.date === date).sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );
}

/** Thêm hoạt động (giả lập lưu — chỉ tồn tại trong bộ nhớ đến khi tải lại trang) */
export function addMockActivity(activity: Omit<MockActivity, 'id'>): MockActivity {
  const created = { ...activity, id: Math.max(0, ...MOCK_ACTIVITIES.map((a) => a.id)) + 1 };
  MOCK_ACTIVITIES.push(created);
  return created;
}
