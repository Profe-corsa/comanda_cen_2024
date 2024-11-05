import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  docData,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Usuario } from '../clases/usuario';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private usuariosCollection;

  constructor(private firestore: Firestore, private authService: AuthService) {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
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
}
