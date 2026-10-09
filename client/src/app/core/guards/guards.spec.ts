import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';

describe('route guards', () => {
  let loggedIn = false;
  let admin = false;

  const run = (guard: typeof authGuard) =>
    TestBed.runInInjectionContext(() => guard({} as never, {} as never));

  const urlOf = (result: unknown) =>
    result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : result;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isLoggedIn: () => loggedIn, isAdmin: () => admin } },
      ],
    });
  });

  it('authGuard sends logged-out users to /login', () => {
    loggedIn = false;
    expect(urlOf(run(authGuard))).toBe('/login');
  });

  it('authGuard lets logged-in users through', () => {
    loggedIn = true;
    expect(run(authGuard)).toBeTrue();
  });

  it('adminGuard sends logged-out users to /login', () => {
    loggedIn = false;
    admin = false;
    expect(urlOf(run(adminGuard))).toBe('/login');
  });

  it('adminGuard sends General Users to /dashboard', () => {
    loggedIn = true;
    admin = false;
    expect(urlOf(run(adminGuard))).toBe('/dashboard');
  });

  it('adminGuard lets Admins through', () => {
    loggedIn = true;
    admin = true;
    expect(run(adminGuard)).toBeTrue();
  });
});
