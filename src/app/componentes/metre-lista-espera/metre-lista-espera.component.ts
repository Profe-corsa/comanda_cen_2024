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
import { Mesa } from '../../clases/mesa';
import { addIcons } from 'ionicons';
import { trashOutline, checkmarkOutline } from 'ionicons/icons';

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
  listaMesasDisponibles: Mesa[] = [];
  mesa!: Mesa;

  constructor(
    private usuarioSrv: UsuarioService,
    private toast: ToastService,
    private dataService: DataService
  ) {
    addIcons({
      trashOutline,
      checkmarkOutline,
    });
  }

  async ngOnInit() {
    //this.cargarClientes();
    this.cargarMesasDisponibles();

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

  async asignarMesa(numeroMesa: number, idCliente: string) {
    if (!numeroMesa) {
      this.toast.showError(
        'No se puede asignar la mesa porque no está definida.',
        'bottom'
      );
      return;
    }
    await this.dataService.asignarMesa(numeroMesa, idCliente);
  }

  //Funciona con el slicing
  cambiarEstadoCliente(estado: string, cliente: Usuario) {
    console.log('entro', estado);
    if (estado == 'aprobado') {
      cliente.estado = Estados.puedeTomarMesa;
      this.asignarMesa(this.mesa.numero, cliente.id);
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
          this.toast.showExito('El cliente puede tomar una mesa', 'bottom');
        } else {
          this.toast.showError('El cliente ha sido rechazado', 'bottom');
        }
        // Opcional: Filtra la lista para eliminar al cliente aprobado o rechazado si ya no debe mostrarse
        this.listaClientes = this.listaClientes.filter(
          (c: Usuario) => c.id !== cliente.id
        );
        this.listaVacia = this.listaClientes.length === 0;
      });
  }

  async cargarClientes() {
    // Cargar clientes en lista de espera
    const clientes = await this.dataService.obtenerClientesEnEspera();
    this.listaClientes = clientes || [];
  }

  async cargarMesasDisponibles() {
    try {
      const mesas = await this.dataService.obtenerMesas();
      // Filtrar solo las mesas que tienen estado 'Disponible'
      this.listaMesasDisponibles = mesas.filter(
        (mesa) => mesa.estado === 'Disponible'
      );
    } catch (error) {
      console.error('Error al cargar las mesas disponibles:', error);
    }
  }

  async asignarMesaCliente(cliente: any) {
    if (this.listaMesasDisponibles.length === 0) {
      this.toast.showError('No hay mesas disponibles.', 'bottom');
      return;
    }

    // Toma la primera mesa disponible
    const mesaDisponible = this.listaMesasDisponibles.shift();

    if (!mesaDisponible) {
      this.toast.showError('No se pudo asignar una mesa.', 'bottom');
      return;
    }

    try {
      // Asigna la mesa al cliente
      await this.dataService.asignarMesa(mesaDisponible.numero, cliente.id);

      // Actualizar lista de mesas disponibles y cliente
      cliente.estado = 'puedeTomarMesa';
      mesaDisponible.estado = 'reservada';

      this.toast.showExito(
        `Mesa ${mesaDisponible.numero} asignada a ${cliente.nombre}`,
        'bottom'
      );
    } catch (error) {
      console.error('Error al asignar mesa:', error);
      this.toast.showError('Error al asignar mesa.', 'bottom');
    }
  }
}
