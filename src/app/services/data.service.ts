import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
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

}
