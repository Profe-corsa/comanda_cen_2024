import { Component, Input, OnInit } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonLabel,
  IonNote,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonInput,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Estado, Pedido } from 'src/app/clases/pedido';
import { FormsModule } from '@angular/forms';
import { QrScannerService } from 'src/app/services/qrscanner.service';
import { ModalPropinaComponent } from '../modal-propina/modal-propina.component';
import { ToastService } from 'src/app/services/toast.service';
import { doc, updateDoc, Firestore } from '@angular/fire/firestore';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-modal-pagar-pedido',
  templateUrl: './modal-pagar-pedido.component.html',
  styleUrls: ['./modal-pagar-pedido.component.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonNote,
    IonLabel,
    IonItem,
    IonList,
    IonHeader,
    IonContent,
    IonButton,
    IonInput,
    CommonModule,
    FormsModule,
  ],
})
export class ModalPagarPedidoComponent implements OnInit {
  @Input() pedido: any;
  propina = 0;
  puedePagar: boolean = false;
  montoIngresado: number = 0;
  precioTotal: number = 0;

  constructor(
    private modalController: ModalController,
    private toast: ToastService,
    private qrService: QrScannerService,
    private firestore: Firestore,
    private usuarioSrv: UsuarioService
  ) {}
  ngOnInit() {
    this.precioTotal = this.pedido.precioTotal;
  }
  cerrarModal() {
    this.modalController.dismiss();
  }

  leerQR() {
    this.qrService.scanCode().then((qrData) => {
      if (qrData === 'propina') {
        this.abrirModalPropina();
      } else {
        this.toast.showError('El QR que escaneó no es el de propina');
      }
    });
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
        this.precioTotal =
          this.pedido.precioTotal +
          (this.pedido.precioTotal * this.propina) / 100;
      }
    });

    return await modal.present();
  }

  async pagarPedido() {
    if (this.puedePagar) {
      const propina = (this.pedido.precioTotal * this.propina) / 100;
      const totalConPropina = this.pedido.precioTotal + propina;
      this.toast.showExito(`Pagando un total de: ${totalConPropina}`);

      this.pedido.propina = propina;
      this.pedido.pagado = totalConPropina;

      console.log('pagarPedido', this.pedido);

      await this.actualizarEstadoPedidoCliente(this.pedido, Estado.pagado);
      this.cerrarModal();
    } else {
      this.toast.showError('Por favor, ingrese el monto.');
    }
  }
  async actualizarEstadoPedidoCliente(
    pedido: Pedido,
    nuevoEstado: Estado
  ): Promise<void> {
    try {
      // Buscar el usuario asociado al pedido
      const usuario = this.usuarioSrv.getUser(pedido.clienteId);
      if (usuario) {
        // Verificar que el usuario tiene un pedido asociado
        if (pedido) {
          // Actualizar el estado del pedido
          pedido.estado = nuevoEstado;
          const pedidoRef = doc(this.firestore, `pedidos/${pedido.id}`);
          // Guardar cambios en Firestore
          await this.usuarioSrv.updateUser(pedido.clienteId, {
            pedido: pedido,
          });
          await updateDoc(pedidoRef, {
            estado: `${nuevoEstado}`,
            propina: pedido.propina,
            pagado: pedido.pagado,
          });
          console.log('El estado del pedido se actualizó correctamente.');
        } else {
          console.log(
            'El usuario no tiene un pedido asociado con el clienteId dado.'
          );
        }
      } else {
        console.log('No se encontró el usuario asociado al pedido.');
      }
    } catch (error) {
      console.error(
        'Error al actualizar el estado del pedido en el usuario:',
        error
      );
    }
  }
}
