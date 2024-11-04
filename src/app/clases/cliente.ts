import { Usuario } from './usuario';
import { Mesa } from './mesa';
import { Pedido } from './pedido';
import { Consulta } from './consulta';
import { Reserva } from './reserva';

export class Cliente extends Usuario {
    
    mesa?:Mesa;
    pedido?:Pedido;
    consulta?:Consulta[];
    reserva?:Reserva;
}
