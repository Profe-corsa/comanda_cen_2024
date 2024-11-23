import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Estado, Pedido } from '../../clases/pedido';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import {
  IonButton,
  IonFooter,
  IonButtons,
  IonContent,
  IonList,
  IonItem,
  IonToolbar,
  IonThumbnail,
  IonLabel,
  IonTitle,
  IonIcon,
} from '@ionic/angular/standalone';
import { trashOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-pedido-cliente-modal',
  templateUrl: './pedido-cliente-modal.component.html',
  styleUrls: ['./pedido-cliente-modal.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonTitle,
    IonLabel,
    IonFooter,
    IonButton,
    CommonModule,
    IonButtons,
    IonContent,
    IonList,
    IonItem,
    IonToolbar,
    IonThumbnail,
  ],
})
export class PedidoClienteModalComponent implements OnInit {
  @Input() productos: any[] = []; // Recibimos los productos desde el componente padre
  productosAgrupados: {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    fotos: string[];
    tiempoEstimado: number;
    tipo: string;
  }[] = [];
  total: number = 0;
  @Input() usuarioId: string | any;
  @Output() productosActualizados = new EventEmitter<any[]>();
  @Output() totalActualizado = new EventEmitter<number>();
  @Input() estadoPedido: string = 'default';

  constructor(
    private modalController: ModalController,
    private dataService: DataService,
    private router: Router
  ) {
    addIcons({ trashOutline });
  }

  ngOnInit() {
    this.agruparProductos();
    this.calcularTotal();
  }

  // Agrupar productos por id y calcular la cantidad
  agruparProductos() {
    const mapa = new Map();

    this.productos.forEach((producto) => {
      if (mapa.has(producto.id)) {
        // Incrementar la cantidad si el producto ya está en el mapa
        mapa.get(producto.id).cantidad++;
      } else {
        // Agregar el producto al mapa con cantidad inicial 1
        mapa.set(producto.id, {
          ...producto,
          cantidad: 1,
          tiempoEstimado: producto.tiempoPreparacion, // Asegúrate de mantener el tiempoEstimado
        });
      }
    });

    // Convertir el mapa a un array
    this.productosAgrupados = Array.from(mapa.values());
  }

  calcularTotal() {
    this.total = this.productosAgrupados.reduce(
      (total, producto) => total + producto.precio * producto.cantidad,
      0
    );
  }
  eliminarProducto(index: number) {
    const producto = this.productosAgrupados[index];
    if (producto.cantidad > 1) {
      producto.cantidad--;
    } else {
      this.productosAgrupados.splice(index, 1);
    }
    this.actualizarTotal();

    // Emitir cambios
    this.productosActualizados.emit(this.productosAgrupados);
    this.totalActualizado.emit(this.total);
  }

  actualizarTotal() {
    this.total = this.productosAgrupados.reduce(
      (acc, producto) => acc + producto.precio * producto.cantidad,
      0
    );
  }

  // Cerrar el modal
  // Cerrar el modal y enviar datos actualizados
  close() {
    this.modalController.dismiss({
      productos: this.productosAgrupados,
      total: this.total,
    });
  }

  async realizarPedido() {
    // Crear un nuevo objeto Pedido
    const nuevoPedido = new Pedido();
    nuevoPedido.clienteId = this.usuarioId;
    nuevoPedido.productos = this.productosAgrupados.map((producto) => ({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: producto.cantidad,
      tipo: producto.tipo,
      fotos: producto.fotos,
      tiempoEstimado: producto.tiempoEstimado,
    }));
    nuevoPedido.precioTotal = this.total;
    nuevoPedido.estado = Estado.pendiente;
    nuevoPedido.calcularTiempoEstimado();
    try {
      await this.dataService.saveObject(nuevoPedido.toJSON(), 'pedidos');
      console.log('Pedido realizado:' + nuevoPedido);
      this.modalController.dismiss(nuevoPedido);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error al guardar el pedido:', error);
    }
  }

  confirmarRechazarPedido(estado: string) {
    this.modalController.dismiss(estado);
  }
}
