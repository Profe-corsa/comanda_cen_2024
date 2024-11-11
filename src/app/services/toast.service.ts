import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  async showError(message: string, position?: 'top' | 'bottom' | 'middle') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Duración del toast
      position: position ?? 'top', // Posición del toast
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

    Haptics.vibrate({ duration: 500 });
    
    await toast.present();
  }

  async showExito(message: string, position?: 'top' | 'bottom' | 'middle') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000, // Duración del toast
      position: position ?? 'top', // Posición del toast
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

  //Este revisarlo para otras ocasiones
  async showDecisionToast(
    message: string,
    onAccept: () => void,
    onReject: () => void
  ) {
    const toast = await this.toastController.create({
      header: message,
      icon: '../../../assets/icon/logo_Uno.png',
      position: 'middle',
      color: 'tertiary',
      buttons: [
        {
          icon: 'checkmark',
          text: 'Aceptar',
          handler: onAccept,
        },
        {
          icon: 'close',
          text: 'Rechazar',
          handler: onReject,
        },
      ],
    });
    // const image = this.createImage(
    //   'assets/icon/logo_Uno.png',
    //   'Profile logo',
    //   '50',
    //   '50'
    // );
    // toast.shadowRoot?.querySelector('.toast-container')?.appendChild(image);

    await toast.present();
  }
}
