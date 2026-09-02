import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { switchMap } from 'rxjs';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './register.html',
  styleUrl: '../shared/auth-page.scss',
})
export class RegisterPage {
  loading = false;
  hidePassword = true;
  errorMessage = '';
  form = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor(
    private auth: AuthService,
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {}

  submit(): void {
    if (this.loading) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, email, password, confirmPassword } = this.form.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.auth
      .register({ username, email, password })
      // Após criar a conta, faz o login antes de abrir o dashboard.
      .pipe(switchMap(() => this.auth.login({ email, password })))
      .subscribe({
        next: () => void this.router.navigateByUrl('/dashboard'),
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.errorMessage = 'Este e-mail já está cadastrado.';
          } else {
            this.errorMessage = 'Não foi possível concluir o cadastro. Se a conta já foi criada, tente entrar.';
          }
          this.loading = false;
          // Atualiza a tela após a resposta da API no Angular sem Zone.js.
          this.changeDetector.markForCheck();
        },
      });
  }
}
