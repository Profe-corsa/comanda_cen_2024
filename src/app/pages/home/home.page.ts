import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Subscription } from 'rxjs';
import { Usuario } from 'src/app/clases/usuario';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuarioService } from 'src/app/services/usuario.service';
import { addIcons } from 'ionicons';
import { exitOutline } from 'ionicons/icons';
import { Cliente } from 'src/app/clases/cliente';
import { DuenioSupervisorHomeComponent } from '../../componentes/duenio-supervisor-home/duenio-supervisor-home.component';
import { ClienteHomeComponent } from '../../componentes/cliente-home/cliente-home.component';
import { EmpleadosHomeComponent } from '../../componentes/empleados-home/empleados-home.component';
import { AppComponent } from 'src/app/app.component';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DuenioSupervisorHomeComponent,
    CommonModule,
    ClienteHomeComponent,
    EmpleadosHomeComponent,
    AppComponent,
  ],
})
export class HomePage {
  usuario: Usuario | any;
  idAnonimo: string = '';
  suscripcion: Subscription | any;

  constructor(
    private authService: AuthService,
    private userSrv: UsuarioService,
    private activatedRoute: ActivatedRoute,
    private appComponent: AppComponent,
    private loadingService: LoadingService
  ) {
    addIcons({
      exitOutline,
    });
  }

  ngOnInit() {
    let idUsuario = null;
    let cliente: Cliente;

    this.activatedRoute.paramMap.subscribe((paramMap) => {
      idUsuario = paramMap.get('usuarioAnonimo')!;

      if (idUsuario == null) {
        // idUsuario = this.authService.getUserLogueado()?.id ?? '';
        this.usuario = this.authService.getUserLogueado();
      }
    });
    //   this.suscripcion = this.userSrv
    //     .getUser(idUsuario)
    //     .subscribe(async (data) => {
    //       this.usuario = data;

    //       if (this.usuario.perfil == 'cliente') {
    //         //Se supone que los clientes van a tener un trato preferencial y van a poder hacer reservas
    //         //(SEGUIR DESARROLLANDO)
    //         cliente = this.usuario as Cliente;
    //       }
    //     });
    // });
  }

  async logout() {
    this.loadingService.showLoading();
    this.appComponent.playCloseSound();
    await this.authService.logOut();
    this.loadingService.hideLoading();
  }
}
