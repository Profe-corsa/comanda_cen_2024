import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { ProductoDetallesModalComponent } from '../producto-detalles-modal/producto-detalles-modal.component';
import { ToastService } from '../../services/toast.service';
import { register } from 'swiper/element/bundle';
import { PedidoClienteModalComponent } from '../pedido-cliente-modal/pedido-cliente-modal.component';
register();
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  bagHandleOutline,
  arrowBackOutline,
  arrowBackCircleOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';


@Component({
  selector: 'app-carta',
  templateUrl: './carta.component.html',
  styleUrls: ['./carta.component.scss'],
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CartaComponent implements OnInit {
  @Input() id: string | any;
  precioTotal: number = 0;
  productos: any[] = [];
  
  productosAgregados: any[] = [];
  categorias: { [key: string]: any[] } = {};
  @ViewChild('swiper', { static: false }) swiperRef: ElementRef | undefined;
  activeIndex: number = 0; // Índice de la imagen actual
  slideOpts = {
    initialSlide: 0, // Comienza desde la primera imagen
    slidesPerView: 1, // Muestra solo una imagen a la vez
    spaceBetween: 10, // Espacio entre imágenes (si lo deseas)
    loop: true, // Habilita el bucle (si quieres que vuelva al inicio)
    centeredSlides: true, // Centra la imagen actual
    speed: 400, // Velocidad de transición entre slides
  };
  idUsuario: string | null = '';
  constructor(
    private dataService: DataService,
    private modalController: ModalController,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    
  ) {
    addIcons({ arrowBackCircleOutline, bagHandleOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.traerProductos();
    
    if (this.productosAgregados.length > 0) {
      this.calcularPrecioTotal();
    }
    this.idUsuario = this.activatedRoute.snapshot.paramMap.get('id');
    
  }

  async traerProductos() {
    try {
      this.productos = await this.dataService.getCollectionData('productos');
      this.productos.forEach((producto) => {
        if (!this.categorias[producto.tipo]) {
          this.categorias[producto.tipo] = [];
        }
        this.categorias[producto.tipo].push(producto);
      });
      console.log('Productos cargados:', this.productos);
      console.log('Categorías agrupadas:', this.categorias);
    } catch (error) {
      this.toastService.showError('Error al obtener los datos: ' + error);
    }
  }
  async abrirProductoDetalles(producto: any) {
    const modal = await this.modalController.create({
      component: ProductoDetallesModalComponent,
      componentProps: { producto },
    });

    // Escuchar el evento productoAgregado desde el modal hijo
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        // Agregar el producto al array productosAgregados
        this.productosAgregados.push(data.data.producto);
        console.log('Producto agregado:', data.data.producto);
        console.log('Productos agregados:', this.productosAgregados);

        // Calcular el precio total después de agregar el producto
        this.calcularPrecioTotal();

        // Mostrar un mensaje de éxito
        this.toastService.showExito('Producto agregado al carrito');
      }
    });

    return await modal.present();
  }
  get productosUnicos() {
    const idsUnicos = new Set(
      this.productosAgregados.map((producto) => producto.id)
    );
    return Array.from(idsUnicos).length;
  }

  calcularPrecioTotal() {
    this.precioTotal = this.productosAgregados.reduce((total, producto) => {
      return total + producto.precio * (producto.cantidad || 1); // Usar la cantidad si existe
    }, 0);

    console.log('Precio total actualizado:', this.precioTotal);
    return this.precioTotal;
  }

  async abrirPedidoCliente() {
    const modal = await this.modalController.create({
      component: PedidoClienteModalComponent,
      componentProps: {
        productos: this.productosAgregados,
        usuarioId: this.idUsuario,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data.data) {
        const { productos, total } = data.data;
        this.productosAgregados = productos; // Actualizar los productos agregados
        this.precioTotal = total; // Actualizar el precio total
        console.log('Productos actualizados:', productos);
        console.log('Precio total actualizado:', total);
      }
    });

    return await modal.present();
  }

  volverAtras() {
    this.router.navigate(['/home']);
  }
}
