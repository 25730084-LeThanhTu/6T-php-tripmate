import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { FigmaScreen } from '../../core/figma/figma-screens';

interface TripMenuItem {
  label: string;
  icon: string;
  /** Đường dẫn con, nối sau /trips/:tripId */
  path: string;
}

interface MobileTab {
  key: 'trips' | 'expenses' | 'album' | 'account';
  label: string;
  icon: string;
}

/**
 * Khung ứng dụng sau khi đăng nhập.
 * Figma desktop: PC · 04 (46:11) — sidebar 232px + thanh công cụ + nội dung
 * Figma mobile : 04 (2:17) và 06 (2:27) — header + nội dung + thanh điều hướng dưới
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly router = inject(Router);

  /** Menu chuyến đi trong sidebar desktop (Figma 46:25) */
  protected readonly tripMenu: readonly TripMenuItem[] = [
    { label: 'Tổng quan', icon: 'icons/trip.svg', path: '' },
    { label: 'Lịch trình', icon: 'icons/calendar.svg', path: 'itinerary' },
    { label: 'Thành viên', icon: 'icons/user.svg', path: 'members' },
    { label: 'Ngân sách', icon: 'icons/wallet.svg', path: 'budget' },
    { label: 'Chi tiêu', icon: 'icons/receipt.svg', path: 'expenses' },
    { label: 'Chia tiền', icon: 'icons/check.svg', path: 'settlements' },
    { label: 'Thống kê', icon: 'icons/download.svg', path: 'stats' },
    { label: 'Album ảnh', icon: 'icons/image.svg', path: 'album' },
  ];

  /** Thanh điều hướng dưới trên mobile (Figma 2:21) */
  protected readonly mobileTabs: readonly MobileTab[] = [
    { key: 'trips', label: 'Chuyến đi', icon: 'trip' },
    { key: 'expenses', label: 'Chi tiêu', icon: 'wallet' },
    { key: 'album', label: 'Album', icon: 'image' },
    { key: 'account', label: 'Cá nhân', icon: 'user' },
  ];

  /** Chuyến đi mở gần nhất — giữ lại khi chuyển sang màn ngoài chuyến đi */
  private lastTripId: string | null = null;

  private readonly navigation = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        let snapshot: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
        while (snapshot.firstChild) snapshot = snapshot.firstChild;
        const routeTripId = snapshot.paramMap.get('tripId');
        if (routeTripId) this.lastTripId = routeTripId;
        return {
          url: this.router.url.split('?')[0],
          screen: snapshot.data['screen'] as FigmaScreen | undefined,
          routeTripId,
          tripId: routeTripId ?? this.lastTripId,
        };
      }),
    ),
    { requireSync: true },
  );

  protected readonly screen = computed(() => this.navigation().screen);
  protected readonly isTripScreen = computed(() => this.screen()?.layout === 'trip');
  protected readonly tripId = computed(() => this.navigation().tripId);

  /** Nút quay lại trên header mobile của màn trong chuyến đi */
  protected readonly backLink = computed(() => {
    const { url, routeTripId } = this.navigation();
    if (!routeTripId || url === `/trips/${routeTripId}`) return ['/trips'];
    return ['/trips', routeTripId];
  });

  protected readonly activeTab = computed<MobileTab['key']>(() => {
    const url = this.navigation().url;
    if (url.startsWith('/account')) return 'account';
    if (/^\/trips\/[^/]+\/album/.test(url)) return 'album';
    if (/^\/trips\/[^/]+\/expenses/.test(url)) return 'expenses';
    return 'trips';
  });

  protected tripLink(path: string): string[] {
    const id = this.tripId();
    if (!id) return ['/trips'];
    return path ? ['/trips', id, ...path.split('/')] : ['/trips', id];
  }

  protected tabLink(key: MobileTab['key']): string[] {
    switch (key) {
      case 'expenses':
        return this.tripLink('expenses');
      case 'album':
        return this.tripLink('album');
      case 'account':
        return ['/account'];
      default:
        return ['/trips'];
    }
  }

  protected tabIcon(tab: MobileTab): string {
    const active = this.activeTab() === tab.key ? '-active' : '';
    return `icons/nav-${tab.icon}${active}.svg`;
  }
}
