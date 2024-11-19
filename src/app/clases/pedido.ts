export enum Estado{
    pendiente = "pendiente",
    tomado = "tomado",
    enProceso= "supervisor",
    pendienteDePago= "pendiente de pago",
    finalizado = "finalizado"
}

export class Pedido {
    tiempoEstimado: number = 0;
    clienteId: string = '';
    productos: any[] = [];
    precioTotal: number = 0;
    estado: Estado = Estado.pendiente;
    toJSON() {
        return {
            tiempoEstimado: this.tiempoEstimado,
            clienteId: this.clienteId,
            productos: this.productos,
            precioTotal: this.precioTotal,
            estado: this.estado,
        };
    }
    calcularTiempoEstimado() {
        this.tiempoEstimado = Math.max(
            ...this.productos.map((producto) => producto.tiempoEstimado || 0)  // Asegúrate de que el tiempo de preparación exista
        );
    }
}
  