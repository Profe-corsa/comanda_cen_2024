import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonIcon,
  IonRouterLink,
  IonRow,
  IonCol,
  IonGrid,
} from '@ionic/angular/standalone';
// import { RouterLink } from '@angular/router';
import { Usuario } from 'src/app/clases/usuario';
import { addIcons } from 'ionicons';
import {
  restaurantOutline,
  man,
  list,
  addCircleOutline,
  chatbubblesOutline,
  qrCodeOutline,
  bagOutline,
  fastFoodOutline,
} from 'ionicons/icons';

import { QrScannerService } from '../../services/qrscanner.service';
import { ToastService } from '../../services/toast.service';
import { Objetos } from '../../clases/enumerados/Objetos';
import { UsuarioService } from '../../services/usuario.service';
import { Estados } from '../../clases/enumerados/Estados';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingComponent } from 'src/app/componentes/loading/loading.component';
import { PushMailNotificationService } from 'src/app/services/push-mail-notification.service';
import { Perfiles } from 'src/app/clases/enumerados/perfiles';
import { EstadoPedidosComponent } from '../estado-pedidos/estado-pedidos.component';
import { Estado, Pedido } from 'src/app/clases/pedido';
import { Cliente } from 'src/app/clases/cliente';

@Component({
  selector: 'app-cliente-home',
  templateUrl: './cliente-home.component.html',
  styleUrls: ['./cliente-home.component.scss'],
  standalone: true,
  imports: [
    IonGrid,
    IonCard,
    IonIcon,
    IonRow,
    IonCol,
    CommonModule,
    RouterLink,
    LoadingComponent,
  ],
})
export class ClienteHomeComponent implements OnInit {
  @Input() usuario: Usuario | any;
  pedido: Pedido | any = [];
  mostrarPedido: boolean = false;
  mostrarPrecio: boolean = false;
  cliente: Cliente | any;
  constructor(
    private qrService: QrScannerService,
    private toast: ToastService,
    private usuarioSrv: UsuarioService,
    private authService: AuthService,
    private dataService: DataService,
    public loadingService: LoadingService,
    private router: Router,
    private notificationService: PushMailNotificationService
  ) {
    addIcons({
      list,
      qrCodeOutline,
      chatbubblesOutline,
      restaurantOutline,
      fastFoodOutline,
      bagOutline,
      addCircleOutline,
      man,
    });
  }

  async ngOnInit() {
    //Instancia del cliente
    this.cliente = <Cliente>this.usuario;

    console.log('el usuario en home:', this.usuario);
    this.pedido = await this.usuarioSrv.getIfExists(
      'pedidos',
      this.usuario.id,
      new Date()
    );
    if (this.pedido) {
      this.mostrarPrecio = true;
    }
  }

  leerQR() {
    this.qrService.scanCode().then((response) => {
      console.log(response);
      if (response == Objetos.listaDeEspera) {
        this.agregarAListaEspera();
      }
      // Verificar si el QR es de una mesa (formato "Mesa 1", "Mesa 2", etc.)
      else if (response.startsWith('Mesa ')) {
        const numeroMesa = response.split(' ')[1]; // Extraer el número de mesa
        this.unirseAMesa(numeroMesa);
        if (this.pedido) {
          this.mostrarPedido = true;
        }
      } else {
        this.toast.showError('Tuvimos un error al leer el QR');
      }
    });
  }

  async agregarAListaEspera() {
    try {
      this.loadingService.showLoading();

      const usuarioEspera = {
        id: this.usuario.id,
        nombre:
          this.usuario.nombre.trim() +
          (this.usuario.apellido ? ' ' + this.usuario.apellido.trim() : ''),
        fecha: Date.now(),
      };

      // Guarda el usuario en la lista de espera
      await this.usuarioSrv.setDocument(
        'listaDeEspera',
        this.usuario.id,
        usuarioEspera
      );

      // Actualiza el estado del usuario a "en espera"
      await this.usuarioSrv.updateUserField(
        this.usuario.id,
        'estado',
        Estados.enEspera
      );

      this.notificationService.sendPushNotificationToRole(
        'Nuevo cliente en espera',
        `${this.usuario.nombre} ${this.usuario.apellido} se unio a la lista y espera una respuesta.`,
        Perfiles.metre
      );

      this.loadingService.hideLoading();
      // Muestra el mensaje de éxito
      this.toast.showExito(
        'Fue anotado en la lista de espera. A la brevedad el maître le asignará una mesa.'
      );
    } catch (error) {
      this.loadingService.hideLoading();
      console.error('Error al agregar a lista de espera:', error);
      this.toast.showError('Hubo un error al agregar a la lista de espera.');
    }
  }

  async unirseAMesa(numeroMesa: string) {
    try {
      this.loadingService.showLoading();
      const idCliente = this.usuario.id;
      const mesas = await this.dataService.obtenerMesas();

      // Buscar la mesa que tiene el idClienteAsignado
      const mesaAsignada = mesas.find(
        (mesa) => mesa.idClienteAsignado === idCliente
      );

      // Verificar si la mesa encontrada es diferente a la escaneada
      if (mesaAsignada && mesaAsignada.numero != parseInt(numeroMesa)) {
        this.loadingService.hideLoading();
        this.toast.showError(
          'Esta no es la mesa que se le asignó. Debe escanear el QR de la mesa ' +
            mesaAsignada.numero
        );
        return;
      }

      // Si se encontró la mesa asignada y es la correcta
      if (
        mesaAsignada &&
        mesaAsignada.numero === parseInt(numeroMesa) &&
        this.usuario.mesaAsignada === ''
      ) {
        // Actualizar los campos del usuario (por ejemplo: estado y numeroMesa)
        await this.usuarioSrv.updateUserFields(idCliente, {
          estado: Estados.mesaTomada,
          mesaAsignada: numeroMesa,
        });
        this.loadingService.hideLoading();
        this.toast.showExito('Te has unido a la mesa ' + numeroMesa);
      }
      //Agregar opciones para seguir trabajando con el cliente
      else {
        this.loadingService.hideLoading();
        this.toast.showError(
          'No se encontró ninguna mesa asignada al cliente.'
        );
      }
    } catch (error) {
      this.loadingService.hideLoading();
      this.toast.showError('Hubo un error al unirse a la mesa: ' + error);
    }
  }

  async confirmarRecepcionPedido() {
    // Comprobar que el mozo indicó que el cliente recibió el pedido
    try {
      this.loadingService.showLoading();
      if (this.cliente.pedido != undefined) {
        if (this.cliente.pedido.estado == Estado.entregado) {
          this.cliente.estado = Estados.atendido;
          this.cliente.pedido.estado = Estado.recibido;

          console.log('cliente en cliente home', this.cliente);

          //Actualizar el pedido en el cliente y en la lista pedidos
          // await this.dataService.updateCollectionObject(
          //   'usuarios',
          //   this.cliente.id,
          //   this.cliente
          // );

          // await this.dataService.updateObjectField(
          //   'pedidos',
          //   this.cliente.pedido.id,
          //   'estado',
          //   this.cliente.pedido.estado
          // );
        }

        this.toast.showExito('El pedido ha sido recibido', 'bottom');
      }
      this.loadingService.hideLoading();
    } catch (error) {
      this.loadingService.hideLoading();
      this.toast.showError(
        'Hubo un error al confirmar la recepción del pedido ' + error,
        'bottom'
      );
    }
  }

  async cerrarSesion() {
    this.loadingService.showLoading();
    await this.authService.logOut();
    this.loadingService.hideLoading();
  }
}
