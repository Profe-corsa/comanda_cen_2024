import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingComponent } from 'src/app/componentes/loading/loading.component';
import { PushMailNotificationService } from 'src/app/services/push-mail-notification.service';
import { ToastService } from 'src/app/services/toast.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Reserva, EstadoReserva } from 'src/app/clases/Reserva';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  trashOutline,
  checkmarkOutline,
} from 'ionicons/icons';
import { Mesa } from 'src/app/clases/mesa';
import { Usuario } from 'src/app/clases/usuario';

@Component({
  selector: 'app-duenio-supervisor-lista-espera',
  templateUrl: './duenio-supervisor-lista-espera.component.html',
  styleUrls: ['./duenio-supervisor-lista-espera.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, LoadingComponent],
})
export class DuenioSupervisorListaEsperaComponent implements OnInit {
  listaReservas: Reserva[] = [];
  usuario: Usuario | any;

  constructor(
    private toast: ToastService,
    public loadingService: LoadingService,
    private dataSrv: DataService,
    private userSrv: UsuarioService,
    private notification: PushMailNotificationService
  ) {
    addIcons({
      checkmarkCircleOutline,
      trashOutline,
      checkmarkOutline,
    });
  }

  ngOnInit() {
    const listado = 'reservas';
    this.dataSrv.suscribirseAColeccion(listado);
    this.dataSrv.getObservableDeColeccion(listado).subscribe((datos) => {
      this.listaReservas = datos;
      this.listaReservas.sort(this.ordernarHorario);
    });
  }

  ordernarHorario(a: any, b: any) {
    console.log('ordenamiento', a, b);
    if (!a.fecha && !b.fecha) return 0; // Ambos no tienen hora, no se altera el orden
    if (!a.fecha) return 1; // Si `a` no tiene hora, va al fondo
    if (!b.fecha) return -1; // Si `b` no tiene hora, `a` va antes

    if (a.fecha > b.fecha) return -1;
    if (b.fecha > a.fecha) return 1; //Cambio de lugar

    return 0;
  }

  async cambiarEstadoReserva(estado: string, reserva: Reserva) {
    if (estado == 'aceptada') {
      console.log('Entro a aceptada');
      reserva.estado = EstadoReserva.confirmada;
      this.confirmarReserva(reserva);
    } else {
      console.log('Entro a rechazada');
      reserva.estado = EstadoReserva.cancelada;
      this.cancelarReserva(reserva);
    }
  }

  async confirmarReserva(reserva: Reserva) {
    if (reserva.id && reserva.mesa?.id) {
      try {
        this.loadingService.showLoading();
        // Actualizar el estado de la reserva en la colección "reservas"
        await this.dataSrv.updateObjectField(
          'reservas',
          reserva.id,
          'estado',
          reserva.estado
        );

        // Obtener la mesa actualizada desde la base de datos
        const mesa = await this.dataSrv.obtenerDocumentoPorId<Mesa>(
          'mesas',
          reserva.mesa.id
        );
        // const mesa = mesaDoc as Mesa;
        console.log('Mesa recuperada', mesa);

        // Verificar si la mesa tiene reservas y actualizar el estado de la reserva específica
        if (mesa?.reservas && Array.isArray(mesa.reservas)) {
          const index = mesa.reservas.findIndex((r) => r.id === reserva.id);
          if (index !== -1) {
            mesa.reservas[index].estado = reserva.estado;

            // Guardar las reservas actualizadas en la mesa
            await this.dataSrv.updateObjectField(
              'mesas',
              reserva.mesa.id,
              'reservas',
              mesa.reservas
            );
          } else {
            console.warn(
              `No se encontró la reserva con ID ${reserva.id} en la mesa ${reserva.mesa.id}`
            );
          }
        } else {
          console.warn(
            `La mesa con ID ${reserva.mesa.id} no tiene reservas registradas.`
          );
        }

        //formateo de fecha
        const fechaFormateada = this.formatearFecha(reserva.fecha);

        //actualizar estado de la reserva en el usuario
        if (reserva.cliente.id) {
          try {
            // Obtén el documento del usuario
            this.usuario = await this.userSrv.getUserPromise(
              reserva.cliente.id
            );

            console.log('Cliente', this.usuario);

            // Verifica que el campo `reserva` exista
            if (!this.usuario.reserva) {
              console.error(
                'El campo reserva no existe en el documento del usuario.'
              );
              this.toast.showError(
                'No se pudo actualizar el estado de la reserva',
                'bottom'
              );
              return;
            }

            await this.userSrv.updateUserField(
              reserva.cliente.id,
              'reserva.estado',
              EstadoReserva.confirmada
            );

            if (this.usuario.token != undefined) {
              this.notification.sendPushNotification(
                'Reserva confirmada',
                `La reserva que realizó para el ${fechaFormateada} fue confirmada. ¡Te esperamos 😍!`,
                this.usuario.token
              );
            }
          } catch (error) {
            console.error(
              'Error al actualizar el estado de la reserva:',
              error
            );
            this.toast.showError(
              'No se pudo actualizar el estado de la reserva',
              'bottom'
            );
          }
        } else {
          this.toast.showError('No se pudo recuperar el usuario', 'bottom');
        }

        //termina con éxito
        this.toast.showExito(
          `Confirmó la reserva de la mesa ${reserva.mesa.numero} para el ${fechaFormateada}`
        );
        console.log(
          `Estado de la reserva ${reserva.id} y la mesa ${reserva.mesa.id} actualizado correctamente.`
        );
        this.loadingService.hideLoading();
      } catch (error) {
        this.loadingService.hideLoading();
        console.error(
          `Error al actualizar el estado de la reserva ${reserva.id} o la mesa ${reserva.mesa.id}:`,
          error
        );
        this.toast.showError(
          'Error al actualizar la reserva. Por favor, intenta nuevamente.',
          'bottom'
        );
      }
    } else {
      this.toast.showError(
        'No se pudo actualizar la reserva porque no se seleccionó una mesa o reserva válida.',
        'bottom'
      );
    }
  }

  async cancelarReserva(reserva: Reserva) {
    if (reserva.id && reserva.mesa?.id && reserva.cliente.id) {
      try {
        this.loadingService.showLoading();

        // Actualizar el estado de la reserva a "cancelada"
        await this.dataSrv.updateObjectField(
          'reservas',
          reserva.id,
          'estado',
          EstadoReserva.cancelada
        );

        // Eliminar la reserva del array de reservas en la mesa
        await this.dataSrv.deleteArrayElement<Reserva>(
          'mesas',
          reserva.mesa.id,
          'reservas',
          (r) => r.id === reserva.id
        );

        // Eliminar la reserva del usuario
        await this.dataSrv.deleteObjectField(
          'usuarios',
          reserva.cliente.id,
          'reserva'
        );

        // Notificar al cliente sobre la cancelación
        const fechaFormateada = this.formatearFecha(reserva.fecha);
        if (reserva.cliente.token) {
          this.notification.sendPushNotification(
            'Reserva cancelada',
            `Tu reserva para el ${fechaFormateada} ha sido cancelada. Si tienes dudas, contáctanos.`,
            reserva.cliente.token
          );
        }

        this.toast.showExito(
          `La reserva de la mesa ${reserva.mesa.numero} ha sido cancelada con éxito.`
        );
      } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        this.toast.showError(
          'Error al cancelar la reserva. Por favor, intenta nuevamente.',
          'bottom'
        );
      } finally {
        this.loadingService.hideLoading();
      }
    } else {
      this.toast.showError(
        'La reserva no es válida o no tiene todos los datos necesarios.',
        'bottom'
      );
    }
  }

  formatearFecha(fechaInput: any): string {
    // Si es un objeto de tipo Firebase Timestamp
    if (
      fechaInput &&
      typeof fechaInput === 'object' &&
      'seconds' in fechaInput
    ) {
      const fecha = new Date(fechaInput.seconds * 1000); // Convertir segundos a milisegundos
      return this.formatarFechaDesdeDate(fecha);
    }

    // Si es un string ISO
    const fecha = new Date(fechaInput);
    if (isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida');
    }
    return this.formatarFechaDesdeDate(fecha);
  }

  private formatarFechaDesdeDate(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} a las ${horas}:${minutos}`;
  }

  getStatusClass(estado: string): string {
    switch (estado) {
      case EstadoReserva.pendienteConfirmacion:
        return 'pendiente';
      case EstadoReserva.confirmada:
        return 'aprobada';
      case EstadoReserva.cancelada:
        return 'rechazada';
      default:
        return 'desconocido'; // Clase para estados no definidos
    }
  }
}
