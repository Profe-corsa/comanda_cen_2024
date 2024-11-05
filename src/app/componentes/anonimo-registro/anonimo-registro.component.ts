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
import { CamaraService } from '../../services/camara.service';

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
  imageName: string | null = null;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private fb: FormBuilder,
    private toast: ToastService,
    private camaraService: CamaraService
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
          Validators.minLength(3),
          Validators.pattern('^[a-zA-Z ]+$'),
        ])
      ),
    });
  }

  async altaUsuarioAnonimo() {
    this.usuario.perfil = Perfiles.clienteAnonimo;
    this.usuario.estado = Estados.aprobado;
    this.usuario.nombre = this.registerForm.value.nombre;
    this.usuario.apellido = this.registerForm.value.apellido;

    if (this.registerForm.valid && this.usuario.foto) {
      try {
        const refUser = await this.usuarioService.createUsuario(this.usuario);
        this.usuario.id = refUser.id;
        await this.usuarioService.updateUser(refUser.id, this.usuario);
        this.router.navigate(['/home']);
      } catch (error: any) {
        if (this.imageName) {
          await this.camaraService.deleteImage('clientes', this.imageName);
        }
        this.toast.showError(
          'Error al crear un usuario anónimo: ' + error.message
        );
      }
    } else if (this.registerForm.valid && this.usuario.apellido != '') {
      try {
        const refUser = await this.usuarioService.createUsuario(this.usuario);
        this.usuario.id = refUser.id;
        await this.usuarioService.updateUser(refUser.id, this.usuario);
        this.router.navigate(['/home']);
      } catch (error: any) {
        this.toast.showError(
          'Error al crear un usuario anónimo: ' + error.message
        );
      }
    } else {
      if (this.imageName) {
        await this.camaraService.deleteImage('clientes', this.imageName);
      }
      this.toast.showError(
        'Debe completar al menos el nombre y tomar una foto de perfil, o el nombre y el apellido.'
      );
    }
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
    if (this.imageName) {
      await this.camaraService.deleteImage('clientes', this.imageName);
    }
    this.clear();
    this.router.navigate(['/login']);
  }

  tomarFoto() {
    try {
      const imageName = Date.now().toString();
      this.camaraService.tomarFoto('clientes', imageName).then((urlFoto) => {
        //Guardar la url en el objeto usuario
        this.usuario.foto = urlFoto;
        this.imageName = imageName;
      });
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }
}
