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
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CurrencyPipe } from '../../pipes/currency.pipe';

@Component({
  selector: 'app-retiro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatIconModule,
    CurrencyPipe
  ],
  templateUrl: './retiro.component.html',
  styleUrls: ['./retiro.component.scss'],
})
export class RetiroComponent implements OnInit {
  private readonly cuentasService = inject(CuentasService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  retiroForm: FormGroup;
  cuentas: any[] = [];

  constructor() {
    this.retiroForm = this.fb.group({
      cuentaId: ['', Validators.required],
      monto: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    });
  }

  ngOnInit(): void {
    this.cuentasService.listarCuentas().subscribe(
      (data) => {
        this.cuentas = data;
      },
      (error) => {
        console.error('Error al obtener las cuentas', error);
      }
    );
  }

  onSubmit(): void {
    if (this.retiroForm.valid) {
      const { cuentaId, monto } = this.retiroForm.value;
      this.cuentasService.retirar(cuentaId, monto).subscribe(
        (response) => {
          alert(
            `Retiro exitoso. Monto retirado: L ${response.montoRetirado}, Saldo actual: L ${response.saldoActual}`
          );
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error al realizar el retiro', error);
          alert('Error al realizar el retiro');
        }
      );
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
