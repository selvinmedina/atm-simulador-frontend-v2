import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TransaccionesService } from '../../services/transacciones.service';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-historial-transacciones',
  standalone: true,
  imports: [MatTableModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './historial-transacciones.component.html',
  styleUrls: ['./historial-transacciones.component.scss'],
})
export class HistorialTransaccionesComponent implements OnInit {
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly router = inject(Router);
  displayedColumns: string[] = ['transaccionId', 'cuentaId', 'tipoTransaccion', 'monto', 'fechaTransaccion', 'estado'];
  dataSource: any[] = [];

  ngOnInit(): void {
    this.transaccionesService.listarTransacciones().subscribe(
      (data) => {
        this.dataSource = data;
      },
      (error) => {
        console.error('Error al obtener las transacciones', error);
      }
    );
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
