import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButton,
  IonItem,
  IonLabel,
  IonDatetime,
  IonModal,
  IonDatetimeButton,
  IonText,
  IonCard,
  IonInput,
} from '@ionic/angular/standalone';
import { Reserva, EstadoReserva } from 'src/app/clases/Reserva';
import { Cliente } from 'src/app/clases/cliente';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/clases/usuario';
import { ActivatedRoute, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { arrowBackCircleOutline } from 'ionicons/icons';
import { ToastService } from 'src/app/services/toast.service';
import { Mesa } from 'src/app/clases/mesa';
import { NgForm } from '@angular/forms';
import { DataService } from 'src/app/services/data.service';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { push } from 'firebase/database';
import { UsuarioService } from 'src/app/services/usuario.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.page.html',
  styleUrls: ['./reservas.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonCard,
    IonText,
    IonDatetimeButton,
    IonModal,
    IonDatetime,
    IonLabel,
    IonItem,
    IonButton,
    IonIcon,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ReservasPage implements OnInit {
  usuario: Usuario | any = null;
  diaMinimo: Date = new Date();
  diaMaximo: Date = new Date();
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  cantidadComensales: number = 0;
  horasDisponibles: string[] = [];
  form: FormGroup | any;

  constructor(
    private authSrv: AuthService,
    private route: Router,
    private fb: FormBuilder,
    private toast: ToastService,
    private dataService: DataService,
    private activatedR: ActivatedRoute,
    private userSrv: UsuarioService
  ) {
    this.form = this.fb.group({
      fecha: ['', Validators.required], // Para almacenar fecha y hora seleccionada.
      cantidadComensales: [
        '',
        [Validators.required, Validators.min(1), Validators.max(10)], // Cambié los valores de validación a 1-10 por lógica de comensales.
      ],
    });

    addIcons({ arrowBackCircleOutline });

    this.diaMaximo.setDate(this.diaMinimo.getDate() + 15); // Rango de 15 días
  }

  ngOnInit() {
    //Obtenemos al usuario logueado con el servicio.
    this.activatedR.paramMap.subscribe((params) => {
      let userId = params.get('id');

      console.log('ID del usuario:', userId);

      if (userId != null) {
        this.getUsuario(userId);
      }
    });
  }

  async getUsuario(id: string) {
    try {
      this.usuario = await firstValueFrom(this.userSrv.getUser(id));

      console.log('Usuario recuperado:', id);
    } catch (error) {
      console.error('Error al recuperar el usuario:', error);
    }
  }

  // Método para habilitar fechas
  isDateEnabled = (dateString: string): boolean => {
    // Convertir el string a formato Date y normalizar la hora
    const dateParts = dateString.split('T')[0].split('-');
    const date = new Date(
      parseInt(dateParts[0], 10), // Año
      parseInt(dateParts[1], 10) - 1, // Mes (0 indexado)
      parseInt(dateParts[2], 10) // Día
    );

    // Normalizar `diaMinimo` y `diaMaximo` para comparación
    const diaMinimo = new Date(this.diaMinimo);
    diaMinimo.setHours(0, 0, 0, 0);

    const diaMaximo = new Date(this.diaMaximo);
    diaMaximo.setHours(23, 59, 59, 999);

    // Obtener el día de la semana: 0 = domingo, 1 = lunes, ..., 6 = sábado
    const dayOfWeek = date.getUTCDay();

    // Verificar si está dentro del rango permitido
    const isWithinRange = date >= diaMinimo && date <= diaMaximo;

    // Habilitar solo si está en el rango y no es lunes
    return isWithinRange && dayOfWeek !== 1;
  };

  inicio() {
    this.route.navigate(['home']);
  }

  generarHorasDisponibles() {
    const ahora = new Date();
    let fechaSeleccionada;

    // Verifica si `this.fechaSeleccionada` es un string o un objeto Date válido
    if (typeof this.fechaSeleccionada === 'string') {
      fechaSeleccionada = new Date(this.fechaSeleccionada);
    } else {
      fechaSeleccionada = this.fechaSeleccionada;
    }

    // Verifica si la fecha es válida
    if (isNaN(fechaSeleccionada.getTime())) {
      console.error('Fecha seleccionada no válida:', this.fechaSeleccionada);
      return;
    }

    // Si es hoy, mostrar solo horas futuras disponibles
    if (fechaSeleccionada.toDateString() === ahora.toDateString()) {
      const horaActual = ahora.getHours();
      const horarios = [11, 12, 13, 14, 20, 21, 22, 23];

      // Filtra horarios mayores a la hora actual y convierte a strings
      this.horasDisponibles = horarios
        .filter((hora) => hora > horaActual)
        .map((hora) => hora.toString());
    } else {
      // Si no es hoy, mostrar todos los horarios disponibles
      this.horasDisponibles = ['11', '12', '13', '14', '20', '21', '22', '23'];
    }

    console.log('Horas Disponibles:', this.horasDisponibles);
  }

  onFechaSeleccionadaChange(event: any) {
    // Actualiza las horas disponibles al cambiar la fecha seleccionada
    this.fechaSeleccionada = event.detail.value;
    this.generarHorasDisponibles();

    // Actualizar la fecha en el control del formulario
    this.form.get('fecha')?.setValue(this.fechaSeleccionada);
    console.log(
      'Fecha seleccionada:',
      this.fechaSeleccionada,
      this.horasDisponibles
    );
  }

  async confirmarReserva() {
    if (!this.usuario) {
      this.toast.showError(
        'Debes iniciar sesión para realizar una reserva.',
        'bottom'
      );
      return;
    }

    const fechaString = this.form.get('fecha').value; // Formato esperado: "YYYY-MM-DD"
    console.log(fechaString);

    if (!fechaString) {
      this.toast.showError('Fecha u hora no seleccionada.', 'bottom');
      return;
    }

    // Construir el string completo con formato correcto
    const fechaSeleccionada = new Date(fechaString);

    // Validar que la fecha sea válida
    if (isNaN(fechaSeleccionada.getTime())) {
      this.toast.showError('Fecha u hora inválida.', 'bottom');
      return;
    }

    const cantidadComensales = this.form.get('cantidadComensales').value;

    // Crear instancia de la clase Reserva
    const reserva = new Reserva();
    reserva.cliente = <Cliente>this.usuario;
    reserva.fecha = fechaSeleccionada;
    reserva.comensales = cantidadComensales;
    reserva.estado = EstadoReserva.pendienteConfirmacion;

    // Obtener mesas disponibles
    let mesaDisponible: Mesa | undefined;
    mesaDisponible = await this.obtenerMesaDisponible(
      fechaSeleccionada,
      cantidadComensales
    );

    if (!mesaDisponible) {
      this.toast.showError(
        'No hay mesas disponibles para el día y horario seleccionados.',
        'bottom'
      );
      return;
    }

    reserva.mesa = mesaDisponible;

    console.log(reserva);

    try {
      // Verificar si el usuario actual tiene reservas
      if (
        (<Cliente>this.usuario).reserva?.estado ==
          EstadoReserva.pendienteConfirmacion ||
        (<Cliente>this.usuario).reserva?.estado == EstadoReserva.confirmada
      ) {
        this.toast.showError('Ya tienes una reserva activa.', 'middle');
        return;
      }

      const docRef = await this.dataService.saveObject(
        { ...reserva },
        'reservas'
      );
      reserva.id = docRef;

      // Asegurar que la propiedad reservas esté inicializada
      mesaDisponible.reservas = mesaDisponible.reservas || [];

      // Agregar reserva a la colección de la mesa
      mesaDisponible.reservas = [...mesaDisponible.reservas, reserva]; // Agregar la reserva
      await this.dataService.updateObjectFieldSerializable(
        'mesas',
        mesaDisponible.id,
        'reservas',
        mesaDisponible.reservas
      );

      // Guardar la reserva en la colección del usuario
      // <Cliente>this.usuario.reserva.push(reserva); // Agregar la reserva.toPlainObject();
      (<Cliente>this.usuario).reserva = reserva.toPlainObject();
      console.log('usuario reservas:', this.usuario);
      await this.dataService.updateObjectField(
        'usuarios',
        this.usuario.id,
        'reserva',
        (<Cliente>this.usuario).reserva
      );

      this.toast.showExito('Reserva creada con éxito', 'bottom');
      this.inicio();
    } catch (error) {
      this.toast.showError(
        'Error al crear la reserva. Intenta nuevamente.',
        'bottom'
      );
      console.error('Error al guardar la reserva:', error);
    }
  }

  private async obtenerMesaDisponible(
    fecha: Date,
    comensales: number
  ): Promise<Mesa | undefined> {
    const mesas = (await this.dataService.getCollectionData('mesas')) as Mesa[];

    for (const mesa of mesas) {
      // Verificar si la mesa cumple con el número mínimo de comensales
      if (mesa.nroComensales >= comensales) {
        // Asegurarse de que la propiedad reservas esté definida como un array
        const reservas = mesa.reservas || [];

        // Verificar si la mesa está ocupada en la fecha seleccionada
        const mesaOcupada = reservas.some(
          (r) =>
            new Date(r.fecha).getTime() === fecha.getTime() &&
            r.estado !== EstadoReserva.cancelada
        );

        // Si la mesa no está ocupada, devolverla
        if (!mesaOcupada) {
          return mesa;
        }
      }
    }

    // Si no hay mesas disponibles, devolver undefined
    return undefined;
  }
}
