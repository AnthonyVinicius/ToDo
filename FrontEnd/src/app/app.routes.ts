import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login';
import { RegisterPage } from './pages/register/register';
import { DashboardPage } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: LoginPage },
  {
    path: 'register',
    component: RegisterPage,
  },
  {
    path: 'dashboard',
    component: DashboardPage,
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
