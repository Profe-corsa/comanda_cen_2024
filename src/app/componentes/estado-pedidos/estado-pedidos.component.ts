import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../services/data.service';
import { CommonModule } from '@angular/common';
import { IonIcon, IonTitle } from "@ionic/angular/standalone";
import { Router } from '@angular/router';
import {
  bagHandleOutline,
  arrowBackOutline,
  arrowBackCircleOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-estado-pedidos',
  templateUrl: './estado-pedidos.component.html',
  styleUrls: ['./estado-pedidos.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, IonTitle],
})
export class EstadoPedidosComponent implements OnInit {
  idUsuario: string | any = '';
  pedidos: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private dataService: DataService,
    private router: Router,
  ) {
    addIcons({ arrowBackCircleOutline, bagHandleOutline, arrowBackOutline });
  }

  async ngOnInit() {
    this.idUsuario = this.activatedRoute.snapshot.paramMap.get('id');
    
    // Filtra los pedidos por estado y ordena por estado y fecha
    this.pedidos = await this.dataService.getDocumentsByTwoFieldsAndOrder(
      'pedidos',
      'clienteId',
      this.idUsuario,
      'estado',
      ['en preparación', 'finalizado'],
      'fecha'
    );

    // Inicializa la propiedad showDetails como falsa para todos los pedidos
    this.pedidos.forEach((pedido) => {
      pedido.showDetails = false;
    });
    this.pedidos.sort((a, b) => {
    // Primero compara el estado
    if (a.estado === 'en preparación' && b.estado !== 'en preparación') {
      return -1; // a debe ir antes que b
    } else if (b.estado === 'en preparación' && a.estado !== 'en preparación') {
      return 1; // b debe ir antes que a
    }

    // Si el estado es el mismo, ordena por fecha (más reciente primero)
    const fechaA = new Date(a.fecha.split('/').reverse().join('/')); // Convierte la fecha a un objeto Date
    const fechaB = new Date(b.fecha.split('/').reverse().join('/'));
    return fechaB.getTime() - fechaA.getTime(); // Ordena por fecha de manera descendente
  });
  }
  getStatusClass(estado: string): string {
    switch (estado.toLowerCase()) {
      case 'en preparación':
        return 'preparando';
      case 'finalizado':
        return 'finalizado';
      default:
        return 'desconocido'; // Clase para estados no definidos
    }
  }
  volverAtras() {
    this.router.navigate(['/home']);
  }
  // Función para alternar la visibilidad de los detalles del pedido
  toggleDetails(pedido: any) {
    pedido.showDetails = !pedido.showDetails;
  }
}
