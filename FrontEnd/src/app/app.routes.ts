import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login';
import { RegisterPage } from './pages/register/register';
import { DashboardPage } from './pages/dashboard/dashboard';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [guestGuard] },
  {
    path: 'register',
    component: RegisterPage,
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    component: DashboardPage,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
