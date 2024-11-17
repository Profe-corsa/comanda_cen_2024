import { Usuario } from './usuario';
import { Mesa } from './mesa';
import { Consulta } from './consulta';

export class Cliente extends Usuario {
  consulta?: Consulta[];
  mesa?: Mesa;
}
