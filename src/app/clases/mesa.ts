import { Reserva, EstadoReserva } from './reserva';
import { Estados } from './enumerados/Estados';

export class Mesa {
  id: string = '';
  numero: number = 0;
  nroComensales: number = 0; //capacidad
  tipo: string = '';
  foto: string = '';
  estado: string = '';
  reservas: Reserva[];

  constructor() {
    this.reservas = [];
  }
}
