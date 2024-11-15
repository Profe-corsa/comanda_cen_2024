import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Consulta } from '../../clases/consulta';
import {
  IonContent,
  IonList,
  IonItem,
  IonFooter,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonLabel,
  IonHeader,
  IonInput,
  IonToolbar,
  IonBadge,
  IonIcon,
  IonAvatar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { addIcons } from 'ionicons';
import { sendOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonBackButton,
    IonButtons,
    IonTitle,
    IonAvatar,
    IonToolbar,
    IonInput,
    IonHeader,
    IonFooter,
    IonItem,
    IonList,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonLabel,
    IonBadge,
    IonIcon,
    FormsModule,
    NgClass,
  ],
})
export class ChatComponent {
  @Input() mensajes: Consulta[] = [];
  @Input() usuario: any; // Reemplaza `any` con el tipo correspondiente
  @Output() enviarMensaje = new EventEmitter<string>();
  mensaje: string = '';

  constructor() {
    addIcons({
      sendOutline,
    });
  }

  enviar() {
    if (this.mensaje.trim()) {
      this.enviarMensaje.emit(this.mensaje.trim());
      this.mensaje = '';
    }
  }
}
