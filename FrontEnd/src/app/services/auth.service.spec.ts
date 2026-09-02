import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  function createToken(expiresAt: number): string {
    const payload = btoa(JSON.stringify({ sub: 'user-1', name: 'Ana', exp: expiresAt }));
    return `header.${payload}.signature`;
  }

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('stores the token after login and reads the user', () => {
    const token = createToken(Date.now() / 1000 + 3600);
    service.login({ email: 'ana@example.com', password: 'password123' }).subscribe();
    const request = http.expectOne('/api/auth/login');
    expect(request.request.method).toBe('POST');
    request.flush({ token });

    expect(service.getToken()).toBe(token);
    expect(service.getUser()).toEqual({ id: 'user-1', name: 'Ana' });
    expect(service.isAuthenticated()).toBe(true);
  });

  it('reads a restored session and removes it on logout', () => {
    localStorage.setItem('todo_access_token', createToken(Date.now() / 1000 + 3600));
    expect(service.isAuthenticated()).toBe(true);
    service.logout();
    expect(service.getUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('checks expiration again even if the session was previously valid', () => {
    const now = Date.now();
    localStorage.setItem('todo_access_token', createToken(now / 1000 + 60));
    expect(service.isAuthenticated()).toBe(true);
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now + 120000);
    try {
      expect(service.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('todo_access_token')).toBeNull();
    } finally {
      clock.mockRestore();
    }
  });

  it('rejects a malformed token', () => {
    localStorage.setItem('todo_access_token', 'invalid');
    expect(service.isAuthenticated()).toBe(false);
  });
});
