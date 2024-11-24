import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonTitle } from "@ionic/angular/standalone";
import { Router } from '@angular/router';
import {
  arrowBackCircleOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-menu-juegos',
  templateUrl: './menu-juegos.component.html',
  styleUrls: ['./menu-juegos.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule, IonTitle],
})
export class MenuJuegosComponent  implements OnInit {

  constructor(private router: Router,) {
    addIcons({ arrowBackCircleOutline });
  }

  ngOnInit() {}
  volverAtras() {
    this.router.navigate(['/home']);
  }
}
