import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PushMailNotificationService {
  private apiUrl = 'https://notification-service-9dq5.onrender.com';
  // 'https://notificationservice-production-90d2.up.railway.app';
  // 'http://localhost:4000';

  constructor(private http: HttpClient) {}

  sendPushNotification(title: string, body: string, token: string) {
    return this.http.post(`${this.apiUrl}/send-push`, { title, body, token });
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
}
