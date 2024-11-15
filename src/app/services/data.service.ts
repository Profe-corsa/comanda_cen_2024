import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  updateDoc,
  docData,
  CollectionReference,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Usuario } from '../clases/usuario';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private coleccion: any;

  constructor(private firestore: Firestore, private toast: ToastService) {}

  async saveObject(objeto: any, collectionName: string): Promise<void> {
    try {
        const collectionRef = collection(this.firestore, collectionName) as CollectionReference;

        // Verifica si el objeto ya tiene un ID. Si no, crea uno nuevo con `addDoc`
        if (!objeto.id) {
            // Usa addDoc para crear el documento y obtener el uid generado
            const docRef = await addDoc(collectionRef, objeto);
            // Actualiza el campo `id` en el documento
            await updateDoc(docRef, { id: docRef.id });
        } else {
            // Si el objeto ya tiene un ID, usa setDoc para actualizarlo
            const docRef = doc(collectionRef, objeto.id);
            await setDoc(docRef, objeto);
        }

        this.toast.showExito(`Se guardó un registro en la colección: ${collectionName}`, 'middle');
    } catch (error) {
        this.toast.showError(`Error al guardar el objeto en la colección ${collectionName}`, 'middle');
        throw error;
    }
  }
  //Verifica que el cliente esté en la lista de espera y que tenga el estado pendiente.
  async asignarMesa(numeroMesa: number, idCliente: string): Promise<void> {
    try {
      const clienteRef = doc(this.firestore, `listaEspera/${idCliente}`);
      const clienteSnap = await getDoc(clienteRef);

      if (!clienteSnap.exists()) {
        throw new Error('El cliente no está en la lista de espera.');
      }

      const clienteData = clienteSnap.data();
      if (clienteData && clienteData['estado'] !== 'pendiente') {
        throw new Error(
          'El cliente no está pendiente para ser asignado a una mesa.'
        );
      }

      // Consulta la mesa por el número de mesa
      const mesasRef = collection(this.firestore, 'mesas');
      const mesaQuery = query(mesasRef, where('numeroMesa', '==', numeroMesa));
      const mesaSnap = await getDocs(mesaQuery);

      if (mesaSnap.empty) {
        throw new Error(`No se encontró una mesa con el número ${numeroMesa}.`);
      }

      const mesaDoc = mesaSnap.docs[0];
      const mesaRef = mesaDoc.ref;

      await updateDoc(mesaRef, {
        idClienteAsignado: idCliente,
        estado: 'reservada',
      });
      await updateDoc(clienteRef, { estado: 'asignado' });

      this.toast.showExito(
        `Mesa ${numeroMesa} asignada al cliente ${idCliente}`,
        'middle'
      );
    } catch (error) {
      this.toast.showError(`Error al asignar mesa: ${numeroMesa}`, 'middle');
      throw error;
    }
  }

  // Verifica si el cliente tiene acceso a la mesa usando el número de mesa
  async verificarAccesoAMesa(
    numeroMesa: number,
    idCliente: string
  ): Promise<boolean> {
    try {
      // Consulta la mesa por el número de mesa
      const mesasRef = collection(this.firestore, 'mesas');
      const mesaQuery = query(mesasRef, where('numeroMesa', '==', numeroMesa));
      const mesaSnap = await getDocs(mesaQuery);

      if (mesaSnap.empty) {
        throw new Error(`No se encontró una mesa con el número ${numeroMesa}.`);
      }

      const mesaDoc = mesaSnap.docs[0];
      const mesaData = mesaDoc.data();

      if (mesaData && mesaData['idClienteAsignado'] !== idCliente) {
        throw new Error('El cliente no está asignado a esta mesa.');
      }

      const clienteRef = doc(this.firestore, `listaEspera/${idCliente}`);
      const clienteSnap = await getDoc(clienteRef);

      if (!clienteSnap.exists()) {
        throw new Error('El cliente no está en la lista de espera.');
      }

      const clienteData = clienteSnap.data();
      if (clienteData && clienteData['estado'] !== 'asignado') {
        throw new Error('El cliente no está asignado a una mesa.');
      }

      this.toast.showExito(
        `El cliente ${idCliente} puede tomar la mesa ${numeroMesa}`,
        'middle'
      );
      return true;
    } catch (error) {
      this.toast.showError(
        `Error en el acceso a la mesa: ${numeroMesa}`,
        'middle'
      );
      throw error;
    }
  }
}
