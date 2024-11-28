import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { Usuario } from 'src/app/clases/usuario';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { addIcons } from 'ionicons';
import { exitOutline } from 'ionicons/icons';
import { Cliente } from 'src/app/clases/cliente';
import { DuenioSupervisorHomeComponent } from '../../componentes/duenio-supervisor-home/duenio-supervisor-home.component';
import { ClienteHomeComponent } from '../../componentes/cliente-home/cliente-home.component';
import { EmpleadosHomeComponent } from '../../componentes/empleados-home/empleados-home.component';
import { AppComponent } from 'src/app/app.component';
import { LoadingService } from 'src/app/services/loading.service';
import { Reserva, EstadoReserva } from 'src/app/clases/Reserva';
import { Estados } from 'src/app/clases/enumerados/Estados';
import { ToastService } from 'src/app/services/toast.service';
import { DataService } from 'src/app/services/data.service';
import { Mesa } from 'src/app/clases/mesa';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DuenioSupervisorHomeComponent,
    CommonModule,
    ClienteHomeComponent,
    EmpleadosHomeComponent,
  ],
})
export class HomePage {
  usuario: Usuario | any;
  idAnonimo: string = '';
  suscripcion: Subscription | any;

  constructor(
    private authService: AuthService,
    private userSrv: UsuarioService,
    private dataSrv: DataService,
    private activatedRoute: ActivatedRoute,
    private appComponent: AppComponent,
    private loadingService: LoadingService,
    private toast: ToastService
  ) {
    addIcons({
      exitOutline,
    });
  }

  ngOnInit() {
    let idUsuario = null;
    let cliente: Cliente;

    this.activatedRoute.paramMap.subscribe((paramMap) => {
      idUsuario = paramMap.get('usuarioAnonimo')!;
    });

    if (idUsuario == null) {
      // idUsuario = this.authService.getUserLogueado()?.id ?? '';
      this.usuario = this.authService.getUserLogueado();
    } else {
      this.userSrv.getUser(idUsuario).subscribe((userData) => {
        this.usuario = userData; // Cambia el tipo de `usuario` a `Usuario | null`.
      });
    }

    if (this.usuario.perfil == 'cliente') {
      cliente = <Cliente>this.usuario;

      //Acciones sobre las reservas del usuario
      if (cliente.reserva != undefined) {
        console.log('entro 3');

        //En primer caso el Cliente está dentro del horario correcto
        if (
          Reserva.evaluarHorarioReserva(cliente.reserva) &&
          cliente.estado == Estados.aprobado
        ) {
          cliente.estado = Estados.puedeTomarMesa;

          this.loadingService.showLoading();
          try {
            this.userSrv.updateUserFields(cliente.id, {
              estado: cliente.estado,
              mesaAsignada: cliente.reserva.mesa.numero, // Se le asigna la mesa que reservó al usuario
            });
            this.toast.showExito(
              `Hola ${cliente.nombre} ${cliente.apellido}, tu reserva está lista para ser tomada.`,
              'middle',
              5000
            );
          } catch (error) {
            this.toast.showError(
              'No pudimos recibirte como mereces, por favor ponte en contacto con el metre.',
              'bottom'
            );
            console.error(error);
          } finally {
            this.loadingService.hideLoading();
          }
        } else if (
          Reserva.evaluarReservaVencida(cliente.reserva) &&
          cliente.estado == Estados.aprobado
        ) {
          cliente.reserva.estado = EstadoReserva.cancelada;

          // En ngOnInit
          if (cliente.reserva) {
            this.loadingService.showLoading();

            this.cancelarReserva(cliente.reserva, cliente.id);
          }

          this.loadingService.hideLoading();
        }
      }
    }
  }

  async cancelarReserva(reserva: Reserva, clienteId: string): Promise<void> {
    try {
      // Eliminar la reserva del array de reservas en la mesa
      await this.dataSrv.deleteArrayElement<Reserva>(
        'mesas',
        reserva.mesa.id,
        'reservas',
        (r) => r.id === reserva.id
      );

      if (reserva.id) {
        // Finalizar la reserva
        await this.dataSrv.updateObjectFields('reservas', reserva.id, {
          estado: EstadoReserva.cancelada,
        });
      }

      // Eliminar la referencia de reserva del cliente
      await this.dataSrv.deleteObjectField('usuarios', clienteId, 'reserva');

      this.toast.showExito(
        'Se ha cancelado la reserva que tenías para la mesa ' +
          reserva.mesa.numero +
          ', porque te presentaste fuera del tiempo de tolerancia.',
        'middle',
        5000
      );
    } catch (error) {
      console.error('Error al cancelar la reserva:', error);
      throw error;
    } finally {
      this.loadingService.hideLoading();
    }
  }

  async logout() {
    this.loadingService.showLoading();
    this.appComponent.playCloseSound();
    await this.authService.logOut();
    this.loadingService.hideLoading();
  }
}
