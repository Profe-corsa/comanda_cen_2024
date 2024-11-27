import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonIcon,
  IonRouterLink,
  IonCol,
  IonGrid,
  IonRow,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Usuario } from 'src/app/clases/usuario';
import { addIcons } from 'ionicons';
import { man, chatbubblesOutline, clipboard } from 'ionicons/icons';
import { AltaProductoComponent } from '../alta-producto/alta-producto.component';

@Component({
  selector: 'app-empleados-home',
  templateUrl: './empleados-home.component.html',
  styleUrls: ['./empleados-home.component.scss'],
  standalone: true,
  imports: [
    IonRow,
    IonGrid,
    CommonModule,
    IonCard,
    IonIcon,
    IonRouterLink,
    IonCol,
    RouterLink,
    AltaProductoComponent,
  ],
})
export class EmpleadosHomeComponent implements OnInit {
  @Input() usuario: Usuario | any;
  opcionSeleccionada: string = '';

  constructor() {
    addIcons({ man, clipboard, chatbubblesOutline });
  }

  ngOnInit() {
  }

  seleccionarOpcion(opcion: string) {
    this.opcionSeleccionada = opcion;
  }
}
