import { Producto } from './producto';
import { Estados } from './enums/estados';
import { ProductoService } from '../servicios/producto.service';
import { Mesa } from './mesa';

export class Pedido {
    id?: string;
    productos:Producto[];
    mesa:Mesa;
    idCliente:string;
    precioTotal?:number;
    estado?:Estados;
    horaPedido:any;
    propina?:number;

    constructor(productos:Producto[], idCliente:string, mesa:Mesa) {
        
        productos.map(producto => {
            producto.estado = Estados.enPreparacion;
        });

        this.productos = productos;
        this.precioTotal = Pedido.calcularPrecioTotal(productos);
        this.idCliente = idCliente;
        this.mesa = mesa;
        this.horaPedido = new Date();
        this.estado = Estados.esperandoConfirmacionMozo; //Si están todos los productos listos, cambiar a "listo para entregar"

    }


    ///Calula el precio total del listado de productos que recibe
    static calcularPrecioTotal(productos:Producto[]):number {
        let total = 0;

        for(let auxProducto of productos) {
            total += (auxProducto.precio * auxProducto.cantidad);
        }

        return total;
    }

    static calcularPrecioTotalPedido(pedido:Pedido):number {
        let total = 0;

        for(let auxProducto of pedido.productos) {
            total += (auxProducto.precio * auxProducto.cantidad);
        }

        return total;
    }
}
