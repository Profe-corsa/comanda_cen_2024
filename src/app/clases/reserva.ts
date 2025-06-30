import { Mesa } from './mesa';
import { Cliente } from './cliente';

export enum EstadoReserva {
  pendienteConfirmacion = 'pendiente', //Estado inicial
  confirmada = 'confirmada', //Cuando el dueno acepta la reserva
  cancelada = 'cancelada', //Cuando se cancela tanto por el dueño como por vencimiento
  finalizada = 'finalizada', //Cuando el cliente escanea el QR
}

export class Reserva {
  id?: string;
  cliente: Cliente = new Cliente();
  mesa: Mesa = new Mesa();
  fecha: any;
  comensales: number = 0;
  estado: EstadoReserva;

  constructor() {
    this.estado = EstadoReserva.pendienteConfirmacion;
  }

  toPlainObject(): any {
    return {
      id: this.id,
      cliente: { id: this.cliente.id, nombre: this.cliente.nombre }, // Incluye solo los campos necesarios
      fecha: this.fecha instanceof Date ? this.fecha.toISOString() : this.fecha, // Asegúrate de convertir `Date` a string
      comensales: this.comensales,
      estado: this.estado,
      mesa: {
        id: this.mesa.id,
        nroComensales: this.mesa.nroComensales,
        numero: this.mesa.numero,
      }, // Serializa solo los datos necesarios de Mesa
    };
  }

  //Método para verificar si la reserva se encuentra dentro del horario de acceso a la mesa
  static evaluarHorarioReserva(reserva: Reserva): boolean {
    let enHorario = false;

    // Convertir la fecha de la reserva a UTC
    const reservaDate = new Date(reserva.fecha);
    const horarioReservaUTC = Math.floor(reservaDate.getTime() / 1000); // Timestamp en segundos UTC

    // Obtener la hora actual en UTC
    const ahora = new Date();
    const horaConsultaUTC = Math.floor(ahora.getTime() / 1000); // Timestamp en segundos UTC
    const horaActual = horaConsultaUTC - 10800; //Le resto 3 horas por la diferencia horaria.

    // Calcular el rango de tiempo permitido en UTC
    const horarioMinReserva = horarioReservaUTC - 600; // 10 minutos antes
    const horarioMaxReserva = horarioReservaUTC + 1200; // 20 minutos después

    // Comparar si la hora actual está dentro del rango
    if (
      reserva.estado == EstadoReserva.confirmada &&
      horaActual >= horarioMinReserva &&
      horaActual <= horarioMaxReserva
    ) {
      enHorario = true;
    } else {
      console.log('Fuera del horario permitido');
    }

    console.log('En horario:', enHorario);
    return enHorario;
  }

  //Método para chequear si se excedió el tiempo de la reserva
  static evaluarReservaVencida(reserva: Reserva): boolean {
    let reservaVencida = false;

    // Obtener la hora actual en UTC
    const ahora = new Date();
    const horaConsultaUTC = Math.floor(ahora.getTime() / 1000); // Timestamp en segundos UTC
    const horaActual = horaConsultaUTC - 10800; //Le resto 3 horas por la diferencia horaria.
    console.log('Hora actual:', horaActual);

    // Convertir la fecha de la reserva a UTC
    const reservaDate = new Date(reserva.fecha);
    const horarioReservaUTC = Math.floor(reservaDate.getTime() / 1000); // Timestamp en segundos UTC
    let horarioMaxReserva = horarioReservaUTC + 1200;

    console.log('Hora reserva:', horarioMaxReserva);

    if (
      reserva.estado == EstadoReserva.confirmada &&
      horaActual > horarioMaxReserva
    ) {
      reservaVencida = true;
    }

    console.log('Reserva vencida: ' + reservaVencida);

    return reservaVencida;
  }
}
