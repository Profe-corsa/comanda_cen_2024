import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';
import { ToastService } from './toast.service';
import { Usuario } from '../clases/usuario';
import { Capacitor } from '@capacitor/core';
import {
  Firestore,
  collection,
  doc,
  updateDoc,
  CollectionReference,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class PushMailNotificationService {
  private usuariosCollection;
  user: Usuario | any = {};
  private enable = false;
  private apiUrl = 'https://notification-service-9dq5.onrender.com';
  // 'https://notificationservice-production-90d2.up.railway.app';
  // 'http://localhost:4000';

  constructor(
    private http: HttpClient,
    private toast: ToastService,
    private firestore: Firestore
  ) {
    this.usuariosCollection = collection(
      this.firestore,
      'usuarios'
    ) as CollectionReference;
  }

  init(user: Usuario) {
    this.user = user;
    if (Capacitor.isNativePlatform()) {
      console.log('Inicializando Push Notification Service');

      // Request permission to use push notifications
      // iOS will prompt user and return if they granted permission or not
      // Android will just grant without prompting
      PushNotifications.requestPermissions().then((result) => {
        if (result.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          PushNotifications.register();
        } else {
          this.toast.showError('Permisos de notificaciones denegados');
        }
      });
      this.addListeners();
    }
  }

  addListeners() {
    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', (token: Token) => {
      // alert('Push registration success, token: ' + token.value);

      this.updateUserField(this.user.id, 'token', token.value);
      this.enable = true;
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error: any) => {
      this.toast.showError('Error en registro: ' + error);
      alert('Error on registration: ' + JSON.stringify(error));
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        this.toast.showNotificacion(
          notification.body,
          'middle',
          5000,
          notification.title
        );
      }
    );

    // Method called when tapping on a notification
    // Todavía en desuso.
    // PushNotifications.addListener(
    //   'pushNotificationActionPerformed',
    //   (notification: ActionPerformed) => {
    //     alert('Push action performed: ' + JSON.stringify(notification));
    //   }
    // );
  }

  sendPushNotification(title: string, body: string, token: string) {
    return this.http.post(`${this.apiUrl}/notify`, {
      title: title,
      body: body,
      token: token,
    });
  }

  sendPushNotificationToRole(title: string, body: string, role: string) {
    const payload = {
      title: title,
      body: body,
      role: role,
    };

    return this.http
      .post(`${this.apiUrl}/notify-role`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .subscribe({
        next: (response) => console.log('Notificación enviada:', response),
        error: (error) =>
          console.error('Error al enviar la notificación:', error),
      });
  }

  sendEmail(aceptacion: boolean, nombre: string, correo: string) {
    return this.http
      .post(`${this.apiUrl}/send-email`, {
        aceptacion: aceptacion,
        nombreUsuario: nombre,
        mail: correo,
      })
      .subscribe({
        next: (response) => console.log('Respuesta del servidor:', response),
        error: (error) => console.error('Error al enviar el correo:', error),
      });
  }

  async deleteToken() {
    if (this.enable) {
      console.log('Eliminando token');
      await this.updateUserField(this.user.id, 'token', null);
      this.enable = false;
    }
  }

  async updateUserField(
    userId: string,
    fieldName: string,
    fieldValue: any
  ): Promise<void> {
    try {
      const userDocRef = doc(this.usuariosCollection, userId);

      // Crea un objeto con el campo a actualizar
      const updateObject = {
        [fieldName]: fieldValue,
      };

      await updateDoc(userDocRef, updateObject);
      console.log(
        `Campo ${fieldName} del usuario ${userId} actualizado correctamente.`
      );
    } catch (error) {
      console.error(
        `Error al actualizar el campo ${fieldName} del usuario ${userId}:`,
        error
      );
      throw error;
    }
  }
}
