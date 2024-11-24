import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonTitle, IonGrid, IonCard,
  IonRow,
  IonCol, } from "@ionic/angular/standalone";
import { Router, RouterLink } from '@angular/router';
import {
  
} from '@ionic/angular/standalone';
import {
  arrowBackCircleOutline, list, qrCodeOutline, chatbubblesOutline, restaurantOutline, fastFoodOutline, gameControllerOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';
@Component({
  selector: 'app-menu-juegos',
  templateUrl: './menu-juegos.component.html',
  styleUrls: ['./menu-juegos.component.scss'],
  standalone: true,
  imports: [IonGrid, IonIcon, CommonModule, IonTitle, IonCard, IonCol, IonGrid, IonRow, RouterLink],
})
export class MenuJuegosComponent  implements OnInit {

  constructor(private router: Router,) {
    addIcons({arrowBackCircleOutline,list,qrCodeOutline,chatbubblesOutline,restaurantOutline,fastFoodOutline,gameControllerOutline});
  }

  ngOnInit() {}
  redireccionar(juego: string){
    this.router.navigate(['/'+juego])
  }
  volverAtras() {
    this.router.navigate(['/home']);
  }
}
