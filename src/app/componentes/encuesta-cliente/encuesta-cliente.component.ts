import { Component, OnInit, Input } from '@angular/core';
import { Pregunta, Encuesta, TipoEncuesta } from 'src/app/clases/encuesta';
import { EncuestaService } from '../../services/encuesta.service';
import { Usuario } from 'src/app/clases/usuario';
import { Router } from '@angular/router';
import { IonSelectOption, IonSelect, IonLabel, IonItem, IonRange, IonList, IonRadioGroup, IonListHeader, IonRadio, IonCheckbox, IonTextarea, IonButton } from "@ionic/angular/standalone";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-encuesta-cliente',
  templateUrl: './encuesta-cliente.component.html',
  styleUrls: ['./encuesta-cliente.component.scss'],
  standalone: true,
  imports: [IonButton, IonTextarea, IonCheckbox, IonRadio, IonListHeader, IonRadioGroup, IonList, IonRange, IonItem, IonLabel,
    IonSelect, IonSelectOption, FormsModule
  ],
})
export class EncuestaClienteComponent implements OnInit {
  @Input() usuario: Usuario; // Usuario recibido como Input
  limpieza: number = 0;
  predisposicion: string = '';
  orden: string = '';
  elementosDisponibles: boolean = false;
  comentariosAdicionales: string = '';

  constructor(
    private encuestaService: EncuestaService,
    private router: Router
  ) { }

  ngOnInit(): void { }

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
    this.router.navigate(['/home', this.usuario.id]);
  }
}
