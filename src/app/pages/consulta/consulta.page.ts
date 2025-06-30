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
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Usuario } from 'src/app/clases/usuario';
import { ClienteConsultaComponent } from 'src/app/componentes/cliente-consulta/cliente-consulta.component';
import { firstValueFrom } from 'rxjs'; //me resuelve el problema del asincronismo
import { MozoConsultaComponent } from 'src/app/componentes/mozo-consulta/mozo-consulta.component';
import { addIcons } from 'ionicons';
import { arrowBackCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-consulta',
  templateUrl: './consulta.page.html',
  styleUrls: ['./consulta.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonButton,
    IonIcon,
    ClienteConsultaComponent,
    MozoConsultaComponent,
  ],
})
export class ConsultaPage implements OnInit {
  tipoUsuario: any = '';
  idUsuario: any = '';
  usuarioActual: Usuario | null = null;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userSrv: UsuarioService
  ) {
    addIcons({ arrowBackCircleOutline });
  }

  ngOnInit() {
    this.tipoUsuario = this.activatedRoute.snapshot.paramMap.get('object');
    this.idUsuario = this.activatedRoute.snapshot.paramMap.get('id');
    this.getUsuario();
  }

  ///Recupera el usuario actual de la base de datos
  async getUsuario() {
    try {
      this.usuarioActual = await firstValueFrom(
        this.userSrv.getUser(this.idUsuario)
      );
      console.log('Usuario recuperado:', this.usuarioActual);
    } catch (error) {
      console.error('Error al recuperar el usuario:', error);
    }
  }

  inicio() {
    if (this.tipoUsuario != 'cliente anonimo') {
      this.router.navigate([`/home`]);
    } else {
      this.router.navigate([`/home`, this.idUsuario]);
    }
  }
}
