import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonHeader, IonToolbar, IonButtons, IonTitle, IonContent, IonButton, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import {
  starOutline, } from 'ionicons/icons';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-modal-propina',
  templateUrl: './modal-propina.component.html',
  styleUrls: ['./modal-propina.component.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonContent, IonTitle, IonButtons, IonToolbar, IonHeader, CommonModule],
})
export class ModalPropinaComponent {
  estrellas = [1, 2, 3, 4, 5];
  satisfaccionSeleccionada = 0;
  textoSatisfaccion = '';

  constructor(private modalController: ModalController) {
    addIcons({starOutline});
  }

  cerrarModal() {
    this.modalController.dismiss({ propinaPorcentaje: this.getPorcentaje() });
  }

  seleccionarSatisfaccion(valor: number) {
    this.satisfaccionSeleccionada = valor;
    this.textoSatisfaccion = this.getTexto(valor);
  }

  getTexto(valor: number): string {
    switch (valor) {
      case 5:
        return 'Excelente (Propina 20%)';
      case 4:
        return 'Muy Bueno (Propina 15%)';
      case 3:
        return 'Bueno (Propina 10%)';
      case 2:
        return 'Regular (Propina 5%)';
      case 1:
        return 'Malo (Propina 0%)';
      default:
        return '';
    }
  }

  getPorcentaje(): number {
    switch (this.satisfaccionSeleccionada) {
      case 5:
        return 20;
      case 4:
        return 15;
      case 3:
        return 10;
      case 2:
        return 5;
      case 1:
        return 0;
      default:
        return 0;
    }
  }
}
