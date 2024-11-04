import { Usuario } from './usuario';

export enum TipoEncuesta{
    empleado = "empleado",
    supervisor= "supervisor",
    cliente= "cliente"
}

export interface Pregunta {
    pregunta:string;
    respuesta:string;
}
  

export class Encuesta {
    id?:string;
    preguntas:Pregunta[];
    tipo:TipoEncuesta;
    usuario?:Usuario;

    constructor(preguntas:Pregunta[], tipo:TipoEncuesta, usuario?:Usuario) {
        this.preguntas = preguntas;
        
        if(this.usuario != undefined) {
            this.usuario = usuario;
        }
        
        this.tipo = tipo;

    }

}
