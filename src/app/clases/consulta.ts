export enum EstadoConsulta {
  respondida = 'respondida',
  leida = 'leída',
  enviada = 'enviada',
}

export class Consulta {
  id: string = '';
  idMesa: string = '';
  idCliente: string = '';
  nroMesa: number = 0;
  textoConsulta: string;
  respuesta: string;
  estado: string;
  hora: any;

  constructor() {
    this.textoConsulta = '';
    this.respuesta = '';
    this.estado = EstadoConsulta.enviada;
  }
}
