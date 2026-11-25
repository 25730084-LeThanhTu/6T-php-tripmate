import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Bố cục màn Đăng nhập / Đăng ký / Khôi phục mật khẩu.
 * Figma: PC · 01 (46:2) — cột thương hiệu trái + biểu mẫu phải
 *        01 mobile (2:2) — header logo + nội dung
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {}
