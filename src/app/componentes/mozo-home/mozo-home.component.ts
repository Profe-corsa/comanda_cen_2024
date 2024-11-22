import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { DataService } from 'src/app/services/data.service';
import { ToastService } from 'src/app/services/toast.service';
import { Pedido, Estado } from 'src/app/clases/pedido';
import { switchMap, map } from 'rxjs/operators';
import { forkJoin, Observable, of } from 'rxjs';

@Component({
  selector: 'app-mozo-home',
  templateUrl: './mozo-home.component.html',
  styleUrls: ['./mozo-home.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class MozoHomeComponent implements OnInit, AfterViewInit {
  pedidosPendientes: Pedido[] = [];
  @ViewChild('volverButton', { static: true }) volverButton!: ElementRef;
  botonVisible = true;
  constructor(
    private dataService: DataService,
    private toast: ToastService,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.botonVisible = true;
    this.cargarPedidosPendientes();
  }

  ngAfterViewInit() {
    if (this.volverButton && this.volverButton.nativeElement) {
      this.volverButton.nativeElement.focus();
    } else {
      console.warn('El botón volver no está disponible en el DOM.');
    }
  }

  volver() {
    this.navCtrl.back(); // Navega a la página anterior
  }
  /*
  async cargarPedidosPendientes() {
    this.dataService.obtenerPedidoPorEstado('pendiente').subscribe({
      next: (pedidos) => {
        console.log('Pedidos pendientes:', pedidos); // Verifica los datos aquí
        this.pedidosPendientes = pedidos.map((pedidoData) =>
          Object.assign(new Pedido(), pedidoData)
        );
      },
      error: (err) => {
        console.error('Error al cargar pedidos pendientes:', err);
        this.toast.showError('Error al cargar los pedidos.', 'bottom');
      },
    });
  }

  */
  async cargarPedidosPendientes() {
    try {
      this.dataService.obtenerPedidoPorEstado(Estado.pendiente).subscribe({
        next: (pedidos: any[]) => {
          // Asignar los pedidos pendientes
          this.pedidosPendientes = pedidos.map((pedidoData) =>
            Object.assign(new Pedido(), pedidoData)
          );
        },
        error: (err) => {
          console.error('Error al cargar pedidos:', err);
          this.toast.showError('Error al cargar los pedidos.', 'bottom');
        },
      });
    } catch (err) {
      console.error('Error al procesar los pedidos:', err);
      this.toast.showError('Error interno al procesar los pedidos.', 'bottom');
    }
  }

  confirmarPedido(pedido: Pedido) {
    if (!pedido.id) {
      this.toast.showError('El pedido no tiene un ID válido.', 'bottom');
      return;
    }

    pedido.estado = Estado.tomado;

    this.dataService
      .actualizarPedido(pedido.id, pedido)
      .then(() => {
        this.toast.showExito('Pedido confirmado con éxito.', 'bottom');
        this.derivarSectores(pedido);
        this.pedidosPendientes = this.pedidosPendientes.filter(
          (p) => p.id !== pedido.id
        );
      })
      .catch((err) => {
        console.error('Error al confirmar pedido:', err);
        this.toast.showError('Error al confirmar el pedido.', 'bottom');
      });
  }

  derivarSectores(pedido: Pedido) {
    if (pedido.productos.some((prod) => prod.tipo === 'comida')) {
      this.dataService.derivarASector(pedido.id, 'cocinero');
    }
    if (pedido.productos.some((prod) => prod.tipo === 'bebida')) {
      this.dataService.derivarASector(pedido.id, 'bartender');
    }
    this.toast.showExito(
      'Pedido derivado a los sectores correspondientes.',
      'bottom'
    );
  }
  obtenerMesaParaPedido(clienteId: string): Observable<number | 'Sin asignar'> {
    return this.dataService.obtenerMesaPorCliente(clienteId).pipe(
      map((mesa) => (mesa ? mesa.nroMesa : 'Sin asignar')) // Devuelve el número de mesa o 'Sin asignar'
    );
  }
}
