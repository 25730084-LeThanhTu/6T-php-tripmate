/**
 * DỮ LIỆU GIẢ cho nhóm màn tài khoản (01 Đăng nhập · 02 Đăng ký · 03 Khôi phục mật khẩu).
 * Khi có API: thay bằng AuthService gọi HttpClient.
 */
import { MOCK_CURRENT_USER } from './mock-data';

/** Giá trị điền sẵn trong biểu mẫu, đúng như Figma. */
export const AUTH_PREFILL = {
  fullName: MOCK_CURRENT_USER.fullName,
  username: `@${MOCK_CURRENT_USER.username}`,
  email: MOCK_CURRENT_USER.email,
  /** Figma hiển thị "••••••••" — mật khẩu giả 8 ký tự. */
  password: '12345678',
} as const;

/** Đường dẫn giữa các màn tài khoản (khớp figma-screens.ts). */
export const AUTH_LINKS = {
  login: '/auth/login',
  register: '/auth/register',
  forgotPassword: '/auth/forgot-password',
  /** Sau khi đăng nhập / đăng ký thành công (giả lập). */
  afterLogin: '/trips',
} as const;

/** Thời gian chờ trước khi được gửi lại email khôi phục ("Gửi lại sau 00:59"). */
export const RESET_RESEND_SECONDS = 59;
