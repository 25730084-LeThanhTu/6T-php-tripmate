import { Route, Routes } from '@angular/router';

import { FIGMA_SCREENS, FigmaScreen } from './core/figma/figma-screens';
import { ScreenPlaceholder } from './features/screen-placeholder/screen-placeholder';
import { AppShell } from './layout/app-shell/app-shell';
import { AuthLayout } from './layout/auth-layout/auth-layout';

/**
 * Route sinh tự động từ danh sách màn hình Figma.
 * Khi dựng xong một màn, thay `ScreenPlaceholder` bằng component thật, ví dụ:
 *   { ...toRoute(screen), component: TripList }
 */
function toRoute(screen: FigmaScreen): Route {
  return {
    path: screen.path,
    component: ScreenPlaceholder,
    data: { screen },
    title: `${screen.title} · TripMate`,
  };
}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'trips' },
  {
    path: '',
    component: AuthLayout,
    children: FIGMA_SCREENS.filter((s) => s.layout === 'auth').map(toRoute),
  },
  {
    path: '',
    component: AppShell,
    children: FIGMA_SCREENS.filter((s) => s.layout !== 'auth').map(toRoute),
  },
  { path: '**', redirectTo: 'trips' },
];
