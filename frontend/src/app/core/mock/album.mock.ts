/**
 * DỮ LIỆU GIẢ cho nhóm màn Album (22 · Album chuyến đi, 23 · Thêm ảnh).
 * Tên ảnh lấy theo Figma (prototype "Xem ảnh · …").
 * Khi có API: thay bằng service gọi HttpClient.
 */
import { findUser } from './mock-data';

export interface MockPhoto {
  id: number;
  tripId: string;
  /** Ngày chụp, YYYY-MM-DD */
  takenDate: string;
  title: string;
  src: string;
  width: number;
  height: number;
  uploaderUserId: string;
}

export const MOCK_PHOTOS: readonly MockPhoto[] = [
  {
    id: 1,
    tripId: 'da-lat',
    takenDate: '2026-11-16',
    title: 'Hội bạn cùng nhau',
    src: 'images/auth-hero.jpg',
    width: 1200,
    height: 896,
    uploaderUserId: 'u-lan',
  },
  {
    id: 2,
    tripId: 'da-lat',
    takenDate: '2026-11-17',
    title: 'Bình minh Đà Lạt',
    src: 'images/trips/da-lat.jpg',
    width: 1200,
    height: 896,
    uploaderUserId: 'u-minh',
  },
  {
    id: 3,
    tripId: 'da-lat',
    takenDate: '2026-11-17',
    title: 'Cà phê bên đồi',
    src: 'images/itinerary/da-lat-day.jpg',
    width: 1200,
    height: 896,
    uploaderUserId: 'u-huy',
  },
  {
    id: 4,
    tripId: 'da-lat',
    takenDate: '2026-11-17',
    title: 'Biểu tượng TripMate gốc',
    src: 'images/logo-tripmate.png',
    width: 240,
    height: 135,
    uploaderUserId: 'u-an',
  },
];

export function photosOf(tripId: string): MockPhoto[] {
  return MOCK_PHOTOS.filter((p) => p.tripId === tripId);
}

/** Chú thích ảnh trong khung xem ảnh: "Bình minh Đà Lạt · 17/11 · Minh" */
export function photoCaption(photo: MockPhoto): string {
  const [, m, d] = photo.takenDate.split('-');
  const by = findUser(photo.uploaderUserId)?.shortName;
  return [photo.title, `${d}/${m}`, by].filter(Boolean).join(' · ');
}
