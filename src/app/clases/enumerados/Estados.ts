export enum Estados {
  // cliente
  pendienteDeAprobacion = 'pendienteAprobacion', //el dueño/supervisor todavía no aprobó el registro
  aprobado = 'aprobado', //el dueño/supervisor aprobó el registro
  sinAtender = 'sinAtender',
  enEspera = 'enEspera', //en lista de espera
  puedeTomarMesa = 'puedeTomarMesa',
  paraConfirmarPedido = 'para confirmar pedido', //el cliente necesita confirmar recepcion
  atendido = 'atendido', //comiendo
  pagando = 'pagando', //comiendo
  mesaAsignada = 'mesaAsignada',
  esperandoOrden = 'esperandoOrden', //ya hizo su pedido
  finalizado = 'finalizado', // ya pago
  tieneReserva = 'tieneReserva',
  rechazado = 'rechazado', //lo hace el metre o el supervisor/dueño
}
