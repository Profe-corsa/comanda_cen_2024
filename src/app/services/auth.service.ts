import { Injectable } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  User as FirebaseUser,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { PushMailNotificationService } from './push-mail-notification.service';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../clases/usuario';
import {
  Firestore,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  doc,
} from '@angular/fire/firestore';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { Platform, isPlatform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<Usuario | null>(null); // Estado reactivo del usuario
  public user$ = this.userSubject.asObservable(); // Observable para suscribirse

  constructor(
    private auth: Auth,
    private toastService: ToastService,
    private router: Router,
    private notificationService: PushMailNotificationService,
    private firestore: Firestore,
    private platform: Platform
  ) {
    this.platform.ready().then(() => {
      if (!isPlatform('capacitor')) {
        GoogleAuth.initialize();
      }
      GoogleAuth.initialize();
    });

    this.auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const appUser = await this.loadUserData(firebaseUser);
        this.userSubject.next(appUser);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async googleSignIn() {
    try {
      // Iniciar sesión con Google
      let googleUser = await GoogleAuth.signIn();
      console.log('Usuario recibido con el login de Google:', googleUser);

      const user = googleUser;

      if (!user || !user.email) {
        throw new Error('No se pudo obtener el correo del usuario.');
      }

      // Verificar el correo en Firestore
      const userEmail = user.email;
      const usersRef = collection(this.firestore, 'usuarios');

      // Consulta en el campo "email"
      const q = query(usersRef, where('email', '==', userEmail));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        console.log('Usuario encontrado en el campo "email"');

        // Extraer datos del documento encontrado
        const userData = snapshot.docs[0].data(); // Primer documento encontrado
        return { googleUser, userData }; // Devolver Google User y datos del Firestore
      }

      // Si no se encontró, buscar en el campo "emailGoogle"
      const qGoogle = query(usersRef, where('emailGoogle', '==', userEmail));
      const snapshotGoogle = await getDocs(qGoogle);

      if (!snapshotGoogle.empty) {
        console.log('Usuario encontrado en el campo "emailGoogle"');

        // Extraer datos del documento encontrado
        const userDataGoogle = snapshotGoogle.docs[0].data(); // Primer documento encontrado
        return { googleUser, userData: userDataGoogle }; // Devolver Google User y datos del Firestore
      }

      // Si no se encontró en ninguna de las dos, devolver null
      return null;
    } catch (error: any) {
      console.error('Error en el login con Google:', error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const res = await signInWithEmailAndPassword(this.auth, email, password);
      const appUser = await this.loadUserData(res.user);
      this.userSubject.next(appUser);
      console.log('respuesta de auth', res);
      return res;
    } catch (error: any) {
      const errorMessage = this.toastService.translateFirebaseError(error.code);
      this.toastService.showError(errorMessage);
    }
  }

  async register(email: string, password: string): Promise<any> {
    try {
      const res = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      return res;
    } catch (error: any) {
      const errorMessage = this.toastService.translateFirebaseError(error.code);
      this.toastService.showError(errorMessage);
    }
  }

  getCurrentUser() {
    return this.auth.currentUser;
  }

  //Obtiene al usuario completo de la base de datos y permite manejarlo en cualquier parte de la app
  getUserLogueado(): Usuario | null {
    return this.userSubject.value;
  }

  private async loadUserData(firebaseUser: FirebaseUser): Promise<Usuario> {
    const userDocRef = doc(this.firestore, `usuarios/${firebaseUser.uid}`);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data() as Usuario;
    }
    return {} as Usuario;
  }

  async loginWithGoogle(): Promise<any> {
    try {
      // Iniciar sesión con Google
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;

      if (!user || !user.email) {
        throw new Error('No se pudo obtener el correo del usuario.');
      }

      // Verificar el correo en Firestore
      const userEmail = user.email;

      const usersRef = collection(this.firestore, 'usuarios');
      const q = query(
        usersRef,
        where('email', '==', userEmail) // Verificar en el campo "email"
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        console.log('Usuario encontrado en el campo "email"', user);
        return user; // Usuario encontrado en el campo "email"
      }

      // Si no se encontró, buscar en el campo "emailGoogle"
      const qGoogle = query(
        usersRef,
        where('emailGoogle', '==', userEmail) // Verificar en el campo "emailGoogle"
      );
      const snapshotGoogle = await getDocs(qGoogle);

      if (!snapshotGoogle.empty) {
        console.log('Usuario encontrado en el campo "emailGoogle"', user);
        return user; // Usuario encontrado en el campo "emailGoogle"
      }

      // Si no se encontró en ninguna de las dos, devolver null
      return null;
    } catch (error) {
      console.error('Error en el login con Google:', error);
      throw error;
    }
  }

  async logOut(): Promise<void> {
    try {
      await this.notificationService.deleteToken();
      await signOut(this.auth);
      this.userSubject.next(null);
      localStorage.clear();
      this.router.navigate(['/login']);
    } catch (error) {
      this.toastService.showError(
        'Error al cerrar sesión. Este fue el motivo: ' + error
      );
    }
  }
}
