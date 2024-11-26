import { Component, OnInit } from '@angular/core';
import { EncuestaService } from '../../services/encuesta.service'; // Servicio para obtener encuestas
import {
  Chart,
  ChartOptions,
  ChartType,
  ChartData,
  registerables,
} from 'chart.js';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { IonHeader, IonToolbar, IonButton, IonIcon, IonTitle, IonBackButton, IonNav } from "@ionic/angular/standalone";

// Registrar los componentes necesarios de Chart.js
Chart.register(...registerables);

@Component({
  selector: 'app-listado-encuestas',
  templateUrl: './listado-encuestas.component.html',
  styleUrls: ['./listado-encuestas.component.scss'],
  standalone: true,
  imports: [IonNav, IonBackButton,
    IonTitle,
    IonIcon,
    IonButton,
    IonToolbar,
    IonHeader,
    CommonModule,
    NgChartsModule,
  ],
})
export class ListadoEncuestasComponent implements OnInit {
  encuestas: any[] = []; // Datos de las encuestas
  graficos: { tipo: ChartType; opciones: ChartOptions; data: ChartData }[] = []; // Configuración de gráficos

  constructor(private encuestaService: EncuestaService) { }

  ngOnInit() {
    this.obtenerEncuestas();
  }

  obtenerEncuestas() {
    this.encuestaService.getEncuestas().then((data) => {
      // Mapea los datos obtenidos de la base de datos
      console.log('data', data);
      this.encuestas = data.map((encuesta: any) => encuesta.preguntas);
      // Procesa los datos para generar los gráficos
      this.procesarDatosParaGraficos();
    });
  }

  procesarDatosParaGraficos() {
    // Gráfico de torta: Nivel de limpieza
    console.log('Encuestas', this.encuestas);
    const limpieza = this.encuestas.map((encuesta) =>
      parseInt(
        encuesta?.find((p: any) => p.pregunta === 'Nivel de limpieza')
          ?.respuesta || '0'
      )
    );
    const conteoLimpieza = Array(11).fill(0); // Array de conteo para valores 0-10

    limpieza.forEach((nivel) => {
      if (!isNaN(nivel)) {
        conteoLimpieza[nivel]++;
      }
    });

    this.graficos.push({
      tipo: 'pie', // Tipo de gráfico
      opciones: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Nivel de limpieza',
          },
        },
      }, // Opciones
      data: {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], // Etiquetas
        datasets: [
          {
            data: conteoLimpieza, // Datos procesados
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FFCD56',
              '#36A2EB',
              '#FF6384',
              '#4BC0C0',
              '#FF6384',
            ],
          },
        ],
      },
    });

    // Gráfico de barras: Predisposición del mozo
    const predisposicionLabels = ['Excelente', 'Buena', 'Regular', 'Mala'];
    const predisposicionData = predisposicionLabels.map(
      (label) =>
        this.encuestas.filter((encuesta) =>
          encuesta?.find(
            (p: any) =>
              p.pregunta === 'Predisposición del mozo' && p.respuesta === label
          )
        ).length
    );
    this.graficos.push({
      tipo: 'bar', // Tipo de gráfico
      opciones: {
        responsive: true,
        indexAxis: 'y',
        plugins: {
          title: {
            display: true,
            text: 'Predisposición del mozo',
          },
        },
      }, // Opciones
      data: {
        labels: predisposicionLabels, // Etiquetas
        datasets: [
          {
            label: 'Cantidad',
            data: predisposicionData, // Datos procesados
            backgroundColor: ['#36A2EB', '#FFCE56', '#4BC0C0', '#FF6384'],
          },
        ],
      },
    });

    // Agrega lógica similar para otros gráficos como línea, radar, etc.
  }

}
