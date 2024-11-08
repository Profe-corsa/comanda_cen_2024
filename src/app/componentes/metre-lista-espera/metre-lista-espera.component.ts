import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonIcon,
  IonRouterLink,
  IonRow,
  IonCol,
  IonGrid,
  IonList,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonItem,
  IonAvatar,
  IonLabel,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Usuario } from 'src/app/clases/usuario';
import { ToastService } from 'src/app/services/toast.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Estados } from 'src/app/clases/enumerados/Estados';
// import { addIcons } from 'ionicons';
// import { man } from 'ionicons/icons';

@Component({
  selector: 'app-metre-lista-espera',
  templateUrl: './metre-lista-espera.component.html',
  styleUrls: ['./metre-lista-espera.component.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonAvatar,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonList,
    IonGrid,
    CommonModule,
    IonCard,
    IonIcon,
    IonRouterLink,
    IonRow,
    IonCol,
    RouterLink,
  ],
})
export class MetreListaEsperaComponent implements OnInit {
  listaClientes: Usuario[] = [];
  listaVacia: boolean = false;

  constructor(
    private usuarioSrv: UsuarioService,
    private toast: ToastService
  ) {}

  async ngOnInit() {
    await this.usuarioSrv
      .obtenerUsuariosPorPerfil('cliente anonimo')
      .subscribe((usuarios) => {
        this.listaClientes = usuarios.filter(
          (cliente) => cliente.estado == Estados.enEspera
        );
        if (this.listaClientes.length < 1) this.listaVacia = true;
        else this.listaVacia = false;
        console.log(this.listaClientes);
      });
  }

  cambiarEstadoCliente(estado: string, {}) {}
}
