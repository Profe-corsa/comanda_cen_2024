export enum EstadoConsulta {
  Respondida = 'respondida',
  Leida = 'leída',
  Enviada = 'enviada',
}

export class Consulta {
  id?: string;
  idMesa?: string;
  idCliente: string;
  tipoCliente?: string; // Puede ser 'cliente' o 'anonimo'
  nroMesa?: number;
  textoConsulta?: string;
  respuesta?: string;
  estado?: EstadoConsulta;
  fecha?: string; // Fecha de la consulta (formato legible)
  timestamp?: number; // Timestamp para ordenar cronológicamente
  idMozo?: string; // ID del mozo que respondió, si aplica
  nombreMozo?: string; // Nombre del mozo que respondió, si aplica

  constructor(
    idMesa: string,
    idCliente: string,
    tipoCliente: string,
    nroMesa: number,
    textoConsulta: string
  ) {
    this.id = ''; // Se asignará automáticamente en Firebase
    this.idMesa = idMesa;
    this.idCliente = idCliente;
    this.tipoCliente = tipoCliente;
    this.nroMesa = nroMesa;
    this.textoConsulta = textoConsulta;
    this.respuesta = '';
    this.estado = EstadoConsulta.Enviada;
    this.fecha = new Date().toLocaleString();
    this.timestamp = new Date().getTime();
    this.idMozo = '';
    this.nombreMozo = '';
  }
}
