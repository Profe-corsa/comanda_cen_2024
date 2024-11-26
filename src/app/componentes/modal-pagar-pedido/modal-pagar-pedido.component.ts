import { Component, Input, OnInit } from '@angular/core';
import {IonButton, IonContent, IonHeader, IonList, IonItem, IonLabel, IonNote, IonButtons, IonTitle, IonToolbar, IonInput } from '@ionic/angular/standalone' 
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Estado } from 'src/app/clases/pedido';
import { FormsModule } from '@angular/forms';
import { QrScannerService } from 'src/app/services/qrscanner.service';
import { ModalPropinaComponent } from '../modal-propina/modal-propina.component';
import { ToastService } from 'src/app/services/toast.service';
@Component({
  selector: 'app-modal-pagar-pedido',
  templateUrl: './modal-pagar-pedido.component.html',
  styleUrls: ['./modal-pagar-pedido.component.scss'],
  standalone: true,
  imports: [IonInput, IonToolbar, IonTitle, IonButtons, IonNote, IonLabel, IonItem, IonList, IonHeader, IonContent, IonButton, IonInput, CommonModule, FormsModule]
})
export class ModalPagarPedidoComponent implements OnInit{
  @Input() pedido: any;
  propina = 0;
  puedePagar: boolean = false;
  montoIngresado: number = 0;
  precioTotal: number = 0;

  constructor(
    private modalController: ModalController,
    private toast: ToastService,
    private qrService: QrScannerService
  ) {
  }
  ngOnInit(){
    this.precioTotal= this.pedido.precioTotal;
  }
  cerrarModal() {
    this.modalController.dismiss();
  }

  leerQR() {
    this.abrirModalPropina();
    // this.qrService.scanCode().then((qrData) => {
    //   this.abrirModalPropina();
    // });
  }
  verificarMonto() {
    // Verifica si el monto ingresado es igual al precio total
    this.puedePagar = this.montoIngresado === this.precioTotal;
  }
  async abrirModalPropina() {
    const modal = await this.modalController.create({
      component: ModalPropinaComponent,
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        this.propina = data.data.propinaPorcentaje;
        this.precioTotal = this.pedido.precioTotal+((this.pedido.precioTotal * this.propina)/ 100);
      }
    });

    return await modal.present();
  }

  pagarPedido() {
    if (this.puedePagar){
      const totalConPropina =
        this.pedido.precioTotal + (this.pedido.precioTotal * this.propina) / 100;
      this.toast.showExito(`Pagando un total de: ${totalConPropina}`);
      this.pedido.estado = Estado.pagado;
    }
    else {
      this.toast.showError("Por favor, ingrese el monto.")
    }
  }
}
