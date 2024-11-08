import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from '@angular/forms';
import { matchPasswordValidator } from 'src/app/validadores/match-password.validator';
import { CamaraService } from '../../services/camara.service';
import { Usuario } from '../../clases/usuario';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastService } from 'src/app/services/toast.service';
import { QrScannerService } from 'src/app/services/qrscanner.service';
import { addIcons } from 'ionicons';
import { qrCodeOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Perfiles } from 'src/app/clases/enumerados/perfiles';
@Component({
  selector: 'app-duenio-empleado',
  templateUrl: './duenio-empleado.component.html',
  styleUrls: ['./duenio-empleado.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    
  ],
})
export class DuenioEmpleadoComponent {
  @Input() tipoUsuario: string = 'dueño';
  @Output() registrar = new EventEmitter<any>();
  registerForm: FormGroup;
  public showPassword = false;
  public showRPassword = false;
  public usuario: Usuario | any;
  perfiles = Object.values(Perfiles).filter(perfil => perfil !== Perfiles.dueño && perfil !== Perfiles.cliente && perfil !== Perfiles.clienteAnonimo);
  imageName: string | null = null;
  nombre: FormGroup | any;
  apellido: FormGroup | any;
  dni: FormGroup | any;
  cuil: FormGroup | any;
  email: FormGroup | any;
  perfil: FormGroup | any;
  password: FormGroup | any;
  rpassword: FormGroup | any;
  

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private camaraService: CamaraService,
    private usuarioSrv: UsuarioService,
    private toastService: ToastService,
    private qrscannerService: QrScannerService
  ) {
    this.nombre = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]);
    this.apellido = new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]);
    this.dni = new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]);
    this.cuil = new FormControl('', [
      Validators.required,
      Validators.minLength(13),
      Validators.maxLength(13),
      Validators.pattern(/^\d{2}-\d{8}-\d{1}$/),
      
    ])
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]);
    this.perfil = new FormControl('', [
      Validators.required,
    ]);
    this.rpassword = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]);
    this.usuario = new Usuario(); // Inicializa el objeto usuario
    this.registerForm = this.fb.group(
      {
        nombre: this.nombre,
        apellido: this.apellido,
        dni: this.dni,
        cuil: this.cuil,
        email: this.email,
        perfil: this.perfil,
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

  // En tu componente
  formatCuil() {
    let rawValue = this.cuil.value.replace(/\D/g, ''); // Elimina todo excepto los números
    if (rawValue.length > 2) {
      rawValue = rawValue.slice(0, 2) + '-' + rawValue.slice(2);
    }
    if (rawValue.length > 11) {
      rawValue = rawValue.slice(0, 11) + '-' + rawValue.slice(11, 12);
    }
    this.cuil.setValue(rawValue, { emitEvent: false });
  }

  formUsuario(formValues: any) {
    console.log('formValues', formValues);
    this.usuario.nombre = formValues.nombre.trim();
    this.usuario.apellido = formValues.apellido.trim();
    this.usuario.email = formValues.email;
    this.usuario.perfil = formValues.perfil;
    this.usuario.password = formValues.password;
    this.usuario.dni = formValues.dni;
    this.usuario.cuil = formValues.cuil;
  }

  async onRegister(formValues: any) {
    if (this.registerForm.valid && this.usuario.foto) {
      this.formUsuario(formValues);
      try {
        await this.usuarioSrv.saveUserWithEmailAndPassword(this.usuario);
        this.toastService.showExito('Usuario Registrado');
        this.router.navigate(['/home']);
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
        'Debe completar todos los campos y tomar una foto de perfil'
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
