import { Usuario } from './usuario';
import { Mesa } from './mesa';
import { Consulta } from './consulta';
import { Pedido } from './pedido';

export class Cliente extends Usuario {
  consulta?: Consulta[];
  mesa?: Mesa;
  pedido?: Pedido[];
}
