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
  mesaAsignada = 'mesaAsignada', //lo pone el metre
  mesaTomada = 'mesaTomada', // el cliente aceptó la mesa que le asignó el metre
  esperandoOrden = 'esperandoOrden',
  finalizado = 'finalizado',
  tieneReserva = 'tieneReserva',
  rechazado = 'rechazado',
}
