import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type Role = 'Admin' | 'General User';

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
  email: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const TOKEN_KEY = 'gatewise_token';
const USER_KEY = 'gatewise_user';

/** Reads `exp` (seconds) from a JWT without verifying it; returns null if the token is malformed. */
export function getTokenExpiry(token: string): number | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const payload: unknown = JSON.parse(atob(padded));
    const exp = (payload as { exp?: unknown } | null)?.exp;
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string, nowMs = Date.now()): boolean {
  const exp = getTokenExpiry(token);
  return exp === null || exp * 1000 <= nowMs;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUser = new BehaviorSubject<AuthUser | null>(null);

  readonly currentUser$: Observable<AuthUser | null> = this.currentUser.asObservable();
  readonly isAdmin$: Observable<boolean> = this.currentUser$.pipe(map((u) => u?.role === 'Admin'));

  constructor() {
    this.restoreSession();
  }

  login(username: string, password: string): Observable<AuthUser> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password })
      .pipe(
        tap(({ token, user }) => {
          this.store(TOKEN_KEY, token);
          this.store(USER_KEY, JSON.stringify(user));
          this.currentUser.next(user);
        }),
        map(({ user }) => user),
      );
  }

  logout(): void {
    this.remove(TOKEN_KEY);
    this.remove(USER_KEY);
    this.currentUser.next(null);
  }

  getToken(): string | null {
    return this.read(TOKEN_KEY);
  }

  /** Re-checks expiry on every call, so a session ends as soon as the token expires. */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token || isTokenExpired(token)) {
      if (this.currentUser.value) this.logout();
      return false;
    }
    return this.currentUser.value !== null;
  }

  isAdmin(): boolean {
    return this.isLoggedIn() && this.currentUser.value?.role === 'Admin';
  }

  private restoreSession(): void {
    const token = this.read(TOKEN_KEY);
    const rawUser = this.read(USER_KEY);
    if (!token || !rawUser || isTokenExpired(token)) {
      this.logout();
      return;
    }
    try {
      this.currentUser.next(JSON.parse(rawUser) as AuthUser);
    } catch {
      this.logout();
    }
  }

  private read(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private store(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable (e.g. blocked); the session then lasts only for this page
    }
  }

  private remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Nothing to clear if storage is unavailable
    }
  }
}
