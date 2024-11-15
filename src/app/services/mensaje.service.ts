import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  collectionData,
  getDocs,
  query,
  where,
  deleteDoc,
} from '@angular/fire/firestore';
import { Consulta, EstadoConsulta } from '../clases/consulta';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MensajesService {
  private consultasCollection = collection(this.firestore, 'consultas');

  constructor(private firestore: Firestore) {}

  /**
   * Agregar una nueva consulta a Firestore.
   * @param consulta Objeto de tipo Consulta
   */
  async addConsulta(consulta: Consulta): Promise<void> {
    try {
      const docRef = doc(this.consultasCollection);
      consulta.id = docRef.id; // Asignar ID generado automáticamente
      await setDoc(docRef, { ...consulta });
    } catch (error) {
      console.error('Error al agregar consulta:', error);
      throw new Error('No se pudo agregar la consulta.');
    }
  }

  /**
   * Obtener todas las consultas (opcionalmente filtradas por estado).
   * @param estado Estado de la consulta (opcional)
   * @returns Observable de Consulta[]
   */
  getConsultas(estado?: EstadoConsulta): Observable<Consulta[]> {
    if (estado) {
      const q = query(this.consultasCollection, where('estado', '==', estado));
      return collectionData(q, { idField: 'id' }) as Observable<Consulta[]>;
    }
    return collectionData(this.consultasCollection, {
      idField: 'id',
    }) as Observable<Consulta[]>;
  }

  /**
   * Actualizar una consulta existente.
   * @param id ID de la consulta
   * @param data Datos a actualizar (parcial de Consulta)
   */
  async updateConsulta(id: string, data: Partial<Consulta>): Promise<void> {
    try {
      const consultaDoc = doc(this.consultasCollection, id);
      await updateDoc(consultaDoc, data);
    } catch (error) {
      console.error('Error al actualizar consulta:', error);
      throw new Error('No se pudo actualizar la consulta.');
    }
  }

  /**
   * Responder una consulta y actualizar su estado.
   * @param id ID de la consulta
   * @param respuesta Respuesta del mozo
   * @param idMozo ID del mozo que responde
   * @param nombreMozo Nombre del mozo que responde
   */
  async responderConsulta(
    id: string,
    respuesta: string,
    idMozo: string,
    nombreMozo: string
  ): Promise<void> {
    try {
      const consultaDoc = doc(this.consultasCollection, id);
      await updateDoc(consultaDoc, {
        respuesta,
        estado: EstadoConsulta.Respondida,
        idMozo,
        nombreMozo,
        fecha: new Date().toLocaleString(),
      });
    } catch (error) {
      console.error('Error al responder consulta:', error);
      throw new Error('No se pudo responder la consulta.');
    }
  }

  /**
   * Eliminar una consulta por su ID.
   * @param id ID de la consulta a eliminar
   */
  async deleteConsulta(id: string): Promise<void> {
    try {
      const consultaDoc = doc(this.consultasCollection, id);
      await deleteDoc(consultaDoc);
    } catch (error) {
      console.error('Error al eliminar consulta:', error);
      throw new Error('No se pudo eliminar la consulta.');
    }
  }

  /**
   * Obtener una lista de consultas como promesa.
   * @returns Array de Consulta[]
   */
  // async getConsultasList(): Promise<Consulta[]> {
  //   try {
  //     const snapshot = await getDocs(this.consultasCollection);
  //     return snapshot.docs.map((doc) => ({
  //       id: doc.id,
  //       ...doc.data(),
  //     })) as Consulta[];
  //   } catch (error) {
  //     console.error('Error al obtener la lista de consultas:', error);
  //     throw new Error('No se pudo obtener la lista de consultas.');
  //   }
  // }

  async getConsultasList(idUsuario: string): Promise<Consulta[]> {
    try {
      const q = query(
        this.consultasCollection,
        where('usuario', '==', idUsuario)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Consulta[];
    } catch (error) {
      console.error('Error al obtener la lista de consultas:', error);
      throw new Error('No se pudo obtener la lista de consultas.');
    }
  }

  // mensajes.service.ts
  async enviarMensajeCliente(
    mensaje: string,
    idUsuario: string
  ): Promise<Consulta> {
    try {
      const nuevaConsulta: Consulta = {
        idCliente: idUsuario,
        textoConsulta: mensaje,
      };
      await this.addConsulta(nuevaConsulta);
      return nuevaConsulta;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw new Error('No se pudo enviar el mensaje.');
    }
  }
}
