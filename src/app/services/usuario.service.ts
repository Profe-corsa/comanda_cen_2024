import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  addDoc,
} from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Usuario } from '../clases/usuario';

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

  // Crea un nuevo documento de usuario en Firestore sin especificar el ID
  async createUsuario(user: Usuario): Promise<void> {
    await addDoc(this.usuariosCollection, { ...user });
  }
}
