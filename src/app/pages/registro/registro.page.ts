import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioRegistroComponent } from 'src/app/componentes/usuario-registro/usuario-registro.component';
import { IonicModule } from '@ionic/angular';
import { AnonimoRegistroComponent } from '../../componentes/anonimo-registro/anonimo-registro.component';
import { ActivatedRoute } from '@angular/router';
import { AltaMesaComponent } from 'src/app/componentes/alta-mesa/alta-mesa.component';
import { DuenioEmpleadoComponent } from 'src/app/componentes/duenio-empleado/duenio-empleado.component';
import { AltaProductoComponent } from '../../componentes/alta-producto/alta-producto.component';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    UsuarioRegistroComponent,
    AnonimoRegistroComponent,
    AltaMesaComponent,
    DuenioEmpleadoComponent,
    AltaProductoComponent,
  ],
})
export class RegistroPage implements OnInit {
  rutaUsuarioPerfil: any;
  tipoUsuario: string = '';

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.rutaUsuarioPerfil =
      this.activatedRoute.snapshot.paramMap.get('object');
    console.log(this.rutaUsuarioPerfil);
  }
}
