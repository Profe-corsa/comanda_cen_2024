export enum TipoProducto {
  comida,
  bebida,
  postre,
}

export class Producto {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  tiempoPreparacion: number = 0;
  precio: number = 0;
  fotos: string[] = [];
  tipo: TipoProducto = TipoProducto.comida;
  estado?: string;
  cantidad?: number;
  idPedido?: string;
}
