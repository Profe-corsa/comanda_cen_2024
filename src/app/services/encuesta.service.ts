import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Encuesta } from '../clases/encuesta';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class EncuestaService {
  private collectionName = 'encuestas';
  private encuestasCollection;
  
  constructor(private firestore: Firestore, private dataService: DataService) {
    this.encuestasCollection = collection(this.firestore, 'encuestas');
  }

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

    return addDoc(this.encuestasCollection, { ...encuesta });
  }

  // Obtener todas las encuestas
  getEncuestas() {
    return this.dataService.getCollectionData('encuestas');
  }

}
