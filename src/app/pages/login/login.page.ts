import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
// import {
//   IonContent,
//   IonHeader,
//   IonTitle,
//   IonToolbar,
//   IonFabButton,
//   IonText,
//   IonButton,
//   IonCard,
//   IonIcon,
//   IonFab,
//   IonFabList,
// } from '@ionic/angular/standalone';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import {
  chevronDownCircle,
  chevronForwardCircle,
  chevronUpCircle,
  colorPalette,
  document,
  globe,
  mailOutline,
  lockClosedOutline,
  ellipsisHorizontal,
  personCircleOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class LoginPage {
  loginForm: FormGroup;
  showPassword = false;
  showUserOptions = false; // Para mostrar u ocultar los botones de usuario

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
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
      chevronDownCircle,
      chevronForwardCircle,
      chevronUpCircle,
      colorPalette,
      document,
      globe,
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
      { email: 'prueba@test1.com', password: '1234567' },
      { email: 'prueba@test.com', password: '123456' },
      { email: 'prueba@test2.com', password: '123456' },
      { email: 'user3@example.com', password: 'password3' },
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
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        this.authService.login(email, password).then((res: any) => {
          if (res) {
            this.loginForm.patchValue({
              email: '',
              password: '',
            });
            this.router.navigate(['/home']);
          }
        });
      } catch (error: any) {
        console.error(error);
      }
    } else {
      console.error('Formulario inválido');
    }
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }
}
