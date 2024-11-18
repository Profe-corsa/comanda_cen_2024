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
} from 'ionicons/icons';
import { QrScannerService } from '../../services/qrscanner.service';
import { ToastService } from '../../services/toast.service';
import { Objetos } from '../../clases/enumerados/Objetos';
import { UsuarioService } from '../../services/usuario.service';
import { Estados } from '../../clases/enumerados/Estados';
import { RouterLink } from '@angular/router';

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
  ],
})
export class ClienteHomeComponent implements OnInit {
  @Input() usuario: Usuario | any;
  constructor(
    private qrService: QrScannerService,
    private toast: ToastService,
    private usuarioSrv: UsuarioService
  ) {
    addIcons({
      list,
      chatbubblesOutline,
      addCircleOutline,
      restaurantOutline,
      man,
    });
  }

  ngOnInit() {
    console.log('el usuario en home:', this.usuario);
  }

  leerQR() {
    this.qrService.scanCode().then((response) => {
      if (response == Objetos.listaDeEspera) {
        this.agregarAListaEspera();
      } else {
        this.toast.showError('Tuvimos un error al leer el QR');
      }
    });
  }

  async agregarAListaEspera() {
    try {
      console.log(this.usuario);

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

      // Muestra el mensaje de éxito
      this.toast.showExito(
        'Fue anotado en la lista de espera. A la brevedad el maître le asignará una mesa.'
      );
    } catch (error) {
      console.error('Error al agregar a lista de espera:', error);
      this.toast.showError('Hubo un error al agregar a la lista de espera.');
    }
  }
}
