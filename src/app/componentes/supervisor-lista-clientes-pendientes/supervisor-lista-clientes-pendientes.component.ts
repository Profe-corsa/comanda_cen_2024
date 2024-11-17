import { Component, OnInit } from '@angular/core';
import { UsuarioService } from 'src/app/services/usuario.service';
import { CommonModule } from '@angular/common';
import { Usuario } from 'src/app/clases/usuario';
import {
  IonCard,
  IonIcon,
  IonRouterLink,
  IonRow,
  IonCol,
  IonLabel,
  IonList,
  IonItemSliding,
  IonItem,
  IonAvatar,
  IonButton,
  IonItemOptions,
  IonItemOption,
} from '@ionic/angular/standalone';
import { Estados } from 'src/app/clases/enumerados/Estados';
import { ToastService } from 'src/app/services/toast.service';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  trashOutline,
  checkmarkOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-supervisor-lista-clientes-pendientes',
  templateUrl: './supervisor-lista-clientes-pendientes.component.html',
  styleUrls: ['./supervisor-lista-clientes-pendientes.component.scss'],
  standalone: true,
  imports: [
    IonItemOption,
    IonItemOptions,
    IonAvatar,
    IonItem,
    IonItemSliding,
    IonList,
    IonLabel,
    IonCard,
    IonIcon,
    IonRouterLink,
    IonRow,
    IonCol,
    IonButton,
    CommonModule,
  ],
})
export class SupervisorListaClientesPendientesComponent implements OnInit {
  listaClientesPendientes: Usuario[] | any;

  constructor(private usuarioSrv: UsuarioService, private toast: ToastService) {
    addIcons({
      checkmarkCircleOutline,
      trashOutline,
      checkmarkOutline,
    });
  }

  ngOnInit() {
    this.usuarioSrv
      .obtenerUsuariosPorPerfil('cliente')
      .subscribe((usuarios) => {
        this.listaClientesPendientes = usuarios.filter(
          (cliente) => cliente.estado == Estados.pendienteDeAprobacion
        );
      });
  }

  //Funciona con el slicing
  cambiarEstadoCliente(estado: string, cliente: Usuario) {
    console.log('entro', estado);
    if (estado == 'aprobado') {
      cliente.estado = Estados.aprobado;
    } else {
      cliente.estado = Estados.rechazado;
    }
    this.actualizarEstadoCliente(cliente);
  }

  private actualizarEstadoCliente(cliente: Usuario) {
    this.usuarioSrv
      .updateUser(cliente.id, { estado: cliente.estado })
      .then(() => {
        if (cliente.estado == Estados.aprobado) {
          this.toast.showExito('El cliente ha sido aprobado', 'bottom');
        } else {
          this.toast.showError('El cliente ha sido rechazado', 'bottom');
        }
        // Opcional: Filtra la lista para eliminar al cliente aprobado o rechazado si ya no debe mostrarse
        this.listaClientesPendientes = this.listaClientesPendientes.filter(
          (c: Usuario) => c.estado === Estados.pendienteDeAprobacion
        );
      });
  }
}
