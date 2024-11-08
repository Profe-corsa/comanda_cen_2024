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
      const colectionRef = collection(
        this.firestore,
        collectionName
      ) as CollectionReference;

      const docRef = objeto.id
        ? doc(colectionRef, objeto.id)
        : doc(colectionRef);

      await setDoc(docRef, objeto);

      this.toast.showExito(
        `Se guardó un registro en la colección: ${collectionName}`,
        'middle'
      );
    } catch (error) {
      this.toast.showError(
        `Error al guarda el objeto en la coleccion ${collectionName}`,
        'middle'
      );
      throw error;
    }
  }
}
