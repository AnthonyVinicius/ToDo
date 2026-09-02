import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { AuthUser, JwtPayload, LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.models';

const TOKEN_KEY = 'todo_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  getUser(): AuthUser | null {
    return this.decodeUser(this.getToken());
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/login', credentials)
      .pipe(tap(({ token }) => this.storeToken(token)));
  }

  register(data: RegisterRequest): Observable<unknown> {
    return this.http.post('/api/users', data);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  getToken(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token && this.decodeUser(token)) {
      return token;
    }

    this.logout();
    return null;
  }

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private decodeUser(token: string | null): AuthUser | null {
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(this.decodeBase64Url(token.split('.')[1])) as JwtPayload;

      if (!payload.sub || !payload.exp || payload.exp * 1000 <= Date.now()) {
        return null;
      }

      return {
        id: payload.sub,
        name: payload.name,
      };
    } catch {
      return null;
    }
  }

  private decodeBase64Url(value: string | undefined): string {
    if (!value) {
      throw new Error('Invalid token');
    }

    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
}
