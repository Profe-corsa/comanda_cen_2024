import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { matchPasswordValidator } from 'src/app/validadores/match-password.validator';
import { CamaraService } from '../../services/camara.service';
import { Usuario } from '../../clases/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastService } from 'src/app/services/toast.service';
import { QrScannerService } from 'src/app/services/qrscanner.service';
// import {
//   IonContent,
//   IonHeader,
//   IonTitle,
//   IonToolbar,
//   IonIcon,
//   IonButton,
//   IonCard,
//   IonText,
//   IonGrid,
//   IonRow,
//   IonCol,
// } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { qrCodeOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario-registro',
  templateUrl: './usuario-registro.component.html',
  styleUrls: ['./usuario-registro.component.scss'],
  standalone: true,
  imports: [
    // IonCol,
    // IonRow,
    // IonGrid,
    // IonText,
    // IonCard,
    // IonIcon,
    // IonContent,
    // IonHeader,
    // IonTitle,
    // IonToolbar,
    // IonButton,
    IonicModule,
    FormsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class UsuarioRegistroComponent {
  registerForm: FormGroup;
  public showPassword = false;
  public showRPassword = false;
  public usuario: Usuario | any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private camaraService: CamaraService,
    private usuarioSrv: UsuarioService,
    private toastService: ToastService,
    private qrscannerService: QrScannerService
  ) {
    this.usuario = new Usuario(); // Inicializa el objeto usuario
    this.registerForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        apellido: ['', [Validators.required, Validators.minLength(3)]],
        dni: ['', [Validators.required, Validators.minLength(8)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        rpassword: ['', [Validators.required, Validators.minLength(6)]],
      },
      { validator: matchPasswordValidator('password', 'rpassword') }
    );

    addIcons({
      qrCodeOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleRpasswordVisibility() {
    this.showRPassword = !this.showRPassword;
  }

  formUsuario(formValues: any) {
    console.log('formValues', formValues);
    this.usuario.nombre = formValues.nombre.trim();
    this.usuario.apellido = formValues.apellido.trim();
    this.usuario.email = formValues.email;
    this.usuario.password = formValues.password;
    this.usuario.dni = formValues.dni;
  }

  async onRegister() {
    console.log(this.registerForm.valid);
    if (this.registerForm.valid) {
      // const { email, password } = this.registerForm.value;
      await this.usuarioSrv.saveUserWithEmailAndPassword(this.usuario).then(
        (res: any) => {
          console.error('Error login');

          this.toastService.showError('Usuario Registrado');

          //Redireccionar

          this.router.navigate(['/home']);
        },
        (error) => {
          console.error(error.message);
          this.toastService.showError('¡El correo electrónico ya existe!');
        }
      );
    }
  }

  tomarFoto() {
    this.camaraService.tomarFoto('clientes', Date.now()).then((urlFoto) => {
      //Guardar la url en el objeto usuario
      this.usuario.foto = urlFoto;
    });
  }

  ///Escanea el código QR del DNI y guarda los datos
  scanQr() {
    console.log('scan');
    this.qrscannerService.scanDni().then((dniData) => {
      if (dniData) {
        console.log(dniData);
        // Verifica que dniData no sea null
        this.usuario.apellido = dniData[1]?.toLowerCase() || '';
        this.usuario.nombre = dniData[2]?.toLowerCase() || '';
        this.usuario.dni = Number.parseInt(dniData[4]) || 0;

        // Actualiza el formulario con los datos escaneados
        this.registerForm.patchValue({
          nombre: this.usuario.nombre,
          apellido: this.usuario.apellido,
          dni: this.usuario.dni,
        });
      } else {
        console.log('No se pudieron obtener los datos del DNI');
      }
    });
  }

  irAlLogin() {
    this.router.navigate(['/login']);
  }
}
