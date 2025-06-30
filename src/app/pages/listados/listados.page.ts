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
  IonGrid,
  IonRow,
  IonCol,
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { SupervisorListaClientesPendientesComponent } from '../../componentes/supervisor-lista-clientes-pendientes/supervisor-lista-clientes-pendientes.component';
import { MetreListaEsperaComponent } from '../../componentes/metre-lista-espera/metre-lista-espera.component';
import { MozoListaPedidosComponent } from 'src/app/componentes/mozo-lista-pedidos/mozo-lista-pedidos.component';
import { CocineroBartenderPedidoComponent } from 'src/app/componentes/cocinero-bartender-pedido/cocinero-bartender-pedido.component';
import { addIcons } from 'ionicons';
import { arrowBackCircleOutline } from 'ionicons/icons';
import { MesasListaComponent } from '../../componentes/mesas-lista/mesas-lista.component';
import { DuenioSupervisorListaEsperaComponent } from '../../componentes/duenio-supervisor-lista-espera/duenio-supervisor-lista-espera.component';
import { ListadoEncuestasComponent } from 'src/app/componentes/listado-encuestas/listado-encuestas.component';

@Component({
  selector: 'app-listados',
  templateUrl: './listados.page.html',
  styleUrls: ['./listados.page.scss'],
  standalone: true,
  imports: [
    IonCol,
    IonRow,
    IonGrid,
    IonIcon,
    IonButton,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    SupervisorListaClientesPendientesComponent,
    MetreListaEsperaComponent,
    MozoListaPedidosComponent,
    CocineroBartenderPedidoComponent,
    MesasListaComponent,
    DuenioSupervisorListaEsperaComponent,
    ListadoEncuestasComponent,
  ],
})
export class ListadosPage implements OnInit {
  object: any;
  txtHeader: string = '';

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {
    {
      addIcons({ arrowBackCircleOutline });
    }
  }

  ngOnInit() {
    this.object = this.activatedRoute.snapshot.paramMap.get('object');

    this.txtHeader = this.cambiarTextoHeader(this.object);
  }

  cambiarTextoHeader(object: string): string {
    switch (object) {
      case 'clientesPendientes':
        return 'clientes pendientes';
      case 'preparacion':
        return 'preparación';
      default:
        return object;
    }
  }

  inicio() {
    this.router.navigate([`/home`]);
  }
}
