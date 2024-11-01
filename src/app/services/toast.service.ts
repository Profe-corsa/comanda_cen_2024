import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showError(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000, // Duración del toast
      position: 'top', // Posición del toast
      color: 'danger', // Color del toast
    });
    await toast.present();
  }

  translateFirebaseError(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'La dirección de correo electrónico ya está en uso por otra cuenta.';
      case 'auth/invalid-email':
        return 'La dirección de correo electrónico no es válida.';
      case 'auth/user-not-found':
        return 'No se encontró una cuenta con este correo electrónico.';
      case 'auth/wrong-password':
        return 'La contraseña es incorrecta.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil.';
      default:
        return 'Se ha producido un error. Inténtalo de nuevo más tarde.';
    }
  }
}
