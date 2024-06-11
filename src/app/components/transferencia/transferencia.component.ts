import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CuentasService } from '../../services/cuentas.service';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-transferencia',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    CurrencyPipe,
  ],
  templateUrl: './transferencia.component.html',
  styleUrls: ['./transferencia.component.scss'],
})
export class TransferenciaComponent implements OnInit {
  private readonly cuentasService = inject(CuentasService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  transferenciaForm: FormGroup;
  cuentas: any[] = [];
  saldoCuentaOrigen: number = 0;

  constructor() {
    this.transferenciaForm = this.fb.group({
      cuentaOrigenId: ['', Validators.required],
      cuentaDestinoId: ['', Validators.required],
      monto: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]*$'),
          this.validarMonto(),
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.cuentasService.listarCuentas().subscribe(
      (cuentas) => {
        this.cuentas = cuentas;
      },
      (error) => {
        console.error('Error al listar cuentas', error);
      }
    );

    this.transferenciaForm
      .get('cuentaOrigenId')
      ?.valueChanges.subscribe((value) => {
        const cuenta = this.cuentas.find((c) => c.CuentaId === value);
        this.saldoCuentaOrigen = cuenta ? parseFloat(cuenta.Saldo) : 0;
        this.transferenciaForm.get('monto')?.updateValueAndValidity();
      });
  }

  validarMonto() {
    return (control: any) => {
      if (
        control &&
        this.saldoCuentaOrigen &&
        control.value > this.saldoCuentaOrigen
      ) {
        return { montoInvalido: true };
      }
      return null;
    };
  }

  onSubmit(): void {
    if (this.transferenciaForm.valid) {
      const { cuentaOrigenId, cuentaDestinoId, monto } =
        this.transferenciaForm.value;
      this.cuentasService
        .transferir(cuentaOrigenId, cuentaDestinoId, monto)
        .subscribe(
          (success) => {
            if (success) {
              alert('Transferencia realizada con éxito');
              this.router.navigate(['/home']);
            } else {
              alert('Error al realizar la transferencia');
            }
          },
          (error) => {
            console.error('Error al realizar la transferencia', error);
            alert('Error al realizar la transferencia');
          }
        );
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
