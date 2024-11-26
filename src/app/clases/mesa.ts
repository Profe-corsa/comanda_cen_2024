import { Estados } from './enumerados/Estados';
import { Reserva } from './Reserva';

export class Mesa {
  id: string = '';
  numero: number = 0;
  nroComensales: number = 0; //capacidad
  tipo: string = '';
  foto: string = '';
  estado: string = '';
  idClienteAsignado?: string = '';
  reservas: Reserva[] = [];
  constructor() {
    this.reservas = [];
  }
}
