import { Component, OnInit, Input } from '@angular/core';
import { Pregunta, Encuesta, TipoEncuesta } from 'src/app/clases/encuesta';
import { EncuestaService } from '../../services/encuesta.service';
import { Usuario } from 'src/app/clases/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { IonSelectOption, IonSelect, IonLabel, IonItem, IonRange, IonList, IonRadioGroup, IonListHeader, IonRadio, IonCheckbox, IonTextarea, IonButton, IonNav, IonHeader, IonToolbar, IonIcon, IonTitle } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ListadoEncuestasComponent } from '../listado-encuestas/listado-encuestas.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.component.html',
  styleUrls: ['./encuesta-cliente.component.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonIcon,
    IonToolbar,
    IonHeader,
    IonNav,
    IonButton,
    IonTextarea,
    IonCheckbox,
    IonRadio,
    IonListHeader,
    IonRadioGroup,
    IonList,
    IonRange,
    IonItem,
    IonLabel,
    IonSelect,
    IonSelectOption,
    FormsModule,
    ListadoEncuestasComponent,
    CommonModule,
  ],
})
export class EncuestaClienteComponent implements OnInit {
  usuario: Usuario | any; // Usuario recibido como Input
  limpieza: number = 0;
  predisposicion: string = '';
  orden: string = '';
  elementosDisponibles: boolean = false;
  comentariosAdicionales: string = '';
  verEncuestas: boolean = true;

  constructor(
    private encuestaService: EncuestaService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.usuario = this.authService.getUserLogueado();
    console.log('user', this.usuario);
    const usuarioEncuestaAux = localStorage.getItem('UsuarioEncuesta');
    if (usuarioEncuestaAux) {
      const usuarioEncuesta = JSON.parse(usuarioEncuestaAux);
      if (usuarioEncuesta.usuarioId == this.usuario.id) {
        //Ya realizo la encuesta
        this.verEncuestas = true;
      } else {
        this.verEncuestas = false;
      }
    } else {
      this.verEncuestas = false;
    }
  }

  guardarEncuesta(): void {
    // Construir las preguntas basadas en las respuestas del usuario
    const preguntas: Pregunta[] = [
      { pregunta: 'Nivel de limpieza', respuesta: this.limpieza.toString() },
      { pregunta: 'Predisposición del mozo', respuesta: this.predisposicion },
      { pregunta: '¿Restaurante limpio?', respuesta: this.orden },
      {
        pregunta: '¿Atención rápida?',
        respuesta: this.elementosDisponibles ? 'sí' : 'no',
      },
      {
        pregunta: 'Comentarios adicionales',
        respuesta: this.comentariosAdicionales || '',
      },
    ];

    // Crear una instancia de Encuesta con las preguntas y el usuario
    const encuesta = new Encuesta(
      preguntas,
      TipoEncuesta.cliente,
      this.usuario
    );
    console.log('user2', this.usuario);

    const usuarioEncuesta = {
      usuarioId: this.usuario.id,
      fecha: new Date(),
    };
    localStorage.setItem('UsuarioEncuesta', JSON.stringify(usuarioEncuesta));
    // Guardar la encuesta utilizando el servicio
    this.encuestaService
      .createEncuesta(encuesta)
      .then(() => {
        console.log('Encuesta guardada con éxito');
        this.redirigirCliente();
      })
      .catch((err) => {
        console.error('Error al guardar la encuesta:', err);
      });
  }

  redirigirCliente(): void {
    // Redirigir al cliente a la página de inicio
    this.router.navigate(['/home']);
  }
  inicio() {
    if (this.usuario) {
      this.router.navigate([`/home`, this.usuario.id]);
    } else {
      this.router.navigate([`/home`]);
    }
  }
}
