import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import {
  IonButton,
  IonFooter,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonToolbar,
  IonThumbnail,
  IonLabel,
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { Mesa } from 'src/app/clases/mesa';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-mesa-detalle-modal',
  templateUrl: './mesa-detalle-modal.component.html',
  styleUrls: ['./mesa-detalle-modal.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonTitle,
    IonLabel,
    IonFooter,
    IonButton,
    CommonModule,
    IonButtons,
    IonContent,
    IonList,
    IonItem,
    IonToolbar,
    IonThumbnail,
  ],
})
export class MesaDetalleModalComponent {
  @Input() mesa: Mesa | undefined;

  constructor(private modalController: ModalController) {}

  // Método para cerrar el modal
  close() {
    this.modalController.dismiss({
      mesa: this.mesa,
    });
  }
}
