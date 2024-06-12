import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service.service';

@Component({
  selector: 'app-cambio-pin',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatInputModule, MatCardModule, MatIconModule],
  templateUrl: './cambio-pin.component.html',
  styleUrls: ['./cambio-pin.component.scss'],
})
export class CambioPinComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  cambioPinForm: FormGroup;

  constructor() {
    this.cambioPinForm = this.fb.group({
      nuevoPin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
      confirmarPin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
    }, {
      validators: this.matchingPins('nuevoPin', 'confirmarPin')
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.cambioPinForm.valid) {
      const { nuevoPin } = this.cambioPinForm.value;
      this.usuariosService.cambiarPin(nuevoPin).subscribe(
        (response) => {
          alert('PIN cambiado con éxito');
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Error al cambiar el PIN', error);
          alert('Error al cambiar el PIN');
        }
      );
    }
  }

  matchingPins(pinKey: string, confirmPinKey: string) {
    return (group: FormGroup) => {
      let pinInput = group.controls[pinKey];
      let confirmPinInput = group.controls[confirmPinKey];
      if (pinInput.value !== confirmPinInput.value) {
        confirmPinInput.setErrors({ mismatch: true });
      } else {
        confirmPinInput.setErrors(null);
      }
    };
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }
}
