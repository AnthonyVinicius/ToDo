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
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/\S/),
      ],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(72),
        Validators.pattern(/\S/),
      ],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(72)],
    }),
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
    this.errorMessage = '';
    this.form.patchValue({
      username: this.form.controls.username.value.trim(),
      email: this.form.controls.email.value.trim(),
    });
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
      .pipe(switchMap(() => this.auth.login({ email, password })))
      .subscribe({
        next: () => void this.router.navigateByUrl('/dashboard'),
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.errorMessage = 'Este e-mail já está cadastrado.';
          } else {
            this.errorMessage =
              'Não foi possível concluir o cadastro. Se a conta já foi criada, tente entrar.';
          }
          this.loading = false;
          this.changeDetector.markForCheck();
        },
      });
  }
}
