import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { PushMailNotificationService } from './push-mail-notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private auth: Auth,
    private toastService: ToastService,
    private router: Router,
    private notificationService: PushMailNotificationService
  ) {}

  async login(email: string, password: string): Promise<any> {
    try {
      const res = await signInWithEmailAndPassword(this.auth, email, password);
      return res;
    } catch (error: any) {
      const errorMessage = this.toastService.translateFirebaseError(error.code);
      this.toastService.showError(errorMessage);
    }
  }

  async register(email: string, password: string): Promise<any> {
    try {
      const res = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return res;
    } catch (error: any) {
      const errorMessage = this.toastService.translateFirebaseError(error.code);
      this.toastService.showError(errorMessage);
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  async logOut(): Promise<void> {
    try {
      await this.notificationService.deleteToken();
      await signOut(this.auth);
      //this.appComponent.playCloseSound();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
