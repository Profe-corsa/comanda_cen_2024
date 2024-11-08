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
import { restaurantOutline, man, list } from 'ionicons/icons';
import { QrScannerService } from 'src/app/services/qrscanner.service';
import { ToastService } from 'src/app/services/toast.service';
import { Objetos } from 'src/app/clases/enumerados/Objetos';
import { UsuarioService } from 'src/app/services/usuario.service';

@Component({
  selector: 'app-cliente-home',
  templateUrl: './cliente-home.component.html',
  styleUrls: ['./cliente-home.component.scss'],
  standalone: true,
  imports: [IonGrid, IonCard, IonIcon, IonRow, IonCol, CommonModule],
})
export class ClienteHomeComponent implements OnInit {
  @Input() usuario: Usuario | any;
  constructor(
    private qrService: QrScannerService,
    private toast: ToastService,
    private usuarioSrv: UsuarioService
  ) {
    addIcons({ list, restaurantOutline, man });
  }

  ngOnInit() {}

  leerQR() {
    this.qrService.scanCode().then((response) => {
      if (response == Objetos.listaDeEspera) {
        this.agregarAListaEspera();
      } else {
        this.toast.showError('Tuvimos un error al leer el QR');
      }
    });
  }

  agregarAListaEspera() {
    console.log(this.usuario);
    const usuarioEspera = {
      id: this.usuario.id,
      nombre:
        this.usuario.nombre.trim() +
        (this.usuario.apellido ? ' ' + this.usuario.apellido.trim() : ''),
      fecha: Date.now(),
    };
    this.usuarioSrv
      .setDocument('listaDeEspera', this.usuario.id, usuarioEspera)
      .then(() => {
        this.toast.showExito(
          'Fue anotado en la lista de espera. A la brevedad el maître le asignará una mesa.'
        );
      });
  }
}
