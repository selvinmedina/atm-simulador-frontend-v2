import { Component } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { AppModule } from '../../app.module';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm = this.fb.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.maxLength(255)]],
    pin: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(4)]],
  });

  constructor(private fb: FormBuilder) {}

  onSubmit() {
    if (this.loginForm.valid) {
      // Lógica de inicio de sesión
      console.log('Formulario válido', this.loginForm.value);
    }
  }
}
