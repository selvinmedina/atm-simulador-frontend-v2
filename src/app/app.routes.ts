import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './auth.guard';
import { HomeComponent } from './components/home/home.component';
import { redirectGuard } from './redirect.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [redirectGuard] },
  { path: 'registro', component: RegisterComponent, canActivate: [redirectGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
