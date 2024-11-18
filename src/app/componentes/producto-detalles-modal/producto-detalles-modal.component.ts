import { AfterViewInit, Component, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { IonButton, IonButtons, IonContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { register } from 'swiper/element/bundle';
register();

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-producto-detalles-modal',
  templateUrl: './producto-detalles-modal.component.html',
  styleUrls: ['./producto-detalles-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonButtons, IonContent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductoDetallesModalComponent implements AfterViewInit {

  @Output() productoAgregado: EventEmitter<any> = new EventEmitter();
  @Input() producto: any;
  @ViewChild('swiper', { static: false }) swiperRef: ElementRef | undefined;
  activeIndex: number = 0; // Índice de la imagen actual
  slideOpts = {
    initialSlide: 0,  // Comienza desde la primera imagen
    slidesPerView: 1, // Muestra solo una imagen a la vez
    spaceBetween: 10,  // Espacio entre imágenes (si lo deseas)
    loop: true,        // Habilita el bucle (si quieres que vuelva al inicio)
    centeredSlides: true, // Centra la imagen actual
    speed: 400,        // Velocidad de transición entre slides
  };

  constructor(private modalController: ModalController) {}

  // Método para cerrar el modal
  dismiss() {
    this.modalController.dismiss({
      producto: this.producto, // Asegúrate de pasar el producto cuando se cierre el modal
    });
  }
  cerrarModal(){
    this.modalController.dismiss();
  }
  ngAfterViewInit() {
    // Al inicializar la vista, accedemos a la instancia de Swiper
    if (this.swiperRef) {
      const swiperInstance = this.swiperRef.nativeElement.swiper;

      // Inicializamos el índice activo
      this.activeIndex = swiperInstance.activeIndex;

      // Suscribimos al evento slideChange para actualizar el activeIndex
      swiperInstance.on('slideChange', () => {
        this.onSlideChanged();
      });
    }
  }

  // Método que se ejecuta cuando cambia el slide
  onSlideChanged() {
    if (this.swiperRef) {
      const swiperInstance = this.swiperRef.nativeElement.swiper;
      this.activeIndex = swiperInstance.activeIndex; // Actualiza el índice activo
       // Puedes agregar un log para verificar el valor
    }
  }
  agregarProducto() {
    // Emitir el producto al componente padre
    this.productoAgregado.emit(this.producto);

    // Luego cerramos el modal
    this.dismiss();
  }
}
