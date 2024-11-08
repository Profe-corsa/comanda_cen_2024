import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonIcon,
  IonRouterLink,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Usuario } from 'src/app/clases/usuario';
import { addIcons } from 'ionicons';
import { restaurantOutline, man, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-duenio-supervisor-home',
  templateUrl: './duenio-supervisor-home.component.html',
  styleUrls: ['./duenio-supervisor-home.component.scss'],
  standalone: true,
  imports: [
    IonRow,
    IonCol,
    IonCard,
    IonIcon,
    IonRouterLink,
    RouterLink,
    CommonModule,
  ],
})
export class DuenioSupervisorHomeComponent  {
  @Input() usuario: Usuario | any;

  constructor() {
    addIcons({man,restaurantOutline,addCircleOutline});
  }

  
}
