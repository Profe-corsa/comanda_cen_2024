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
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuariosCollection;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.usuariosCollection = collection(
      this.firestore,
      'usuarios'
    ) as CollectionReference;
  }

  // Registra un usuario.
  // Si se registra, devuelve el usuario.
  // Si no, devuelve una excepción que se tiene que manejar
  async saveUserWithEmailAndPassword(user: Usuario): Promise<Usuario> {
    console.log('saveUserWithEmailAndPassword', user);
    try {
      const credenciales = await this.authService.register(
        user.email,
        user.password
      );
      user.id = credenciales.user?.uid ?? ''; // Asigna el UID al usuario si está disponible
      await this.saveUser(user);
      return user;
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      throw error;
    }
  }

  // Guarda un usuario específico con su ID en Firestore
  async saveUser(user: Usuario): Promise<void> {
    const userDocRef = doc(this.usuariosCollection, user.id); // Ref al documento con ID del usuario
    await setDoc(userDocRef, { ...user });
  }

  // Crea un nuevo documento de usuario en Firestore y devuelve su referencia
  async createUsuario(user: Usuario): Promise<any> {
    const docRef = await addDoc(this.usuariosCollection, { ...user });
    return docRef; // Devuelve la referencia del documento creado
  }

  async updateUser(id: string, object: any): Promise<void> {
    // Obtiene la referencia al documento del usuario en la colección "usuarios" usando su ID
    const userDocRef = doc(this.usuariosCollection, id);

    // Convierte el objeto a un objeto plano de JavaScript y actualiza el documento
    await updateDoc(userDocRef, { ...object });
  }

  getUser(userId: string): Observable<Usuario> {
    // Creamos una referencia al documento específico en la colección 'usuarios'
    const userDocRef = doc(this.usuariosCollection, userId);
    // Usamos `docData` para obtener los datos del documento como un Observable
    return docData(userDocRef, { idField: 'id' }) as Observable<Usuario>;
  }

  async getUserPromise(idUsuario: string): Promise<Usuario | undefined> {
    try {
      // Crea la referencia al documento del usuario
      const userDocRef = doc(this.firestore, `usuarios/${idUsuario}`);
      // Usa `docData` para obtener los datos del documento
      const userData = await firstValueFrom(
        docData(userDocRef, { idField: 'id' })
      );
      return userData as Usuario;
    } catch (error) {
      console.error('Error al obtener el usuario con promesa:', error);
      throw error;
    }
  }
  async getIfExists(
    collectionName: string,
    clienteId: string,
    fechaActual: Date
  ): Promise<any> {
    try {
      const collectionRef = collection(this.firestore, collectionName);
      const usuariosQuery = query(
        collectionRef,
        where('clienteId', '==', clienteId),
        where('fecha', '==', fechaActual.toLocaleDateString())
      );
      const querySnapshot = await getDocs(usuariosQuery);
  
      if (!querySnapshot.empty) {
        const record = querySnapshot.docs[0].data();
        console.log(
          `Se encontró un documento en ${collectionName} con clienteId = ${clienteId}:`,
          record
        );
        return record;
      } else {
        console.log(
          `No se encontró ningún documento en ${collectionName} con clienteId = ${clienteId}`
        );
        return null; // No se encontró ningún documento
      }
    } catch (error) {
      console.error(
        `Error al buscar documentos en ${collectionName} con clienteId = ${clienteId}:`,
        error
      );
      return null; // En caso de error, retorna null
    }
  }
  
  
  
  
  
  obtenerUsuariosPorPerfil(perfil: string): Observable<Usuario[]> {
    let usuariosQuery;

    usuariosQuery = query(
      this.usuariosCollection,
      where('perfil', '==', perfil)
    );

    // Ejecutar la consulta y devolver los resultados como un Observable
    return from(getDocs(usuariosQuery)).pipe(
      map((querySnapshot) => {
        const usuarios: Usuario[] = [];
        querySnapshot.forEach((doc) => {
          usuarios.push({ id: doc.id, ...doc.data() } as Usuario);
        });
        return usuarios;
      })
    );
  }

  async setDocument(
    collectionName: string,
    id: string,
    object: object
  ): Promise<void> {
    try {
      const documentRef = doc(this.firestore, `${collectionName}/${id}`);
      // Usa 'setDoc' para establecer el contenido del documento
      await setDoc(documentRef, object);
      console.log(
        `Documento ${id} en la colección ${collectionName} se ha guardado correctamente.`
      );
    } catch (error) {
      console.error(
        `Error al guardar el documento ${id} en la colección ${collectionName}: `,
        error
      );
      throw error;
    }
  }

  // Actualiza un campo específico de un usuario en Firestore
  async updateUserField(
    userId: string,
    fieldName: string,
    fieldValue: any
  ): Promise<void> {
    try {
      const userDocRef = doc(this.usuariosCollection, userId);

      // Crea un objeto con el campo a actualizar
      const updateObject = {
        [fieldName]: fieldValue,
      };

      await updateDoc(userDocRef, updateObject);
      console.log(
        `Campo ${fieldName} del usuario ${userId} actualizado correctamente.`
      );
    } catch (error) {
      console.error(
        `Error al actualizar el campo ${fieldName} del usuario ${userId}:`,
        error
      );
      throw error;
    }
  }

  // Actualiza múltiples campos de un usuario en Firestore
  async updateUserFields(userId: string, updateData: any): Promise<void> {
    try {
      const userDocRef = doc(this.usuariosCollection, userId);

      // Actualizar múltiples campos al mismo tiempo
      await updateDoc(userDocRef, updateData);
      console.log(`Campos del usuario ${userId} actualizados correctamente.`);
    } catch (error) {
      console.error(
        `Error al actualizar los campos del usuario ${userId}:`,
        error
      );
      throw error;
    }
  }
}
