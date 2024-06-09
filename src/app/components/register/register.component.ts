import { Component, OnInit, OnDestroy, inject, ViewChild } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  NgForm,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UsuariosService } from '../../services/usuarios.service.service';

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
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);
  @ViewChild('formDirective') formDirective?: NgForm;

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

  constructor(private usuariosService: UsuariosService) {}

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
      this.usuariosService.register(nombreUsuario!, pin!).subscribe(
        (response) => {
          this.toastr.success('Registro exitoso', 'Éxito');
          console.log(response);
          this.registerForm.reset();
          this.resetFormValidations();
          this.router.navigate(['/home']);
        },
        (error) => {
          this.toastr.error('Error al registrar', 'Error');
          console.error(error);
        }
      );
    }
  }

  resetFormValidations() {
    this.registerForm.reset();
    this.formDirective?.resetForm();
    this.registerForm
      .get('nombreUsuario')
      ?.setValidators([Validators.required, Validators.maxLength(255)]);
    this.registerForm
      .get('pin')
      ?.setValidators([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4),
      ]);
    this.registerForm
      .get('confirmarPin')
      ?.setValidators([
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(4),
      ]);
    this.registerForm.setValidators([
      this.matchValidator('pin', 'confirmarPin'),
    ]);

    // Reset the state of the form controls to pristine and untouched
    this.registerForm.markAsPristine();
    this.registerForm.markAsUntouched();
    this.registerForm.updateValueAndValidity();

    // Reset the state of each control
    Object.keys(this.registerForm.controls).forEach((key) => {
      this.registerForm.get(key)?.markAsPristine();
      this.registerForm.get(key)?.markAsUntouched();
      this.registerForm.get(key)?.updateValueAndValidity();
    });
  }
}
