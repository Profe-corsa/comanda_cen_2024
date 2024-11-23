import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingComponent } from 'src/app/componentes/loading/loading.component';
import { PushMailNotificationService } from 'src/app/services/push-mail-notification.service';
import { ToastService } from 'src/app/services/toast.service';
import { Usuario } from 'src/app/clases/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { Pedido, Estado } from 'src/app/clases/pedido';

@Component({
  selector: 'app-cocinero-bartender-pedido',
  templateUrl: './cocinero-bartender-pedido.component.html',
  styleUrls: ['./cocinero-bartender-pedido.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LoadingComponent],
})
export class CocineroBartenderPedidoComponent implements OnInit {
  usuario: Usuario | null;
  listaPedidos: Pedido[] = [];

  constructor(
    public loadingService: LoadingService,
    private toast: ToastService,
    private pushNotification: PushMailNotificationService,
    private authSrv: AuthService,
    private dataService: DataService
  ) {
    //Obtenemos al usuario logueado con el servicio.
    this.usuario = this.authSrv.getUserLogueado();
  }

  ngOnInit() {
    this.listaPedidos = [];
    console.log(this.usuario);
    const listado = 'pedidos'; // Cambiar según la colección deseada

    this.dataService.suscribirseAColeccion(listado);
    this.dataService.getObservableDeColeccion(listado).subscribe((datos) => {
      this.listaPedidos = datos
        .filter((pedido) => pedido.estado === Estado.enPreparacion) // Filtrar solo pedidos en preparación
        .map((pedido) => ({
          ...pedido,
          productos: pedido.productos.filter((producto: any) => {
            console.log('Filtrando producto:', producto);
            const esProductoValido = this.filtrarPorPerfil(producto);
            console.log('Es producto válido:', esProductoValido);
            const estaEnPreparacion = producto.estado === Estado.enPreparacion;
            console.log('Está en preparación:', estaEnPreparacion);
            return esProductoValido && estaEnPreparacion;
          }),
        }))
        .filter((pedido: any) => pedido.productos.length > 0); // Solo pedidos con productos visibles
      console.log(this.listaPedidos);
    });
  }

  private filtrarPorPerfil(producto: any): boolean {
    if (!this.usuario) return false;

    // Ajustar según la estructura del perfil del usuario
    switch (this.usuario.perfil) {
      case 'cocinero':
        return producto.tipo === 'Comida' || producto.tipo === 'Postre';
      case 'bartender':
        return producto.tipo === 'Bebida';
      default:
        return false;
    }
  }

  async finalizarProductos(pedido: Pedido): Promise<void> {
    try {
      // Mostrar el loading
      this.loadingService.showLoading();

      // Obtener el pedido actualizado desde la base de datos
      const pedidoActualizado =
        await this.dataService.obtenerDocumentoPorId<Pedido>(
          'pedidos',
          pedido.id
        );
      console.log(pedidoActualizado);
      if (!pedidoActualizado) {
        this.toast.showError(
          'No se encontró el pedido en la base de datos.',
          'bottom'
        );
        return;
      }

      // Cambiar el estado de los productos del perfil del usuario
      pedidoActualizado.productos.forEach((producto: any) => {
        if (this.filtrarPorPerfil(producto)) {
          producto.estado = Estado.finalizado;
        }
      });
      console.log('momento 2', pedidoActualizado);
      // Verificar si todos los productos del pedido están finalizados
      const todosFinalizados = pedidoActualizado.productos.every(
        (producto) => producto.estado === Estado.finalizado
      );

      // Cambiar el estado del pedido si todos los productos están finalizados
      if (todosFinalizados) {
        pedidoActualizado.estado = Estado.finalizado;
      }

      // Actualizar el pedido en la base de datos
      await this.dataService
        .updateCollectionObject(
          'pedidos',
          pedidoActualizado.id,
          pedidoActualizado
        )
        .then(() => {
          if (todosFinalizados) {
            if (this.usuario) {
              this.pushNotification.sendPushNotificationToRole(
                'Pedido finalizado',
                'El pedido de la mesa: ' +
                  pedidoActualizado.id +
                  ' ha sido finalizado y está listo para su entrega.',
                'mozo'
              );
            }
          }
          this.toast.showExito('¡Pedido finalizado!', 'bottom');
        })
        .catch((error) => {
          this.toast.showError(
            'Se produjo un error al actualizar el pedido. El motivo: ' + error,
            'bottom',
            5000
          );
        });
    } catch (error) {
      this.toast.showError(
        'Ocurrió un error al finalizar los productos: ' + error,
        'bottom',
        5000
      );
    } finally {
      // Ocultar el loading
      this.loadingService.hideLoading();
    }
  }
}
