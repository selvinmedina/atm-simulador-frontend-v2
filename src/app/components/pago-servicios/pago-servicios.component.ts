import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ServiciosService } from '../../services/servicios.service';
import { CuentasService } from '../../services/cuentas.service';
import { PagosService } from '../../services/pagos.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-pago-servicios',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    CurrencyPipe
  ],
  templateUrl: './pago-servicios.component.html',
  styleUrls: ['./pago-servicios.component.scss'],
})
export class PagoServiciosComponent implements OnInit {
  private readonly serviciosService = inject(ServiciosService);
  private readonly cuentasService = inject(CuentasService);
  private readonly pagosService = inject(PagosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  pagoServiciosForm: FormGroup;
  servicios: any[] = [];
  cuentas: any[] = [];

  constructor() {
    this.pagoServiciosForm = this.fb.group({
      servicioId: ['', Validators.required],
      cuentaId: ['', Validators.required],
      monto: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  ngOnInit(): void {
    this.serviciosService.listarServicios().subscribe((servicios) => {
      this.servicios = servicios;
    });

    this.cuentasService.listarCuentas().subscribe((cuentas) => {
      this.cuentas = cuentas;
    });
  }

  onSubmit(): void {
    if (this.pagoServiciosForm.valid) {
      const { servicioId, cuentaId, monto } = this.pagoServiciosForm.value;
      this.pagosService.realizarPago(servicioId, cuentaId, monto).subscribe(
        (success) => {
          if (success) {
            alert('Pago realizado con éxito');
            this.router.navigate(['/home']);
          } else {
            alert('Error al realizar el pago');
          }
        },
        (error) => {
          console.error('Error al realizar el pago', error);
          alert('Error al realizar el pago');
        }
      );
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
