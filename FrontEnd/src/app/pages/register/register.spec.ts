import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RegisterPage } from './register';

describe('RegisterPage validation', () => {
  let page: RegisterPage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([]), provideHttpClient()],
    });
    page = TestBed.createComponent(RegisterPage).componentInstance;
    page.form.setValue({
      username: 'Ana',
      email: 'ana@example.com',
      password: 'password',
      confirmPassword: 'password',
    });
  });

  it('accepts valid data and checks name limits', () => {
    expect(page.form.valid).toBe(true);
    page.form.controls.username.setValue('a'.repeat(51));
    expect(page.form.invalid).toBe(true);
    page.form.controls.username.setValue(' a ');
    page.submit();
    expect(page.form.controls.username.hasError('minlength')).toBe(true);
  });

  it('rejects blank, short and oversized passwords', () => {
    for (const value of ['        ', '1234567', 'a'.repeat(73), 'á'.repeat(73)]) {
      page.form.controls.password.setValue(value);
      expect(page.form.controls.password.invalid).toBe(true);
    }
    for (const value of ['a'.repeat(8), 'a'.repeat(72), 'á'.repeat(72)]) {
      page.form.controls.password.setValue(value);
      expect(page.form.controls.password.valid).toBe(true);
    }
  });

  it('rejects mismatching confirmation without submitting', () => {
    page.form.controls.confirmPassword.setValue('different');
    page.submit();
    expect(page.errorMessage).toBe('As senhas não coincidem.');
    expect(page.loading).toBe(false);
  });
});
