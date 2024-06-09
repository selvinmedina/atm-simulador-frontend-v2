import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
// import { RegistroService } from '../services/registro.service'; // Asegúrate de ajustar la ruta según sea necesario

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);

  registerForm = this.fb.nonNullable.group(
    {
      nombreUsuario: ['', [Validators.required, Validators.maxLength(255)]],
      pin: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
      ],
      confirmarPin: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
      ],
    },
    {
      validators: [this.matchValidator('pin', 'confirmarPin')],
    }
  );

  constructor() // private registroService: RegistroService
  {}

  ngOnInit() {}

  ngOnDestroy(): void {}

  matchValidator(source: string, target: string) {
    return (control: AbstractControl) => {
      const sourceControl = control.get(source)!;
      const targetControl = control.get(target)!;
      if (targetControl.errors && !targetControl.errors['mismatch']) {
        return null;
      }
      if (sourceControl.value !== targetControl.value) {
        targetControl.setErrors({ mismatch: true });
        return { mismatch: true };
      } else {
        targetControl.setErrors(null);
        return null;
      }
    };
  }

  submit() {
    if (this.registerForm.valid) {
      const { nombreUsuario, pin } = this.registerForm.value;
      console.log('Formulario válido', this.registerForm.value);
      // this.registroService.registerByHttp(nombreUsuario!, pin!).subscribe(response => {
      //   console.log(response);
      // });
    }
  }
}
