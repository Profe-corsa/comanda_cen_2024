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
import { ClienteConsultaComponent } from 'src/app/componentes/cliente-consulta/cliente-consulta.component';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-consulta',
  templateUrl: './consulta.page.html',
  styleUrls: ['./consulta.page.scss'],
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
    ClienteConsultaComponent,
  ],
})
export class ConsultaPage implements OnInit {
  tipoUsuario: string = '';
  usuarioActual: any;
  idUsuario: string = '';

  suscripcion: Subscription | any;

  constructor(
    private route: ActivatedRoute,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.tipoUsuario = this.route.snapshot.paramMap.get('object') || '';
    this.idUsuario = this.route.snapshot.paramMap.get('id') || '';
    this.obtenerUsuario();
  }

  async obtenerUsuario() {
    try {
      this.usuarioActual = await this.usuarioService.getUserPromise(
        this.idUsuario
      );
      console.log(this.usuarioActual);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
    }
  }

  // Método para volver al inicio segun el tipo de usuario
  inicio() {
    // Aquí redireccionas al usuario a la página principal
    console.log('Volver al inicio');
  }
}
