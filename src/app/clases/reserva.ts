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
      mesa: { id: this.mesa.id, nroComensales: this.mesa.nroComensales }, // Serializa solo los datos necesarios de Mesa
    };
  }
}
