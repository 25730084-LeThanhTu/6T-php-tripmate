import { Type } from '@angular/core';
import { Route, Routes } from '@angular/router';

import { FIGMA_SCREENS, FigmaScreen } from './core/figma/figma-screens';
import { AppShell } from './layout/app-shell/app-shell';
import { AuthLayout } from './layout/auth-layout/auth-layout';

/** Component (lazy-load, export default) của từng màn, theo số thứ tự màn trong Figma */
const SCREEN_COMPONENTS: Record<string, () => Promise<{ default: Type<unknown> }>> = {
  '01': () => import('./features/auth/login/login'),
  '02': () => import('./features/auth/register/register'),
  '03': () => import('./features/auth/forgot-password/forgot-password'),
  '04': () => import('./features/trips/trip-list/trip-list'),
  '05': () => import('./features/trips/trip-create/trip-create'),
  '06': () => import('./features/trips/trip-overview/trip-overview'),
  '07': () => import('./features/trips/trip-settings/trip-settings'),
  '08': () => import('./features/members/member-list/member-list'),
  '09': () => import('./features/members/member-invite/member-invite'),
  '10': () => import('./features/members/invitation-detail/invitation-detail'),
  '11': () => import('./features/itinerary/itinerary/itinerary'),
  '12': () => import('./features/itinerary/activity-create/activity-create'),
  '13': () => import('./features/budget/budget/budget'),
  '14': () => import('./features/budget/fund/fund'),
  '15': () => import('./features/expenses/expense-list/expense-list'),
  '16': () => import('./features/expenses/expense-create/expense-create'),
  '17': () => import('./features/expenses/expense-split/expense-split'),
  '18': () => import('./features/expenses/expense-detail/expense-detail'),
  '19': () => import('./features/settlements/settlement-list/settlement-list'),
  '20': () => import('./features/settlements/settlement-confirm/settlement-confirm'),
  '21': () => import('./features/stats/stats/stats'),
  '22': () => import('./features/album/album/album'),
  '23': () => import('./features/album/photo-upload/photo-upload'),
  '24': () => import('./features/notifications/notifications/notifications'),
  '25': () => import('./features/account/account/account'),
};

/** Route sinh tự động từ danh sách màn hình Figma */
function toRoute(screen: FigmaScreen): Route {
  return {
    path: screen.path,
    loadComponent: SCREEN_COMPONENTS[screen.no],
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
