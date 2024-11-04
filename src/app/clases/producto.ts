import { Sectores } from './enums/sectores';

export enum TipoProducto {
    comida,
    bebida,
    postre,
}

export class Producto {
    id:string;
    nombre:string;
    descripcion:string;
    tiempoPreparacion:number;
    precio:number;
    fotos:string[];
    sector:Sectores;
    tipo:TipoProducto;
    estado?:string;
    cantidad?:number;
    idPedido?:string;
}
