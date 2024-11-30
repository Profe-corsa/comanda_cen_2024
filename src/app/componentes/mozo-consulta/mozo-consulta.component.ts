import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonLabel,
  IonItem,
  IonTextarea,
  IonList,
} from '@ionic/angular/standalone';
import { MensajesService } from 'src/app/services/mensaje.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { ToastService } from 'src/app/services/toast.service';
import { Consulta, EstadoConsulta } from 'src/app/clases/consulta';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingComponent } from 'src/app/componentes/loading/loading.component';
import { Cliente } from 'src/app/clases/cliente';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { PushMailNotificationService } from 'src/app/services/push-mail-notification.service';

@Component({
  selector: 'app-mozo-consulta',
  templateUrl: './mozo-consulta.component.html',
  styleUrls: ['./mozo-consulta.component.scss'],
  standalone: true,
  imports: [
    IonList,
    IonTextarea,
    IonLabel,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    IonItem,
    LoadingComponent,
    RouterLink,
  ],
})
export class MozoConsultaComponent implements OnInit {
  @Input() usuario: any;
  listadoConsultas: Consulta[] = [];
  responderFlag: boolean = false;
  consultaSeleccionada = {} as Consulta;
  usuarioConsulta = {} as Cliente;
  mensajeRespuesta: string = '';

  constructor(
    private consultaService: MensajesService,
    private userSrv: UsuarioService,
    public toast: ToastService,
    public loadingService: LoadingService,
    private notificationService: PushMailNotificationService
  ) {}

  ngOnInit() {
    //Cargar la lista de consultas por responder
    this.consultaService
      .getConsultas(EstadoConsulta.enviada)
      .subscribe((consultas) => {
        this.listadoConsultas = consultas;
      });
    // Cargar la lista de consultas en estado 'leída'
    this.consultaService
      .getConsultas(EstadoConsulta.leida)
      .subscribe((consultas) => {
        // Concatenar las consultas leídas al listado existente
        this.listadoConsultas = this.listadoConsultas.concat(consultas);
      });

    console.log(this.listadoConsultas);
  }

  // async responder(consulta?: Consulta) {
  //   console.log(consulta);
  //   if (!this.responderFlag && consulta != undefined) {
  //     this.responderFlag = true;
  //     this.consultaSeleccionada = consulta;
  //     await this.getUsuario(this.consultaSeleccionada.idCliente);

  //     // Cambiar el estado a 'leída' si la consulta no ha sido respondida
  //     if (this.consultaSeleccionada.estado === EstadoConsulta.enviada) {
  //       this.loadingService.showLoading();
  //       this.consultaSeleccionada.estado = EstadoConsulta.leida;
  //       await this.actualizarConsulta();
  //     }
  //   } else {
  //     this.responderFlag = false;
  //     this.consultaSeleccionada = {} as Consulta;
  //     this.usuarioConsulta = {} as Cliente;
  //   }
  // }

  async responder(consulta?: Consulta) {
    console.log(consulta);
    if (!this.responderFlag && consulta != undefined) {
      this.responderFlag = true;
      this.consultaSeleccionada = consulta;
      console.log(consulta, this.responderFlag);

      try {
        await this.getUsuario(this.consultaSeleccionada.idCliente);
        // Cambiar el estado a 'leída' si la consulta no ha sido respondida
        if (this.consultaSeleccionada.estado === EstadoConsulta.enviada) {
          this.loadingService.showLoading();
          this.consultaSeleccionada.estado = EstadoConsulta.leida;
          await this.actualizarConsulta();
        }
      } catch (error) {
        console.error('Error al procesar la consulta:', error);
        // Opcional: Mostrar un mensaje de error al usuario
      } finally {
        this.loadingService.hideLoading(); // Oculta el loading en todos los casos
      }
    } else {
      this.responderFlag = false;
      this.consultaSeleccionada = {} as Consulta;
      this.usuarioConsulta = {} as Cliente;
    }
  }

  async getUsuario(id: string) {
    try {
      this.usuarioConsulta = await firstValueFrom(this.userSrv.getUser(id));
      console.log('Usuario recuperado:', this.usuarioConsulta);
    } catch (error) {
      console.error('Error al recuperar el usuario:', error);
    }
  }

  async devolverConsulta() {
    try {
      this.loadingService.showLoading();
      this.consultaSeleccionada.respuesta = {
        mensaje: this.mensajeRespuesta,
        mozo: `${this.usuario.apellido} ${this.usuario.nombre}`,
        hora: new Date(),
      };
      this.consultaSeleccionada.estado = EstadoConsulta.respondida;
      console.log('Esta es la respuesta del mozo', this.consultaSeleccionada);
      await this.actualizarConsulta();
    } catch (error) {
      console.error('Error al devolver la consulta: ' + error);
    }
  }

  async actualizarConsulta() {
    try {
      // Verificar que se haya recuperado el usuario correctamente.
      if (!this.usuarioConsulta || !this.usuarioConsulta.consulta) {
        this.loadingService.hideLoading();
        this.toast.showError('No se pudo recuperar el usuario.');
        return;
      }
      // Encontrar el índice de la consulta dentro del array de consultas del usuario.
      const indice = this.usuarioConsulta.consulta.findIndex((consulta) => {
        console.log(`${consulta.id} <br> ${this.consultaSeleccionada.id}`);
        return consulta.id === this.consultaSeleccionada.id; // Retorna el resultado.
      });
      console.log(indice);

      if (indice === -1) {
        this.loadingService.hideLoading();
        this.toast.showError('No se encontró la consulta en el usuario.');
        return;
      }

      // Actualizar la consulta en el array del usuario.
      this.usuarioConsulta.consulta[indice] = this.consultaSeleccionada;

      // Actualizar el usuario y la consulta en la base de datos.
      await this.userSrv.updateUser(
        this.usuarioConsulta.id,
        this.usuarioConsulta
      );
      await this.consultaService.updateConsulta(
        this.consultaSeleccionada.id,
        this.consultaSeleccionada
      );

      this.loadingService.hideLoading();
      if (this.consultaSeleccionada.estado === EstadoConsulta.respondida) {
        if (this.usuarioConsulta?.token) {
          this.notificationService.sendPushNotification(
            'Respondieron su consulta',
            `El mozo ha respondido a su consulta.`,
            this.usuarioConsulta.token
          );
        } else {
          this.toast.showError(
            'No se pudo enviar la notificación porque falta el token.'
          );
        }
        this.toast.showExito('Consulta devuelta con éxito.');
      }
    } catch (error) {
      this.toast.showError('Error al devolver la consulta: ' + error);
    }
  }
}
