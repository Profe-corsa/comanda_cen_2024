import { Usuario } from './usuario';
import { Mesa } from './mesa';
import { Consulta } from './consulta';
import { Pedido } from './pedido';
import { Reserva } from './Reserva';

export class Cliente extends Usuario {
  consulta?: Consulta[];
  mesa?: Mesa;
  pedido?: Pedido[];
  reserva?: Reserva;
}
