import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonInput,
  IonToolbar,
  IonFabButton,
  IonText,
  IonButton,
  IonCard,
  IonIcon,
  IonFab,
  IonFabList,
  IonRouterLink,
  IonSpinner,
} from '@ionic/angular/standalone';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  lockClosedOutline,
  mailOutline,
  ellipsisHorizontal,
  personCircleOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { Perfiles } from 'src/app/clases/enumerados/perfiles';
import { Estados } from 'src/app/clases/enumerados/Estados';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingComponent } from 'src/app/componentes/loading/loading.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    ReactiveFormsModule,
    CommonModule,
    IonRouterLink,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonFabButton,
    IonText,
    IonButton,
    IonCard,
    IonIcon,
    IonFab,
    IonFabList,
    IonInput,
    LoadingComponent,
  ],
})
export class LoginPage {
  loginForm: FormGroup;
  suscripcion: Subscription | any;
  showPassword = false;
  showUserOptions = false; // Para mostrar u ocultar los botones de usuario

  constructor(
    private router: Router,
    private authService: AuthService,
    private userSrv: UsuarioService,
    private fb: FormBuilder,
    private toast: ToastService,
    public loadingService: LoadingService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    addIcons({
      mailOutline,
      lockClosedOutline,
      ellipsisHorizontal,
      personCircleOutline,
      eyeOutline,
      eyeOffOutline,
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleUserOptions() {
    this.showUserOptions = !this.showUserOptions; // Mostrar u ocultar botones de usuario
  }

  // Método para rellenar los campos con datos predefinidos
  fillFormWithUser(userIndex: number) {
    const users = [
      { email: 'duenio@comandacen.com', password: '123456' },
      { email: 'metre@gmail.com', password: '123456' },
      { email: 'prueba@test2.com', password: '123456' },
      { email: 'nmiguenz@gmail.com', password: '123456' },
    ];

    const selectedUser = users[userIndex - 1];
    if (selectedUser) {
      this.loginForm.patchValue({
        email: selectedUser.email,
        password: selectedUser.password,
      });
    }
    this.showUserOptions = false; // Ocultar los botones después de seleccionar
    // this.toggleUserOptions();
  }

  async onlogin() {
    let res: any;

    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      // Mostrar el loading antes de la petición
      this.loadingService.showLoading();
      try {
        res = await this.authService.login(email, password);
        console.log(res);

        this.suscripcion = this.userSrv
          .getUser(res.user.uid)
          .subscribe((usuario: any) => {
            if (usuario != undefined) {
              if (
                usuario.perfil == Perfiles.cliente &&
                usuario.estado == Estados.pendienteDeAprobacion
              ) {
                this.loadingService.hideLoading();
                this.toast.showError(
                  'Lo sentimos, pero su cuenta aún se encuentra Pendiente de aprobación.'
                );
                this.limpiarInputs();
              } else if (
                usuario.perfil == Perfiles.cliente &&
                usuario.estado == Estados.rechazado
              ) {
                this.limpiarInputs();
                this.loadingService.hideLoading();
                this.toast.showError(
                  'Lo sentimos, pero su cuenta fue rechazada.'
                );
              } else {
                console.log('Login correcto');
                this.limpiarInputs();
                this.suscripcion.unsubscribe();
                this.loadingService.hideLoading();
                this.router.navigate(['/home']);
              }
            }
          });
      } catch (error: any) {
        this.loadingService.hideLoading();
        this.toast.showError('Falló el ingreso: ' + error.message);
      }
    } else {
      //Este es un error para nosotros. Todos los errores de autenticación son informados por Firebase.
      console.error('Formulario inválido');
    }
  }

  irARegistro(tipoCliente: string) {
    this.router.navigate([`/registro/${tipoCliente}`]);
  }

  limpiarInputs() {
    this.loginForm.reset();
  }
}
