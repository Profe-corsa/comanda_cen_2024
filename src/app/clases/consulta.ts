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
  respuesta: { mensaje: string; mozo: string; hora: Date | null };
  estado: string;
  hora: any;
  nombreCliente: string = '';

  constructor() {
    this.textoConsulta = '';
    this.respuesta = {
      mensaje: '',
      mozo: '',
      hora: null,
    };

    this.estado = EstadoConsulta.enviada;
  }
}
