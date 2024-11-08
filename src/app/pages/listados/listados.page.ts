import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { ActivatedRoute } from '@angular/router';
import { SupervisorListaClientesPendientesComponent } from '../../componentes/supervisor-lista-clientes-pendientes/supervisor-lista-clientes-pendientes.component';

@Component({
  selector: 'app-listados',
  templateUrl: './listados.page.html',
  styleUrls: ['./listados.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    SupervisorListaClientesPendientesComponent,
  ],
})
export class ListadosPage implements OnInit {
  object: any;

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    this.object = this.activatedRoute.snapshot.paramMap.get('object');
  }
}
