import { Component, OnInit } from '@angular/core';
import { Mesa } from 'src/app/clases/mesa';
import { DataService } from 'src/app/services/data.service';
import { CommonModule } from '@angular/common';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonIcon,
  IonContent,
  IonSpinner,
  IonCardContent,
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular';
import { MesaDetalleModalComponent } from '../mesa-detalle-modal/mesa-detalle-modal.component';

@Component({
  selector: 'app-mesas-lista',
  templateUrl: './mesas-lista.component.html',
  styleUrls: ['./mesas-lista.component.scss'],
  standalone: true,
  imports: [
    IonCardContent,
    IonGrid,
    IonContent,
    IonRow,
    IonCol,
    IonCard,
    CommonModule,
  ],
})
export class MesasListaComponent implements OnInit {
  mesas: Mesa[] = []; // Almacenamos las mesas como objetos del tipo Mesa
  isLoading = true; // Mostrar spinner mientras se cargan los datos

  constructor(
    private dataService: DataService,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    try {
      // Obtener las mesas desde Firestore
      const mesasData = await this.dataService.getCollectionData('mesas');
      // Mapear las mesas obtenidas a instancias de la clase Mesa
      this.mesas = mesasData.map((mesa: any) =>
        Object.assign(new Mesa(), mesa)
      );
    } catch (error) {
      console.error('Error al cargar las mesas:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async seleccionarMesa(mesa: Mesa) {
    try {
      const modal = await this.modalController.create({
        component: MesaDetalleModalComponent,
        componentProps: {
          mesa: mesa, // Valor por defecto si no existen productos
        },
      });

      // Maneja el cierre del modal
      modal.onDidDismiss().then(async (result: { data?: string }) => {
        const estadoSeleccionado = result.data; // Recibimos el estado devuelto al cerrar el modal
        if (estadoSeleccionado) {
          console.log(
            `Estado seleccionado para la mesa: ${estadoSeleccionado}`
          );
        }
      });

      return await modal.present();
    } catch (error) {
      console.error('Error al mostrar el detalle de la mesa:', error);
    }
  }
}
