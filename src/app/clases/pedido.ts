export enum Estado {
  pendiente = 'pendiente', //Estado inicial del pedido instanciado.
  tomado = 'tomado',
  enPreparacion = 'en preparación', //El mozo acepto el pedido y va a las respectivas àreas
  pendienteDePago = 'pendiente de pago', //El Cliente pidiò la cuenta
  finalizado = 'finalizado',
  entregado = 'entregado', //Cuando el mozo se lo lleva a la mesa
  recibido = 'recibido', //El cliente tiene el pedido en la mesa
  cuentaPedida = 'cuentaPedida',
  cuentaEnviada = 'cuentaEnviada',
  pagado = 'pagado', //Finalizò el pago del pedido
}

export class Pedido {
  id: string = '';
  tiempoEstimado: number = 0;
  clienteId: string = '';
  productos: any[] = [];
  precioTotal: number = 0;
  estado: Estado = Estado.pendiente;
  nroMesa: string = '';
  hora: any;
  constructor() {
    this.hora = new Date();
  }
  toJSON() {
    return {
      tiempoEstimado: this.tiempoEstimado,
      clienteId: this.clienteId,
      productos: this.productos,
      precioTotal: this.precioTotal,
      estado: this.estado,
      nroMesa: this.nroMesa,
      hora: this.hora,
      id: this.id,
    };
  }
  calcularTiempoEstimado() {
    this.tiempoEstimado = Math.max(
      ...this.productos.map((producto) => producto.tiempoEstimado || 0) // Asegúrate de que el tiempo de preparación exista
    );
  }
}
