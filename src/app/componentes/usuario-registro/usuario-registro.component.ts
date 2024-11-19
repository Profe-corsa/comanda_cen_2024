import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { matchPasswordValidator } from 'src/app/validadores/match-password.validator';
import { CamaraService } from '../../services/camara.service';
import { Usuario } from '../../clases/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastService } from 'src/app/services/toast.service';
import { QrScannerService } from 'src/app/services/qrscanner.service';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonCard,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { qrCodeOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ReactiveFormsModule } from '@angular/forms';
import { Estados } from '../../clases/enumerados/Estados';
import { Perfiles } from '../../clases/enumerados/perfiles';
import { PushMailNotificationService } from 'src/app/services/push-mail-notification.service';

@Component({
  selector: 'app-usuario-registro',
  templateUrl: './usuario-registro.component.html',
  styleUrls: ['./usuario-registro.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonButton,
    IonCard,
    IonText,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
  ],
})
export class UsuarioRegistroComponent {
  registerForm: FormGroup;
  public showPassword = false;
  public showRPassword = false;
  public usuario: Usuario | any;
  imageName: string | null = null;

  nombre: FormGroup | any;
  apellido: FormGroup | any;
  dni: FormGroup | any;
  email: FormGroup | any;
  password: FormGroup | any;
  rpassword: FormGroup | any;
  cuil: FormGroup | any;
  perfil: FormGroup | any;

  @Input() esCliente: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private camaraService: CamaraService,
    private usuarioSrv: UsuarioService,
    private toastService: ToastService,
    private qrscannerService: QrScannerService,
    private notificationSrv: PushMailNotificationService
  ) {
    //Formulario
    this.nombre = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-Z ]+$'),
    ]);
    this.apellido = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-Z ]+$'),
    ]);
    this.dni = new FormControl('', [
      Validators.required,
      // Validators.minLength(7),
      // Validators.maxLength(8),
      Validators.pattern('^[0-9]{7,8}$'),
    ]);
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]);
    this.rpassword = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]);
    this.cuil = new FormControl('');
    this.perfil = new FormControl('');

    // En caso de que avancemos con todas las altas por acá
    // if (!this.cliente) {
    //   this.cuil.setValidators([Validators.pattern('^[0-9]{11}$'), Validators.required])
    //   this.perfil.setValidators([Validators.required])
    // }

    this.usuario = new Usuario(); // Inicializa el objeto usuario
    this.registerForm = this.fb.group(
      {
        nombre: this.nombre,
        apellido: this.apellido,
        dni: this.dni,
        email: this.email,
        password: this.password,
        rpassword: this.rpassword,
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
    //Utilizados para el Cliente
    this.usuario.perfil = Perfiles.cliente;
    this.usuario.estado == Estados.pendienteDeAprobacion;
  }

  async onRegister(formValues: any) {
    this.usuario.perfil = Perfiles.cliente;
    this.usuario.estado = Estados.pendienteDeAprobacion;
    if (this.registerForm.valid && this.usuario.foto) {
      this.formUsuario(formValues);
      try {
        await this.usuarioSrv.saveUserWithEmailAndPassword(this.usuario);
        this.notificationSrv.sendPushNotificationToRole(
          'Usuario pendiente de confirmación',
          `El usuario ${this.usuario.nombre} ${this.usuario.apellido} se encuentra pendiente de aprobación.`,
          'dueño'
        );

        this.notificationSrv.sendPushNotificationToRole(
          'Usuario pendiente de confirmación',
          `El usuario ${this.usuario.nombre} ${this.usuario.apellido} se encuentra pendiente de aprobación.`,
          'supervisor'
        );
        this.toastService.showExito('Usuario Registrado');
        this.router.navigate(['/login']);
      } catch (error: any) {
        console.error(error.message);
        this.toastService.showError(
          '¡Se produjo un error al dar de alta el usuario!'
        );
        if (this.imageName) {
          await this.camaraService.deleteImage('clientes', this.imageName);
        }
      }
    } else {
      this.toastService.showError(
        'Debe completar todos los campos y tomar una foto de perfil.'
      );
    }
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

  async irAlLogin() {
    if (this.imageName) {
      await this.camaraService.deleteImage('clientes', this.imageName);
    }
    this.router.navigate(['/login']);
  }
}
