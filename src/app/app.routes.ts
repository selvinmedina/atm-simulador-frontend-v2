import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './auth.guard';
import { HomeComponent } from './components/home/home.component';
import { redirectGuard } from './redirect.guard';
import { HistorialTransaccionesComponent } from './components/historial-transacciones/historial-transacciones.component';
import { TransferenciaComponent } from './components/transferencia/transferencia.component';
import { SaldoComponent } from './components/saldo/saldo.component';
import { RetiroComponent } from './components/retiro/retiro.component';
import { DepositoComponent } from './components/deposito/deposito.component';
import { CambioPinComponent } from './components/cambio-pin/cambio-pin.component';
import { PagoServiciosComponent } from './components/pago-servicios/pago-servicios.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [redirectGuard] },
  { path: 'registro', component: RegisterComponent, canActivate: [redirectGuard] },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'historial-transacciones', component: HistorialTransaccionesComponent, canActivate: [authGuard] },
  { path: 'transferencia', component: TransferenciaComponent, canActivate: [authGuard] },
  { path: 'saldo', component: SaldoComponent, canActivate: [authGuard] },
  { path: 'retiro', component: RetiroComponent, canActivate: [authGuard] },
  { path: 'deposito', component: DepositoComponent, canActivate: [authGuard] },
  { path: 'cambio-pin', component: CambioPinComponent },
  { path: 'pago-servicios', component: PagoServiciosComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];
