import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Encuesta } from '../clases/encuesta';

@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  private collectionName = 'encuestas';

  constructor(private firestore: AngularFirestore) {}

  // Crear una nueva encuesta
  createEncuesta(encuesta: Encuesta): Promise<any> {
    const encuestaData = {
      preguntas: encuesta.preguntas,
      tipo: encuesta.tipo,
      usuario: encuesta.usuario
        ? {
            id: encuesta.usuario.id,
            nombre: encuesta.usuario.nombre,
            email: encuesta.usuario.email,
          }
        : null, // Solo guardar datos básicos del usuario
      fecha: new Date(), // Agregar la fecha de creación
    };

    return this.firestore.collection(this.collectionName).add(encuestaData);
  }

  // Obtener todas las encuestas
  getEncuestas() {
    return this.firestore.collection(this.collectionName).snapshotChanges();
  }

  // Obtener encuestas por tipo
  getEncuestasByTipo(tipo: string) {
    return this.firestore
      .collection(this.collectionName, (ref) => ref.where('tipo', '==', tipo))
      .snapshotChanges();
  }

  // Obtener encuestas por usuario
  getEncuestasByUsuario(usuarioId: string) {
    return this.firestore
      .collection(this.collectionName, (ref) =>
        ref.where('usuario.id', '==', usuarioId)
      )
      .snapshotChanges();
  }

  // Eliminar una encuesta
  deleteEncuesta(id: string): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(id).delete();
  }

  // Actualizar una encuesta
  updateEncuesta(id: string, data: Partial<Encuesta>): Promise<void> {
    return this.firestore.collection(this.collectionName).doc(id).update(data);
  }
}
