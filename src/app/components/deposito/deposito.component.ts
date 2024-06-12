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
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-deposito',
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
  templateUrl: './deposito.component.html',
  styleUrls: ['./deposito.component.scss'],
})
export class DepositoComponent implements OnInit {
  private readonly cuentasService = inject(CuentasService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  depositoForm: FormGroup;
  cuentas: any[] = [];

  constructor() {
    this.depositoForm = this.fb.group({
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
    if (this.depositoForm.valid) {
      const { cuentaId, monto } = this.depositoForm.value;
      this.cuentasService.depositar(cuentaId, monto).subscribe(
        (response) => {
          alert('Depósito realizado con éxito');
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error al realizar el depósito', error);
          alert('Error al realizar el depósito');
        }
      );
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
