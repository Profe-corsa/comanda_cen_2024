import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Router } from '@angular/router';
import { Usuario } from 'src/app/clases/usuario';
import { Perfiles } from 'src/app/clases/enumerados/perfiles';
import { Estados } from 'src/app/clases/enumerados/Estados';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import {
  IonContent,
  IonButton,
  IonCard,
  IonText,
  IonItem,
  IonInput,
  IonCol,
  IonGrid,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-anonimo-registro',
  templateUrl: './anonimo-registro.component.html',
  styleUrls: ['./anonimo-registro.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonIcon,
    IonGrid,
    IonCol,
    IonItem,
    IonContent,
    IonButton,
    IonCard,
    IonText,
    IonInput,
    ReactiveFormsModule,
  ],
})
export class AnonimoRegistroComponent {
  usuario: Usuario;
  registerForm: FormGroup;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private fb: FormBuilder,
    private toast: ToastService
  ) {
    this.usuario = new Usuario();

    this.registerForm = this.fb.group({
      nombre: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z ]+$'),
        ])
      ),
      apellido: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z ]+$'),
        ])
      ),
    });
  }

  altaUsuarioAnonimo() {
    this.usuario.perfil = Perfiles.clienteAnonimo;
    this.usuario.estado = Estados.aprobado;
    this.usuario.nombre = this.registerForm.value.nombre;
    this.usuario.apellido = this.registerForm.value.apellido;
    this.usuarioService
      .createUsuario(this.usuario)
      .then(async (refUser) => {
        this.usuario.id = refUser.id;
        await this.usuarioService.updateUser(refUser.id, this.usuario);
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.log(error);
        this.toast.showError('Error al crear un usuario anónimo');
      });
  }

  validaciones = {
    nombre: [
      { type: 'required', message: 'El nombre es requerido.' },
      {
        type: 'minlength',
        message: 'El nombre debe tener 3 o más letras.',
      },
      {
        type: 'pattern',
        message: 'El nombre solo puede tener letras y espacios.',
      },
    ],
    apellido: [
      { type: 'required', message: 'La apellido es requerido.' },
      {
        type: 'minlength',
        message: 'El apellido debe tener 3 o más letras.',
      },
      {
        type: 'pattern',
        message: 'El apellido solo puede tener letras y espacios.',
      },
    ],
  };

  clear() {
    this.usuario.nombre = '';
    this.usuario.apellido = '';
    this.usuario.id = '';
  }

  async irAlLogin() {
    this.clear();
    this.router.navigate(['/login']);
  }
}
