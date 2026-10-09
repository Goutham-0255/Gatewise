import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService, getTokenExpiry, isTokenExpired } from './auth.service';

const toBase64Url = (value: object) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const makeToken = (payload: object) => `header.${toBase64Url(payload)}.signature`;
const nowSeconds = () => Math.floor(Date.now() / 1000);

describe('token expiry helpers', () => {
  it('reads exp from a valid payload', () => {
    expect(getTokenExpiry(makeToken({ exp: 1234 }))).toBe(1234);
  });

  it('returns null for malformed tokens', () => {
    expect(getTokenExpiry('garbage')).toBeNull();
    expect(getTokenExpiry('a.!!!.c')).toBeNull();
    expect(getTokenExpiry(makeToken({ sub: 'no-exp' }))).toBeNull();
  });

  it('treats past, missing or malformed exp as expired', () => {
    expect(isTokenExpired(makeToken({ exp: nowSeconds() + 3600 }))).toBeFalse();
    expect(isTokenExpired(makeToken({ exp: nowSeconds() - 1 }))).toBeTrue();
    expect(isTokenExpired('garbage')).toBeTrue();
  });
});

describe('AuthService session restore', () => {
  const user = { id: 'u1', username: 'admin', role: 'Admin', email: 'admin@gatewise.dev' };

  const createService = () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    return TestBed.inject(AuthService);
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('restores a valid session', () => {
    localStorage.setItem('gatewise_token', makeToken({ exp: nowSeconds() + 3600 }));
    localStorage.setItem('gatewise_user', JSON.stringify(user));
    const service = createService();
    expect(service.isLoggedIn()).toBeTrue();
    expect(service.isAdmin()).toBeTrue();
  });

  it('clears an expired session on startup', () => {
    localStorage.setItem('gatewise_token', makeToken({ exp: nowSeconds() - 10 }));
    localStorage.setItem('gatewise_user', JSON.stringify(user));
    const service = createService();
    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('gatewise_token')).toBeNull();
    expect(localStorage.getItem('gatewise_user')).toBeNull();
  });
});
