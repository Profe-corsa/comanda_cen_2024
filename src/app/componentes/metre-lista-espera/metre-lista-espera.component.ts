import { Component, Input, OnInit } from '@angular/core';
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
import { DataService } from 'src/app/services/data.service';
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
  @Input() mesa!: { numero: number; [key: number]: any };

  constructor(
    private usuarioSrv: UsuarioService,
    private toast: ToastService,
    private dataService: DataService
  ) {}

  async ngOnInit() {
    const listaAnonimos: Usuario[] = [];
    const listaRegistrados: Usuario[] = [];

    await this.usuarioSrv
      .obtenerUsuariosPorPerfil('cliente anonimo')
      .subscribe((usuarios) => {
        listaAnonimos.push(
          ...usuarios.filter((cliente) => cliente.estado === Estados.enEspera)
        );
        this.actualizarListaClientes(listaAnonimos, listaRegistrados);
        console.log('Clientes anónimos:', listaAnonimos);
      });

    await this.usuarioSrv
      .obtenerUsuariosPorPerfil('cliente')
      .subscribe((usuarios) => {
        listaRegistrados.push(
          ...usuarios.filter((cliente) => cliente.estado === Estados.enEspera)
        );
        this.actualizarListaClientes(listaAnonimos, listaRegistrados);
        console.log('Clientes registrados:', listaRegistrados);
      });
  }

  private actualizarListaClientes(
    listaAnonimos: Usuario[],
    listaRegistrados: Usuario[]
  ): void {
    this.listaClientes = [...listaAnonimos, ...listaRegistrados];
    this.listaVacia = this.listaClientes.length === 0;
  }
  cambiarEstadoCliente(estado: string, {}) {}

  async asignarMesa(idMesa: number, idCliente: string) {
    await this.dataService.asignarMesa(idMesa, idCliente);
  }
}
