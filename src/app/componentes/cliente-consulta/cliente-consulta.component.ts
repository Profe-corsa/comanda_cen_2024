import { Component, Input } from '@angular/core';
import {
  IonContent,
  IonList,
  IonItem,
  IonFooter,
  IonGrid,
  IonCol,
  IonRow,
  IonButton,
  IonLabel,
  IonHeader,
  IonInput,
  IonToolbar,
  IonBadge,
  IonIcon,
  IonAvatar,
  IonTitle,
  IonButtons,
  IonBackButton,
} from '@ionic/angular/standalone';
import { Consulta } from '../../clases/consulta';
import { MensajesService } from '../../services/mensaje.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-cliente-consulta',
  templateUrl: './cliente-consulta.component.html',
  styleUrls: ['./cliente-consulta.component.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonButtons,
    IonTitle,
    IonAvatar,
    IonToolbar,
    IonInput,
    IonHeader,
    IonFooter,
    IonItem,
    IonList,
    IonContent,
    IonGrid,
    IonCol,
    IonRow,
    IonButton,
    IonLabel,
    IonBadge,
    IonIcon,
    ChatComponent,
  ],
})
export class ClienteConsultaComponent {
  @Input() usuario: any;
  @Input() tipo: string = '';
  mensajes: Consulta[] = [];

  constructor(private consultaService: MensajesService) {}

  ngOnInit() {
    console.log('llego acá Uno?', this.usuario?.id); //ok
    this.cargarMensajes();
  }

  cargarMensajes() {
    this.consultaService
      .getConsultasList(this.usuario.id)
      .then((mensajes) => {
        this.mensajes = mensajes;
      })
      .catch((error) => console.error(error));
  }

  // cliente-consulta.component.ts
  onEnviarMensaje(mensaje: any) {
    const mensajeTexto = mensaje as string; // Asegúrate de que sea string
    this.consultaService
      .enviarMensajeCliente(mensajeTexto, this.usuario.id)
      .then((nuevaConsulta) => {
        this.mensajes.push(nuevaConsulta);
      })
      .catch((error) => console.error(error));
  }
}
