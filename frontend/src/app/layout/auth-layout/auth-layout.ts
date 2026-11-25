import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { FigmaScreen } from '../../core/figma/figma-screens';

/** Tiêu đề header mobile của màn con (Figma 2:9, 2:14). Màn 01 dùng header logo. */
const MOBILE_TITLES: Record<string, string> = {
  '02': 'Tạo tài khoản',
  '03': 'Quên mật khẩu',
};

/**
 * Bố cục màn Đăng nhập / Đăng ký / Khôi phục mật khẩu.
 * Figma: PC · 01 (46:2) — cột thương hiệu trái + biểu mẫu phải
 *        01 mobile (2:2) — header logo + nội dung
 *        02, 03 mobile (2:7, 2:12) — header quay lại + tiêu đề
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  private readonly router = inject(Router);

  /** Tiêu đề header mobile; null = header logo */
  protected readonly mobileTitle = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let snapshot: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
        while (snapshot.firstChild) snapshot = snapshot.firstChild;
        const screen = snapshot.data['screen'] as FigmaScreen | undefined;
        return (screen && MOBILE_TITLES[screen.no]) ?? null;
      }),
    ),
    { requireSync: true },
  );
}
