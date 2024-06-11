import { Component, OnInit, inject } from '@angular/core';
import { CuentasService } from '../../services/cuentas.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPipe } from '../../pipes/currency.pipe';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-saldo',
  standalone: true,
  imports: [MatCardModule, MatListModule, MatButtonModule, CurrencyPipe, MatIconModule],
  templateUrl: './saldo.component.html',
  styleUrls: ['./saldo.component.scss'],
})
export class SaldoComponent implements OnInit {
  private readonly cuentasService = inject(CuentasService);
  private readonly router = inject(Router);
  cuentas: any[] = [];

  ngOnInit(): void {
    this.cuentasService.listarCuentas().subscribe(
      (cuentas) => {
        this.cuentas = cuentas;
      },
      (error) => {
        console.error('Error al listar cuentas', error);
      }
    );
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
