export enum Estados {
  // cliente
  pendienteDeAprobacion = 'pendienteAprobacion',
  aprobado = 'aprobado',
  enEspera = 'enEspera',
  sinAtender = 'sinAtender',
  puedeTomarMesa = 'puedeTomarMesa',
  paraConfirmarPedido = 'para confirmar pedido',
  atendido = 'atendido',
  pagando = 'pagando',
  mesaAsignada = 'mesaAsignada',
  mesaTomada = 'mesaTomada',
  esperandoOrden = 'esperandoOrden',
  finalizado = 'finalizado',
  tieneReserva = 'tieneReserva',
  rechazado = 'rechazado',
}
