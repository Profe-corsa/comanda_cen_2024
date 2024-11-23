import { Component, OnInit } from '@angular/core';
import { Estado, Pedido } from 'src/app/clases/pedido';
import { DataService } from 'src/app/services/data.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { PedidoClienteModalComponent } from '../pedido-cliente-modal/pedido-cliente-modal.component';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingComponent } from 'src/app/componentes/loading/loading.component';
import { PushMailNotificationService } from 'src/app/services/push-mail-notification.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-mozo-lista-pedidos',
  templateUrl: './mozo-lista-pedidos.component.html',
  styleUrls: ['./mozo-lista-pedidos.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, LoadingComponent],
})
export class MozoListaPedidosComponent implements OnInit {
  listaPedidos: Pedido[] = [];

  constructor(
    private dataService: DataService,
    private modalController: ModalController,
    public loadingService: LoadingService,
    private notificationService: PushMailNotificationService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const listado = 'pedidos'; // Cambiar según la colección deseada

    this.dataService.suscribirseAColeccion(listado);
    this.dataService.getObservableDeColeccion(listado).subscribe((datos) => {
      console.log(`Datos actualizados en la colección ${listado}:`, datos);
      this.listaPedidos = datos;
    });
  }

  //Metodo que se usará para cambiar el estado de un pedido
  //Acción que realiza el mozo
  cambiarEstadPedido(pedido: Pedido) {
    // if (pedido.estado == Estado.pendiente) {
    //   this.verDetallePedido(pedido);
    // } else if (pedido.estado == Estado.finalizado) {
    //   //Accion  para entregarle al cliente
    // }
    this.verDetallePedido(pedido, pedido.estado);
  }

  async confirmarCambioEstado(pedido: Pedido) {
    try {
      this.loadingService.showLoading();
      await this.dataService
        .updateCollectionObject('pedidos', pedido.id, pedido)
        .then(() => {
          this.procesarPedidoConNotificacion(pedido);
        })
        .catch((error) => {
          this.toast.showError(
            'Se produjo un error al actualizar el pedido. El motivo: ' + error
          );
        });
      this.loadingService.hideLoading();
    } catch (error) {
      this.loadingService.hideLoading();
      console.error('Error al actualizar el estado del pedido:', error);
    }
  }

  //Metodo que se usara para ver el detalle de un pedido
  async verDetallePedido(pedido: Pedido, estado: string) {
    try {
      const modal = await this.modalController.create({
        component: PedidoClienteModalComponent,
        componentProps: {
          productos: pedido.productos || [], // Valor por defecto si no existen productos
          estadPedido: estado,
        },
      });

      // Maneja el cierre del modal
      modal.onDidDismiss().then(async (result: { data?: string }) => {
        const estadoSeleccionado = result.data; // Recibimos el estado devuelto al cerrar el modal
        if (estadoSeleccionado) {
          console.log(
            `Estado seleccionado para el pedido: ${estadoSeleccionado}`
          );

          // Actualiza el estado del pedido en la base de datos
          if (estadoSeleccionado == 'aceptado') {
            pedido.estado = Estado.enPreparacion;
            this.confirmarCambioEstado(pedido);
          } else if (estadoSeleccionado == 'rechazado')
            pedido.estado = Estado.pendiente;
        }
      });

      // Muestra el modal
      return await modal.present();
    } catch (error) {
      console.error('Error al mostrar el detalle del pedido:', error);
    }
  }

  //Metodo que se usara para enviar notificaciones
  procesarPedidoConNotificacion(pedido: any): void {
    // Agrupar los productos por tipo
    const productosPorTipo = new Map<string, any[]>();

    pedido.productos.forEach((producto: any) => {
      const tipo = producto.tipo;
      if (!productosPorTipo.has(tipo)) {
        productosPorTipo.set(tipo, []);
      }
      productosPorTipo.get(tipo)?.push(producto);
    });

    // Variables para controlar las notificaciones
    let tieneBebidas = false;
    let tieneComidas = false;

    // Revisar los grupos para determinar las acciones
    productosPorTipo.forEach((productos, tipo) => {
      switch (tipo) {
        case 'Bebida':
          tieneBebidas = true;
          break;
        case 'Comida':
        case 'Postre':
          tieneComidas = true;
          break;
        default:
          console.warn(`Tipo ignorado: ${tipo}`);
      }
    });

    // Enviar notificaciones según los grupos identificados
    if (tieneBebidas) {
      this.notificationService.sendPushNotificationToRole(
        'Recibió un nuevo pedido',
        'Se ha realizado un pedido de bebidas',
        'bartender'
      );
    }

    if (tieneComidas) {
      this.notificationService.sendPushNotificationToRole(
        'Recibió un nuevo pedido',
        'Se ha realizado un pedido de bebidas',
        'cocinero'
      );
    }

    if (!tieneBebidas && !tieneComidas) {
      console.log(
        'El pedido no contiene bebidas ni comidas. No se envía notificación.'
      );
    }
  }

  getStatusClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'pendiente';
      case 'en preparación':
        return 'preparando';
      case 'finalizado':
        return 'finalizado';
      default:
        return 'desconocido'; // Clase para estados no definidos
    }
  }
}
