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
  gameControllerOutline,
  bookOutline,
  calendarOutline,
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
import { Estado, Pedido } from 'src/app/clases/pedido';
import { Cliente } from 'src/app/clases/cliente';
import { EstadoReserva, Reserva } from 'src/app/clases/Reserva';
//import { EncuestaClienteComponent } from '../encuesta-cliente/encuesta-cliente.component';

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
    //EncuestaClienteComponent
  ],
})
export class ClienteHomeComponent implements OnInit {
  @Input() usuario: Usuario | any;
  pedido: Pedido | any = [];
  mostrarPedido: boolean = false;
  mostrarEstado: boolean = false;
  mostrarJuegos: boolean = false;
  mostrarEncuesta: boolean = false;
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
      bookOutline,
      fastFoodOutline,
      gameControllerOutline,
      calendarOutline,
      bagOutline,
      addCircleOutline,
      man,
    });
  }

  async ngOnInit() {
    //Instancia del cliente
    this.cliente = <Cliente>this.usuario;

    console.log('Cliente en home comp', this.cliente);

    console.log('el usuario en home:', this.usuario);
    if (this.cliente.pedido) {
      this.mostrarPedido = true;
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
        if (this.cliente.pedido) {
          if (this.mostrarPedido) {
            if (this.mostrarEstado) {
              this.mostrarJuegos = true;
              this.toast.showExito('si llega a mostrar los juegos');
            } else {
              this.mostrarEstado = true;
            }
          } else {
            this.mostrarPedido = true;
          }
          this.actualizarPedido();
        } else {
          const numeroMesa = response.split(' ')[1];
          this.unirseAMesa(numeroMesa);
        }
      } else {
        this.toast.showError('Tuvimos un error al leer el QR');
      }
    });
  }
  async actualizarPedido() {
    this.pedido = await this.usuarioSrv.getIfExists(
      'pedidos',
      this.usuario.id,
      new Date()
    );
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

      console.log('mesa asignada', mesaAsignada);

      if (mesaAsignada !== undefined) {
        console.log('entro a mesa asignada');
        // Verificar si la mesa encontrada es diferente a la escaneada
        if (mesaAsignada.numero != parseInt(numeroMesa)) {
          this.loadingService.hideLoading();
          this.toast.showError(
            'Esta no es la mesa que se le asignó. Debe escanear el QR de la mesa ' +
              mesaAsignada.numero
          );
          return;
        }

        // Si se encontró la mesa asignada en la lista de espera y es la correcta
        if (
          mesaAsignada &&
          mesaAsignada.numero === parseInt(numeroMesa) &&
          this.usuario.mesaAsignada === '' &&
          mesaAsignada?.estado === 'Disponible' &&
          this.usuario.estado === Estados.puedeTomarMesa
        ) {
          // Actualizar los campos del usuario (por ejemplo: estado y numeroMesa)
          await this.usuarioSrv.updateUserFields(idCliente, {
            estado: Estados.mesaTomada,
            mesaAsignada: numeroMesa,
          });

          await this.dataService.updateObjectFields('mesas', mesaAsignada.id, {
            estado: 'Ocupada',
            idClienteAsignado: idCliente,
          });
          this.loadingService.hideLoading();
          this.toast.showExito('Te has unido a la mesa ' + numeroMesa);
        }
        //Agregar opciones para seguir trabajando con el cliente
        else {
          this.loadingService.hideLoading();
          this.toast.showError(
            'No se encontró ninguna mesa asignada al cliente o la mesa está ocupada.',
            'middle',
            5000
          );
        }
      } else {
        console.log('entro a la reserva');
        // Buscar la mesa que tiene el idClienteAsignado
        const mesaReservada = mesas.find(
          (mesa) => mesa.id === this.cliente.reserva.mesa.id
        );

        console.log('mesa reservada:', mesaReservada);
        //El cliente tiene una reserva
        if (
          this.cliente.reserva &&
          this.cliente.reserva.mesa.numero === parseInt(numeroMesa) &&
          mesaReservada?.estado === 'Disponible' &&
          this.usuario.estado === Estados.puedeTomarMesa
        ) {
          console.log('entro a la reserva 2');
          //El cliente toma la mesa
          await this.usuarioSrv.updateUserFields(idCliente, {
            estado: Estados.mesaTomada,
          });

          console.log('cliente mesa ID:', this.cliente.reserva.mesa.id);
          // Cambia el estado de la mesa a ocupada
          await this.dataService.updateObjectFields(
            'mesas',
            this.cliente.reserva.mesa.id,
            {
              estado: 'Ocupada',
              idClienteAsignado: idCliente,
            }
          );

          console.log('cliente mesa ID:', this.cliente.reserva.mesa.id);
          // Eliminar la reserva del array de reservas en la mesa
          await this.dataService.deleteArrayElement<Reserva>(
            'mesas',
            this.cliente.reserva.mesa.id,
            'reservas',
            (r) => r.id === this.cliente.reserva.id
          );

          //Finaliza la reserva
          await this.dataService.updateObjectFields(
            'reservas',
            this.cliente.reserva.id,
            {
              estado: EstadoReserva.finalizada,
            }
          );

          // Eliminar la reserva a nivel del cliente
          // Se realiza al final para poder tener las referencias de la reserva.
          await this.dataService.deleteObjectField(
            'usuarios',
            idCliente,
            'reserva'
          );

          this.loadingService.hideLoading();
          this.toast.showExito(
            'Te has unido a la mesa ' + numeroMesa + ' que habías reservado.',
            'middle',
            5000
          );
        } else {
          this.loadingService.hideLoading();
          this.toast.showError(
            'No se encontró ninguna mesa reservada al cliente o la mesa está ocupada.',
            'middle',
            5000
          );
        }
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
          //Por el momento el cambio de estado del cliente queda suspendido.
          // this.cliente.estado = Estados.atendido;
          this.cliente.pedido.estado = Estado.recibido;

          console.log('cliente en cliente home', this.cliente);

          //Actualizar el pedido en el cliente y en la lista pedidos
          await this.dataService.updateCollectionObject(
            'usuarios',
            this.cliente.id,
            this.cliente
          );

          await this.dataService.updateObjectField(
            'pedidos',
            this.cliente.pedido.id,
            'estado',
            this.cliente.pedido.estado
          );
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
