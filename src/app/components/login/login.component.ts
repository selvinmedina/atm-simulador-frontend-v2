import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../services/usuarios.service.service';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly fb = inject(FormBuilder);

  loginForm = this.fb.nonNullable.group({
    nombreUsuario: ['', [Validators.required, Validators.maxLength(255)]],
    pin: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(4)],
    ],
  });

  constructor() {}

  onSubmit() {
    if (this.loginForm.valid) {
      const { nombreUsuario, pin } = this.loginForm.value;
      this.usuariosService.login(nombreUsuario!, pin!).subscribe(
        (response) => {
          this.toastr.success('Inicio de sesión exitoso', 'Éxito');
          this.router.navigate(['/home']);
        },
        (error) => {
          this.toastr.error('Error al iniciar sesión', 'Error');
          console.error(error);
        }
      );
    }
  }
}
