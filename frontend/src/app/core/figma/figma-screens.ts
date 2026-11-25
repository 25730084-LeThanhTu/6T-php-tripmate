/**
 * Ánh xạ màn hình ứng dụng <-> frame trong Figma "TripMate-Design".
 * Route của ứng dụng được sinh từ danh sách này (xem app.routes.ts).
 *
 * Mở một node: `${FIGMA_FILE_URL}?node-id=<id thay ':' bằng '-'>`
 */
export const FIGMA_FILE_URL = 'https://www.figma.com/design/kCwlsGlyGh5DhiN0Zwnpr3/TripMate-Design';

/**
 * auth: màn đăng nhập/đăng ký (không có điều hướng)
 * app : màn cấp tài khoản (danh sách chuyến đi, thông báo, tài khoản...)
 * trip: màn bên trong một chuyến đi (đường dẫn có :tripId)
 */
export type ScreenLayout = 'auth' | 'app' | 'trip';

export interface FigmaScreen {
  /** Số thứ tự màn trong Figma (01 - 25) */
  no: string;
  title: string;
  /** Đường dẫn Angular, không có dấu '/' đầu */
  path: string;
  layout: ScreenLayout;
  figma: { mobile: string; desktop: string };
}

export const FIGMA_SCREENS: readonly FigmaScreen[] = [
  {
    no: '01',
    title: 'Đăng nhập',
    path: 'auth/login',
    layout: 'auth',
    figma: { mobile: '2:2', desktop: '46:2' },
  },
  {
    no: '02',
    title: 'Đăng ký',
    path: 'auth/register',
    layout: 'auth',
    figma: { mobile: '2:7', desktop: '46:5' },
  },
  {
    no: '03',
    title: 'Khôi phục mật khẩu',
    path: 'auth/forgot-password',
    layout: 'auth',
    figma: { mobile: '2:12', desktop: '46:8' },
  },
  {
    no: '04',
    title: 'Chuyến đi của tôi',
    path: 'trips',
    layout: 'app',
    figma: { mobile: '2:17', desktop: '46:11' },
  },
  {
    no: '05',
    title: 'Tạo chuyến đi',
    path: 'trips/new',
    layout: 'app',
    figma: { mobile: '2:22', desktop: '46:76' },
  },
  {
    no: '06',
    title: 'Tổng quan chuyến đi',
    path: 'trips/:tripId',
    layout: 'trip',
    figma: { mobile: '2:27', desktop: '46:141' },
  },
  {
    no: '07',
    title: 'Cài đặt chuyến đi',
    path: 'trips/:tripId/settings',
    layout: 'trip',
    figma: { mobile: '2:32', desktop: '46:206' },
  },
  {
    no: '08',
    title: 'Thành viên',
    path: 'trips/:tripId/members',
    layout: 'trip',
    figma: { mobile: '2:37', desktop: '46:271' },
  },
  {
    no: '09',
    title: 'Mời thành viên',
    path: 'trips/:tripId/members/invite',
    layout: 'trip',
    figma: { mobile: '2:42', desktop: '46:336' },
  },
  {
    no: '10',
    title: 'Chi tiết lời mời',
    path: 'invitations/:code',
    layout: 'app',
    figma: { mobile: '2:47', desktop: '46:401' },
  },
  {
    no: '11',
    title: 'Lịch trình',
    path: 'trips/:tripId/itinerary',
    layout: 'trip',
    figma: { mobile: '2:52', desktop: '46:466' },
  },
  {
    no: '12',
    title: 'Thêm hoạt động',
    path: 'trips/:tripId/itinerary/new',
    layout: 'trip',
    figma: { mobile: '2:57', desktop: '46:531' },
  },
  {
    no: '13',
    title: 'Ngân sách',
    path: 'trips/:tripId/budget',
    layout: 'trip',
    figma: { mobile: '2:62', desktop: '46:596' },
  },
  {
    no: '14',
    title: 'Quỹ chung',
    path: 'trips/:tripId/fund',
    layout: 'trip',
    figma: { mobile: '2:67', desktop: '46:661' },
  },
  {
    no: '15',
    title: 'Chi tiêu',
    path: 'trips/:tripId/expenses',
    layout: 'trip',
    figma: { mobile: '2:72', desktop: '46:726' },
  },
  {
    no: '16',
    title: 'Thêm chi tiêu',
    path: 'trips/:tripId/expenses/new',
    layout: 'trip',
    figma: { mobile: '2:77', desktop: '46:791' },
  },
  {
    no: '17',
    title: 'Cách chia chi phí',
    path: 'trips/:tripId/expenses/new/split',
    layout: 'trip',
    figma: { mobile: '2:82', desktop: '46:856' },
  },
  {
    no: '18',
    title: 'Chi tiết khoản chi',
    path: 'trips/:tripId/expenses/:expenseId',
    layout: 'trip',
    figma: { mobile: '2:87', desktop: '46:921' },
  },
  {
    no: '19',
    title: 'Chia tiền',
    path: 'trips/:tripId/settlements',
    layout: 'trip',
    figma: { mobile: '2:92', desktop: '46:986' },
  },
  {
    no: '20',
    title: 'Xác nhận thanh toán',
    path: 'trips/:tripId/settlements/:settlementId',
    layout: 'trip',
    figma: { mobile: '2:97', desktop: '46:1051' },
  },
  {
    no: '21',
    title: 'Thống kê',
    path: 'trips/:tripId/stats',
    layout: 'trip',
    figma: { mobile: '2:102', desktop: '46:1116' },
  },
  {
    no: '22',
    title: 'Album chuyến đi',
    path: 'trips/:tripId/album',
    layout: 'trip',
    figma: { mobile: '2:107', desktop: '46:1181' },
  },
  {
    no: '23',
    title: 'Thêm ảnh',
    path: 'trips/:tripId/album/upload',
    layout: 'trip',
    figma: { mobile: '2:112', desktop: '46:1246' },
  },
  {
    no: '24',
    title: 'Thông báo',
    path: 'notifications',
    layout: 'app',
    figma: { mobile: '2:117', desktop: '46:1311' },
  },
  {
    no: '25',
    title: 'Tài khoản',
    path: 'account',
    layout: 'app',
    figma: { mobile: '2:122', desktop: '46:1376' },
  },
];

export function figmaNodeUrl(nodeId: string): string {
  return `${FIGMA_FILE_URL}?node-id=${nodeId.replace(':', '-')}`;
}
