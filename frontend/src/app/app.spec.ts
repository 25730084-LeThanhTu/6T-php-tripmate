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
    expect(el.querySelector('app-login form')).toBeTruthy();
    expect(el.querySelector('input[type="email"]')).toBeTruthy();
  });

  it('should render a trip screen with mock data inside the app shell', async () => {
    const harness = await RouterTestingHarness.create('/trips/da-lat/expenses');
    const el = harness.routeNativeElement as HTMLElement;
    expect(el.querySelector('aside nav')).toBeTruthy();
    expect(el.querySelector('app-expense-list')?.textContent).toContain('Homestay 2 đêm');
  });
});
