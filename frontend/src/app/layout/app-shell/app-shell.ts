import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { FIGMA_SCREENS, FigmaScreen } from '../../core/figma/figma-screens';
import { MOCK_CURRENT_USER, MOCK_TRIPS, findTrip, formatDateRange } from '../../core/mock/mock-data';

/** Màn có thanh điều hướng dưới trên mobile (Figma: frame "Điều hướng" có 4 tab) */
const SCREENS_WITH_BOTTOM_NAV = new Set([
  '04',
  '06',
  '08',
  '11',
  '13',
  '15',
  '19',
  '21',
  '22',
  '24',
  '25',
]);

/** Tiêu đề header mobile khác tên màn */
const MOBILE_TITLE_OVERRIDES: Record<string, string> = {
  '10': 'Lời mời chuyến đi',
};

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

  /** Menu chuyến đi mở từ nút "…" trên header mobile (Figma prototype 67:2010) */
  protected readonly menuOpen = signal(false);
  protected readonly mobileTripMenu: readonly { label: string; path: string }[] = [
    { label: 'Tổng quan', path: '' },
    { label: 'Cài đặt chuyến đi', path: 'settings' },
    { label: 'Thành viên', path: 'members' },
    { label: 'Lịch trình', path: 'itinerary' },
    { label: 'Ngân sách', path: 'budget' },
    { label: 'Quỹ chung', path: 'fund' },
    { label: 'Chi tiêu', path: 'expenses' },
    { label: 'Chia tiền', path: 'settlements' },
    { label: 'Thống kê', path: 'stats' },
    { label: 'Album ảnh', path: 'album' },
  ];

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
  // Figma 04 vẫn hiển thị chuyến đang diễn ra trong sidebar khi chưa mở chuyến nào
  private lastTripId: string | null = MOCK_TRIPS.find((t) => t.status === 'ONGOING')?.id ?? null;

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

  // TODO(API): thay dữ liệu giả bằng người dùng đăng nhập / chuyến đi lấy từ backend
  protected readonly userName = MOCK_CURRENT_USER.fullName;
  protected readonly trip = computed(() => findTrip(this.tripId()));
  protected readonly tripDates = computed(() => {
    const t = this.trip();
    return t ? formatDateRange(t.startDate, t.endDate) : '';
  });

  /** Breadcrumb thanh công cụ desktop: Chuyến đi của tôi / <chuyến đi> / <màn> */
  protected readonly breadcrumb = computed(() => {
    // Figma: 04 "Chuyến đi của tôi / Tất cả chuyến đi"; các màn khác "… / <chuyến đi hiện tại> / <tên màn>"
    const parts = ['Chuyến đi của tôi'];
    const title = this.screen()?.title;
    if (this.screen()?.no === '04') {
      parts.push('Tất cả chuyến đi');
    } else {
      const tripTitle =
        this.trip()?.title ?? (this.isTripScreen() ? `Chuyến đi #${this.tripId()}` : null);
      if (tripTitle) parts.push(tripTitle);
      if (title) parts.push(title);
    }
    return parts.join('  /  ');
  });

  /** Mobile: chỉ màn 04 dùng header logo + chuông; các màn khác dùng quay lại + tiêu đề */
  protected readonly logoHeader = computed(() => this.screen()?.no === '04');

  /** Mobile: màn có thanh điều hướng dưới (theo Figma); màn form/chi tiết thì không */
  protected readonly showBottomNav = computed(() =>
    SCREENS_WITH_BOTTOM_NAV.has(this.screen()?.no ?? ''),
  );

  /** Tiêu đề header mobile (Figma: 06 = tên chuyến đi, 10 = "Lời mời chuyến đi", còn lại = tên màn) */
  protected readonly mobileTitle = computed(() => {
    const s = this.screen();
    if (!s) return '';
    if (s.no === '06') return this.trip()?.title ?? s.title;
    return MOBILE_TITLE_OVERRIDES[s.no] ?? s.title;
  });

  /** Nút quay lại: về màn cha (bỏ đoạn cuối của đường dẫn), không có thì về /trips */
  protected readonly backLink = computed(() => {
    const { screen, routeTripId } = this.navigation();
    if (!screen) return ['/trips'];
    const parentPath = screen.path.split('/').slice(0, -1).join('/');
    const parentExists = FIGMA_SCREENS.some((s) => s.path === parentPath);
    if (!parentExists) return ['/trips'];
    return ['/', ...parentPath.replace(':tripId', routeTripId ?? '').split('/')];
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
