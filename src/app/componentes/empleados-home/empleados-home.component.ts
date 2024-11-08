import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonIcon,
  IonRouterLink,
  IonRow,
  IonCol,
  IonGrid,
} from '@ionic/angular/standalone';
import { RouterLink } from '@angular/router';
import { Usuario } from 'src/app/clases/usuario';
import { addIcons } from 'ionicons';
import { man } from 'ionicons/icons';

@Component({
  selector: 'app-empleados-home',
  templateUrl: './empleados-home.component.html',
  styleUrls: ['./empleados-home.component.scss'],
  standalone: true,
  imports: [
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
export class EmpleadosHomeComponent implements OnInit {
  @Input() usuario: Usuario | any;

  constructor() {
    addIcons({ man });
  }

  ngOnInit() {}
}
