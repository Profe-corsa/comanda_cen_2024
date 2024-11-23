import { Component, OnInit, Input } from '@angular/core';
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
} from '@ionic/angular/standalone';
import { Consulta } from 'src/app/clases/consulta';
import { MensajesService } from 'src/app/services/mensaje.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Cliente } from 'src/app/clases/cliente';
import { Usuario } from 'src/app/clases/usuario';
import { ToastService } from 'src/app/services/toast.service';
import { LoadingService } from 'src/app/services/loading.service';
import { LoadingComponent } from 'src/app/componentes/loading/loading.component';
import { PushMailNotificationService } from 'src/app/services/push-mail-notification.service';
import { Estados } from 'src/app/clases/enumerados/Estados';
import { Estado } from 'src/app/clases/pedido';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-cliente-consulta',
  templateUrl: './cliente-consulta.component.html',
  styleUrls: ['./cliente-consulta.component.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class ClienteConsultaComponent implements OnInit {
  @Input() usuario: Usuario | any;
  cliente: Cliente | any;
  textoCliente: string = '';
  consulta: Consulta | any;
  consultaCreada: boolean;

  constructor(
    private consultaService: MensajesService,
    private usuarioService: UsuarioService,
    public toast: ToastService,
    private notificationSrv: PushMailNotificationService,
    public loadingService: LoadingService,
    private dataService: DataService
  ) {
    this.consultaCreada = false;
  }

  ngOnInit() {
    let consulta: Consulta;
    this.cliente = <Cliente>this.usuario;

    console.log(this.cliente);
    //Comprobar si consulto antes
    if (
      this.cliente.consulta != undefined &&
      this.cliente.consulta.length > 0
    ) {
      let indiceUltimaConsulta = this.cliente.consulta.length - 1;
      consulta = this.cliente.consulta[indiceUltimaConsulta];
      this.consulta = consulta;
      this.consultaCreada = true;
    } else {
      this.consultaCreada = false;
      this.consulta = new Consulta();
    }
  }

  async crearConsulta() {
    console.log(this.textoCliente);
    let cliente = <Cliente>this.usuario;
    this.consulta.textoConsulta = this.textoCliente;
    this.consulta.nroMesa = this.cliente.mesaAsignada;
    this.consulta.idCliente = this.usuario.id;
    this.consulta.hora = new Date();
    this.loadingService.showLoading();
    let idConsulta = await this.consultaService.addConsulta(this.consulta);
    let indice: number;
    let encontroConsulta = false;

    //Suscribir a la consulta para recibir las actualizaciones
    this.consultaService.getConsultaById(idConsulta).subscribe((consulta) => {
      this.consultaCreada = true;
      this.consulta = consulta;

      //Guardar consulta en cliente y guardar cliente
      if (cliente.consulta == undefined) {
        cliente.consulta = [];
        cliente.consulta.push(this.consulta);
      } else {
        for (let auxConsulta of cliente.consulta) {
          //Sobrescribir si la consulta ya existía
          if (auxConsulta.id == this.consulta.id) {
            encontroConsulta = true;
            indice = cliente.consulta.indexOf(auxConsulta);
            cliente.consulta[indice] = this.consulta;
          }
        }

        if (!encontroConsulta) {
          cliente.consulta.push(this.consulta);
        }
      }

      this.notificationSrv.sendPushNotificationToRole(
        'Nueva consulta de cliente',
        `El cliente de la mesa ${this.cliente.mesaAsignada} realizó una nueva consulta.`,
        'mozo'
      );

      this.toast.showExito(
        'Consulta enviada. Los mozos se pondrán en contacto a la brevedad',
        'middle'
      );

      this.usuarioService.updateUser(cliente.id, cliente);

      this.loadingService.hideLoading();
    });
  }

  nuevaConsulta() {
    this.consultaCreada = false;
    this.textoCliente = '';
    this.consulta = new Consulta();
  }
}
