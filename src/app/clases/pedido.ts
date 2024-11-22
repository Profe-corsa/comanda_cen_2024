export enum Estado {
  pendiente = 'pendiente',
  tomado = 'tomado',
  enPreparacion = 'en preparación',
  pendienteDePago = 'pendiente de pago',
  finalizado = 'finalizado',
}

export class Pedido {
  id: string = '';
  tiempoEstimado: number = 0;
  clienteId: string = '';
  productos: any[] = [];
  precioTotal: number = 0;
  estado: Estado = Estado.pendiente;
  nroMesa: string = '';
  fecha : string;
  hora : string;
  constructor() {
    const now = new Date();
    this.fecha = now.toLocaleDateString(); // Formato local: DD/MM/YYYY o similar
    this.hora = now.toLocaleTimeString(); // Formato local: HH:MM:SS AM/PM
  }
  toJSON() {
    return {
      tiempoEstimado: this.tiempoEstimado,
      clienteId: this.clienteId,
      productos: this.productos,
      precioTotal: this.precioTotal,
      estado: this.estado,
      nroMesa: this.nroMesa,
      fecha: this.fecha,
      hora: this.hora,
    };
  }
  calcularTiempoEstimado() {
    this.tiempoEstimado = Math.max(
      ...this.productos.map((producto) => producto.tiempoEstimado || 0) // Asegúrate de que el tiempo de preparación exista
    );
  }
}
