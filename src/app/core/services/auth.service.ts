import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { AuthUser, AuthResponse, MeResponse } from '../models/auth.model';

const TOKEN_KEY = 'wineo_admin_token';
const USER_KEY = 'wineo_admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private tokenSignal = signal<string | null>(this.getStoredToken());
  private userSignal = signal<AuthUser | null>(this.getStoredUser());

  currentUser = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  getToken(): string | null {
    return this.tokenSignal();
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private setSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.tokenSignal.set(token);
    this.userSignal.set(user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, { email: email.trim(), password })
      .pipe(
        tap((res) => this.setSession(res.token, res.user)),
        catchError((err) => {
          const msg = err?.error?.error ?? err?.message ?? 'Login failed';
          throw new Error(msg);
        }),
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  /** Restore user from token (e.g. on app init). */
  fetchMe(): Observable<AuthUser | null> {
    const token = this.tokenSignal();
    if (!token) return of(null);
    return this.http
      .get<MeResponse>(`${this.apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap((res) => this.userSignal.set(res.user)),
        map((res) => res.user),
        catchError(() => {
          this.clearSession();
          return of(null);
        }),
      );
  }
}
