import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Camera, CameraResultType } from '@capacitor/camera';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from 'src/app/services/data.service';
import { CamaraService } from 'src/app/services/camara.service';
import { ToastService } from 'src/app/services/toast.service';
import { QrScannerService } from '../../services/qrscanner.service';
import { Producto, TipoProducto } from 'src/app/clases/producto';
@Component({
  selector: 'app-alta-producto',
  templateUrl: './alta-producto.component.html',
  styleUrls: ['./alta-producto.component.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class AltaProductoComponent {

  productoForm: FormGroup;
  fotos: string[] = [];
  // Opciones para el tipo de producto basadas en el enum
  tiposProductoOptions = [
    { key: 'Comida', value: TipoProducto.Comida },
    { key: 'Bebida', value: TipoProducto.Bebida },
    { key: 'Postre', value: TipoProducto.Postre }
  ];


  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private camaraService: CamaraService,
    private toast: ToastService,
    )
   {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      tiempoPreparacion: ['', [Validators.required, Validators.min(1)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      tipo: [TipoProducto.Comida, [Validators.required]]
    });
  }

  async tomarFoto() {
    if (this.fotos.length < 3) {
      try {
        const imageName = `producto_${Date.now()}.jpg`; // Genera un nombre único para la imagen
        const imageUrl = await this.camaraService.tomarFoto('productos', imageName);
        this.fotos.push(imageUrl); // Agrega la URL de descarga a la lista de fotos
      } catch (error) {
        this.toast.showError('Error al tomar foto: '+error);
      }
    } else {
      this.toast.showError('Solo se permiten tres fotos.');
    }
  }

  async guardarProducto() {
    if (this.productoForm.valid && this.fotos.length === 3) {
      const producto = new Producto();
      Object.assign(producto, this.productoForm.value); // Copia los valores del formulario al objeto producto
      producto.fotos = this.fotos;
      try {
        await this.dataService.saveObject(producto.toJSON(), 'productos');
        this.toast.showExito('Producto guardado con éxito');
      } catch (error) {
        this.toast.showError('Error al guardar el producto: ' + error);
      }
    } else {
      this.toast.showError('Complete todos los campos y cargue tres fotos.');
    }
  }
  
  

  generarCodigoQR(producto: any) {
    // Lógica para generar código QR aquí (ver paso 3)
  }
}