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
import { UsuarioService } from 'src/app/services/usuario.service';
import { Cliente } from 'src/app/clases/cliente';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { Estados } from 'src/app/clases/enumerados/Estados';
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
    private toast: ToastService,
    private usurioService: UsuarioService,
    private firestore: Firestore
  ) {}

  ngOnInit() {
    const listado = 'pedidos'; // Cambiar según la colección deseada

    this.dataService.suscribirseAColeccion(listado);
    this.dataService.getObservableDeColeccion(listado).subscribe((datos) => {
      console.log(`Datos actualizados en la colección ${listado}:`, datos);
      this.listaPedidos = datos;
      this.listaPedidos.sort(this.ordernarHorario);
    });
  }

  ordernarHorario(a: any, b: any) {
    if (!a.hora && !b.hora) return 0; // Ambos no tienen hora, no se altera el orden
    if (!a.hora) return 1; // Si `a` no tiene hora, va al fondo
    if (!b.hora) return -1; // Si `b` no tiene hora, `a` va antes

    if (a.horaPedido > b.horaPedido) return -1;
    if (b.horaPedido > a.horaPedido) return 1; //Cambio de lugar

    return 0;
  }

  //Metodo que se usará para cambiar el estado de un pedido
  //Acción que realiza el mozo
  cambiarEstadPedido(pedido: Pedido) {
    this.verDetallePedido(pedido, pedido.estado);
  }

  async confirmarCambioEstado(pedido: Pedido) {
    try {
      this.loadingService.showLoading();
      await this.dataService
        .updateCollectionObject('pedidos', pedido.id, pedido)
        .then(() => {
          this.actualizarEstadoPedidoCliente(pedido, pedido.estado);
          if (pedido.estado == Estado.enPreparacion) {
            this.procesarPedidoConNotificacion(pedido);
          }
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

  async finalizarPedido(pedido: Pedido) {
    let mesaId = null;
    const mesas = await this.dataService.getCollectionData('mesas');
    mesas.find((mesa) => {
      if (mesa.numero == pedido.nroMesa) {
        mesaId = mesa.id;
      }
    });
    console.log('mesas', mesas, mesaId);

    try {
      this.loadingService.showLoading();

      //Mesa vuelve a estar disponible
      if (mesaId != null) {
        await this.dataService.updateObjectField(
          'mesas',
          mesaId,
          'estado',
          'Disponible'
        );
        await this.dataService.updateObjectField(
          'mesas',
          mesaId,
          'idClienteAsignado',
          ''
        );
      }

      //El usuario vuelve a su estado inicial y se le quita el pedido que ya pagó
      if (pedido.clienteId != null && pedido.clienteId != undefined) {
        await this.dataService.updateObjectField(
          'usuarios',
          pedido.clienteId,
          'estado',
          Estados.aprobado
        );

        await this.dataService.deleteObjectField(
          'usuarios',
          pedido.clienteId,
          'pedido'
        );
      }

      await this.dataService.updateObjectField(
        'pedidos',
        pedido.id,
        'estado',
        Estados.finalizado
      );

      this.loadingService.hideLoading();
    } catch (error) {
      this.loadingService.hideLoading();
      console.error('Error al finalizar el pedido del pedido:', error);
    }
  }

  async actualizarEstadoPedidoCliente(
    pedido: Pedido,
    nuevoEstado: Estado
  ): Promise<void> {
    try {
      // Buscar el usuario asociado al pedido
      const usuario = await this.usurioService.getUserPromise(pedido.clienteId);
      console.log('obtener usuario en actualizacion', usuario);

      if (usuario) {
        // Verificar que el usuario tiene un pedido asociado
        if (usuario.pedido && usuario.pedido.clienteId === pedido.clienteId) {
          usuario.pedido.estado = nuevoEstado;
          // Guardar cambios en Firestore
          await this.usurioService.updateUser(usuario.id, {
            pedido: usuario.pedido,
          });

          const pedidoRef = doc(this.firestore, `pedidos/${usuario.pedido.id}`);
          // Guardar cambios en Firestore
          await updateDoc(pedidoRef, { estado: `${nuevoEstado}` });
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

  //Metodo que se usara para ver el detalle de un pedido
  async verDetallePedido(pedido: Pedido, estado: string) {
    console.log('estado del pedido', estado);
    try {
      const modal = await this.modalController.create({
        component: PedidoClienteModalComponent,
        componentProps: {
          productos: pedido.productos || [], // Valor por defecto si no existen productos
          estadoPedido: estado,
          pedidoRecibido: pedido,
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
          } else if (estadoSeleccionado == 'entregado') {
            pedido.estado = Estado.entregado;
            this.confirmarCambioEstado(pedido);
          } else if (estadoSeleccionado == 'cuentaEnviada') {
            pedido.estado = Estado.cuentaEnviada;
            this.confirmarCambioEstado(pedido);
          } else if (estadoSeleccionado == 'pagado') {
            pedido.estado = Estado.finalizado;
            this.finalizarPedido(pedido);
          }
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
      case 'entregado':
        return 'entregado';
      default:
        return 'desconocido'; // Clase para estados no definidos
    }
  }
}
