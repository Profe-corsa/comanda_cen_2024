import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showError(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Duración del toast
      position: 'top', // Posición del toast
      color: 'danger', // Color del toast
      cssClass: 'custom-toast',
    });
    const image = this.createImage(
      'assets/icon/logo_Uno.png',
      'Profile logo',
      '50',
      '50'
    );
    toast.shadowRoot?.querySelector('.toast-container')?.appendChild(image);

    await toast.present();
  }

  async showExito(message: string) {
    const toast = await this.toastController.create({
      message: `<img src="assets/icon/logo_Uno.png" style="height: 24px; vertical-align: middle; margin-right: 8px;">${message}`,
      duration: 3000, // Duración del toast
      position: 'top', // Posición del toast
      color: 'success', // Color del toast
      cssClass: 'custom-toast',
    });
    const image = this.createImage(
      'assets/icon/logo_Uno.png',
      'Profile logo',
      '50',
      '50'
    );
    toast.shadowRoot?.querySelector('.toast-container')?.appendChild(image);

    await toast.present();
  }

  private createImage(
    src: string,
    alt: string,
    height: string,
    width: string
  ): HTMLImageElement {
    const image = document.createElement('img');
    image.setAttribute('src', src);
    image.setAttribute('height', height);
    image.setAttribute('width', width);
    image.setAttribute('alt', alt);
    image.style.borderRadius = '50%';
    image.style.marginRight = '15px';
    return image;
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
