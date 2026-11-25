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
import { TranslatePipe } from '../../core/i18n';

/** Khóa i18n tiêu đề header mobile của màn con (Figma 2:9, 2:14). Màn 01 dùng header logo. */
const MOBILE_TITLE_KEYS: Record<string, string> = {
  '02': 'auth.register.title',
  '03': 'auth.forgotPassword.title',
};

/**
 * Bố cục màn Đăng nhập / Đăng ký / Khôi phục mật khẩu.
 * Figma: PC · 01 (46:2) — cột thương hiệu trái + biểu mẫu phải
 *        01 mobile (2:2) — header logo + nội dung
 *        02, 03 mobile (2:7, 2:12) — header quay lại + tiêu đề
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, RouterLink, TranslatePipe],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  private readonly router = inject(Router);

  /** Khóa i18n tiêu đề header mobile; null = header logo */
  protected readonly mobileTitleKey = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let snapshot: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
        while (snapshot.firstChild) snapshot = snapshot.firstChild;
        const screen = snapshot.data['screen'] as FigmaScreen | undefined;
        return (screen && MOBILE_TITLE_KEYS[screen.no]) ?? null;
      }),
    ),
    { requireSync: true },
  );
}
