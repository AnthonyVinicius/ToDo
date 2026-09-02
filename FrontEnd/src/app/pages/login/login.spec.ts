import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoginPage } from './login';

describe('LoginPage', () => {
  it('updates the error and loading state after an asynchronous response', async () => {
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(LoginPage);
    const http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
    fixture.componentInstance.form.setValue({ email: 'ana@example.com', password: 'wrong' });
    fixture.componentInstance.submit();
    expect(fixture.componentInstance.loading).toBe(true);

    http.expectOne('/api/auth/login').flush({}, { status: 401, statusText: 'Unauthorized' });
    await fixture.whenStable();

    expect(fixture.componentInstance.loading).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent)
      .toContain('E-mail ou senha inválidos.');
    http.verify();
  });
});
