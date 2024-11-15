export enum TipoProducto {
  Comida = 'comida',
  Bebida = 'bebida',
  Postre = 'postre'
}


export class Producto {
  id: string = '';
  nombre: string = '';
  descripcion: string = '';
  tiempoPreparacion: number = 0;
  precio: number = 0;
  fotos: string[] = [];
  tipo: TipoProducto = TipoProducto.Comida;

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      tiempoPreparacion: this.tiempoPreparacion,
      precio: this.precio,
      fotos: this.fotos,
      tipo: this.tipo,
    };
  }
}
