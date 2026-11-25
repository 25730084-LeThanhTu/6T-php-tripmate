import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { App } from './app';
import { routes } from './app.routes';
import { FIGMA_SCREENS } from './core/figma/figma-screens';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should map every Figma screen to a route', () => {
    expect(FIGMA_SCREENS.length).toBe(25);
  });

  it('should render the auth layout for /auth/login', async () => {
    const harness = await RouterTestingHarness.create('/auth/login');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('aside')).toBeTruthy();
    expect(el.querySelector('app-screen-placeholder h1')?.textContent).toContain('Đăng nhập');
  });

  it('should render a trip screen inside the app shell', async () => {
    const harness = await RouterTestingHarness.create('/trips/abc/expenses');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('nav')).toBeTruthy();
    expect(el.querySelector('app-screen-placeholder h1')?.textContent).toContain('Chi tiêu');
  });
});
